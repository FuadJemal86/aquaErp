const prisma = require("../prisma/prisma");

const getDashboardData = async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query;

    // Helper function to get date range based on filter
    const getDateRange = (filterType) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (filterType) {
        case "today":
          return {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          };
        case "yesterday":
          const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
          return {
            gte: yesterday,
            lt: today,
          };
        case "this-week":
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          return {
            gte: startOfWeek,
            lt: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000),
          };
        case "last-week":
          const lastWeekStart = new Date(today);
          lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
          const lastWeekEnd = new Date(
            lastWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000
          );
          return {
            gte: lastWeekStart,
            lt: lastWeekEnd,
          };
        case "this-month":
          return {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
            lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          };
        case "last-month":
          return {
            gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            lt: new Date(now.getFullYear(), now.getMonth(), 1),
          };
        default:
          return null; // all-time
      }
    };

    // Get date range based on filter
    const dateRange =
      filter && filter !== "all-time" ? getDateRange(filter) : null;

    // If custom date range is provided, use it instead
    const finalDateRange =
      startDate && endDate
        ? {
            gte: new Date(startDate),
            lt: new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000), // Include end date
          }
        : dateRange;

    // Build where clause for date filtering
    const dateWhereClause = finalDateRange ? { createdAt: finalDateRange } : {};

    // Basic counts with date filtering
    const totalSales = await prisma.sales_transaction.count({
      where: dateWhereClause,
    });

    const totalBuys = await prisma.buy_transaction.count({
      where: dateWhereClause,
    });

    // Credit pending with date filtering
    const credutPending = await prisma.sales_credit.findMany({
      where: {
        status: {
          in: ["ACCEPTED", "OVERDUE"],
        },
        ...dateWhereClause,
      },
    });

    const creditPendingAmount = credutPending.reduce(
      (acc, curr) => acc + curr.total_money,
      0
    );

    // Sales money calculations with date filtering
    const salesMoney = await prisma.sales_transaction.findMany({
      where: dateWhereClause,
      select: {
        total_money: true,
        quantity: true,
      },
    });

    const salesMoneyAmount = salesMoney.reduce(
      (acc, curr) => acc + (curr.total_money || 0),
      0
    );

    const totalSalesQuantity = salesMoney.reduce(
      (acc, curr) => acc + (curr.quantity || 0),
      0
    );

    // Buy money calculations with date filtering
    const buyMoney = await prisma.buy_transaction.findMany({
      where: dateWhereClause,
      select: {
        total_money: true,
        quantity: true,
      },
    });

    const buyMoneyAmount = buyMoney.reduce(
      (acc, curr) => acc + (curr.total_money || 0),
      0
    );

    const profit = salesMoneyAmount - buyMoneyAmount;

    // Balance overview (these don't need date filtering as they're current balances)
    const cashBalance = await prisma.cash_balance.findMany({
      select: {
        balance: true,
      },
    });

    const cashBalanceAmount = cashBalance.reduce(
      (acc, curr) => acc + (curr.balance || 0),
      0
    );

    const bankBranchBalance = await prisma.bank_balance.findMany({
      select: {
        balance: true,
      },
    });

    const bankBranchBalanceAmount = bankBranchBalance.reduce(
      (acc, curr) => acc + (curr.balance || 0),
      0
    );

    const totalAsset = cashBalanceAmount + bankBranchBalanceAmount;

    // Bank branch details
    const bankBranchBalanceList = await prisma.bank_balance.findMany({
      select: {
        balance: true,
        Bank_list: {
          select: {
            branch: true,
            account_number: true,
            owner: true,
          },
        },
      },
    });

    // Product stock (current stock, no date filtering needed)
    const productStock = await prisma.product_stock.findMany({
      select: {
        quantity: true,
        Product_type: {
          select: {
            name: true,
            Product_category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Monthly progress data (last 12 months) - this stays the same as it shows historical trends
    const monthlyProgress = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const nextMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        1
      );

      const monthName = monthDate.toLocaleString("default", { month: "short" });

      // Get sales for this month
      const monthlySales = await prisma.sales_transaction.findMany({
        where: {
          createdAt: {
            gte: monthDate,
            lt: nextMonth,
          },
        },
        select: {
          total_money: true,
        },
      });

      const monthlySalesAmount = monthlySales.reduce(
        (acc, curr) => acc + (curr.total_money || 0),
        0
      );

      // Get buy for this month
      const monthlyBuys = await prisma.buy_transaction.findMany({
        where: {
          createdAt: {
            gte: monthDate,
            lt: nextMonth,
          },
        },
        select: {
          total_money: true,
        },
      });

      const monthlyBuyAmount = monthlyBuys.reduce(
        (acc, curr) => acc + (curr.total_money || 0),
        0
      );

      monthlyProgress.push({
        month: monthName,
        sales: monthlySalesAmount,
        buy: monthlyBuyAmount,
      });
    }

    res.status(200).json({
      summary: {
        totalSales,
        totalSalesAmount: salesMoneyAmount,
        totalSalesQuantity,
        profit,
        totalBuy: totalBuys,
        creditPending: creditPendingAmount,
      },
      balances: {
        cashBalance: cashBalanceAmount,
        totalBankBalance: bankBranchBalanceAmount,
        bankBranches: bankBranchBalanceList.map((item) => ({
          branch: item.Bank_list.branch,
          accountNumber: item.Bank_list.account_number,
          owner: item.Bank_list.owner,
          balance: item.balance,
        })),
      },
      charts: {
        stockData: productStock.map((item) => ({
          name: item.Product_type.name,
          quantity: item.quantity,
          category: item.Product_type.Product_category.name,
        })),
        monthlyProgress,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboardData,
};
