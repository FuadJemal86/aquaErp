const prisma = require("../prisma/prisma");

const getDashboardData = async (req, res) => {
  try {
    // Get current date and calculate date ranges
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // 1. Sales Report Data
    const salesData = await prisma.sales_transaction.aggregate({
      where: {
        isActive: true,
        status: "DONE",
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        quantity: true,
        price_per_quantity: true,
      },
      _count: {
        id: true,
      },
    });

    // 2. Customer Count
    const customerCount = await prisma.customer.count({
      where: {
        isActive: true,
      },
    });

    // 3. Profit Calculation (Sales - Buy)
    // Calculate total sales money (price_per_quantity * quantity)
    const totalSalesAmount =
      (salesData._sum.price_per_quantity || 0) * (salesData._sum.quantity || 0);
    const totalSalesQuantity = salesData._sum.quantity || 0;

    const buyData = await prisma.buy_transaction.aggregate({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        total_money: true,
        quantity: true,
      },
    });

    const totalBuy = buyData._sum.total_money || 0;
    const totalBuyQuantity = buyData._sum.quantity || 0;
    const profit = totalSalesAmount - totalBuy;

    // 4. Money Income (Cash + Bank transactions)
    const cashBalance = await prisma.cash_transaction.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });

    const bankBalances = await prisma.bank_balance.findMany({
      include: {
        Bank_list: true,
      },
    });

    const totalBankBalance = bankBalances.reduce(
      (sum, balance) => sum + balance.balance,
      0
    );
    const totalIncome = (cashBalance?.balance || 0) + totalBankBalance;

    // 5. Product Stock Quantities (Doughnut Chart Data)
    const productStock = await prisma.product_stock.findMany({
      include: {
        Product_type: {
          include: {
            Product_category: true,
          },
        },
      },
      where: {
        isActive: true,
      },
    });

    const stockChartData = productStock.map((stock) => ({
      name: `${stock.Product_type.name} (${stock.Product_type.measurement})`,
      quantity: stock.quantity,
      category: stock.Product_type.Product_category.name,
    }));

    // 6. Monthly Progress Data (Line Chart)
    const monthlySales = await prisma.sales_transaction.groupBy({
      by: ["createdAt"],
      where: {
        isActive: true,
        status: "DONE",
        createdAt: {
          gte: new Date(currentYear, 0, 1), // Start of year
          lte: endOfMonth,
        },
      },
      _sum: {
        price_per_quantity: true,
        quantity: true,
      },
    });

    const monthlyBuy = await prisma.buy_transaction.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: new Date(currentYear, 0, 1), // Start of year
          lte: endOfMonth,
        },
      },
      _sum: {
        total_money: true,
        quantity: true,
      },
    });

    // Process monthly data for line chart
    const monthlyData = [];
    for (let month = 0; month <= currentMonth; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0, 23, 59, 59);

      const monthSales = monthlySales.filter(
        (sale) => sale.createdAt >= monthStart && sale.createdAt <= monthEnd
      );
      const monthBuy = monthlyBuy.filter(
        (buy) => buy.createdAt >= monthStart && buy.createdAt <= monthEnd
      );

      const salesTotal = monthSales.reduce(
        (sum, sale) =>
          sum + (sale._sum.price_per_quantity || 0) * (sale._sum.quantity || 0),
        0
      );
      const buyTotal = monthBuy.reduce(
        (sum, buy) => sum + (buy._sum.total_money || 0),
        0
      );

      monthlyData.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short" }),
        sales: salesTotal,
        buy: buyTotal,
      });
    }

    // 7. Bank Branch Balances
    const bankBranchData = bankBalances.map((balance) => ({
      branch: balance.Bank_list.branch,
      accountNumber: balance.Bank_list.account_number,
      owner: balance.Bank_list.owner,
      balance: balance.balance,
    }));

    // 8. Recent Transactions
    const recentSales = await prisma.sales_transaction.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        isActive: true,
        status: "DONE",
      },
      include: {
        Product_type: {
          include: {
            Product_category: true,
          },
        },
        Customer: true,
      },
    });

    const recentBuy = await prisma.buy_transaction.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Product_type: {
          include: {
            Product_category: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        // Summary Cards
        summary: {
          totalSales: salesData._count.id || 0,
          totalSalesAmount: totalSalesAmount,
          totalSalesQuantity: totalSalesQuantity,
          customerCount: customerCount,
          profit: profit,
          totalIncome: totalIncome,
          totalBuy: totalBuy,
          totalBuyQuantity: totalBuyQuantity,
        },

        // Balance Information
        balances: {
          cashBalance: cashBalance?.balance || 0,
          totalBankBalance: totalBankBalance,
          bankBranches: bankBranchData,
        },

        // Chart Data
        charts: {
          stockData: stockChartData,
          monthlyProgress: monthlyData,
        },

        // Recent Transactions
        recentTransactions: {
          sales: recentSales,
          buy: recentBuy,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardData,
};
