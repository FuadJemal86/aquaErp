const prisma = require("../prisma/prisma");

// Sales Report

const getSalesReport = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      customerName,
      transactionId,
      paymentMethod,
      bankBranch,
      customerType,
      startDate,
      endDate,
    } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Build where clause for filtering
    const whereClause = {
      isActive: true,
    };

    // Add filters if they are provided
    if (customerName) {
      whereClause.Customer = {
        full_name: {
          contains: customerName,
        },
      };
    }

    if (transactionId) {
      whereClause.transaction_id = {
        contains: transactionId,
      };
    }

    if (paymentMethod) {
      whereClause.payment_method = paymentMethod;
    }

    if (bankBranch) {
      whereClause.Bank_list = {
        branch: {
          contains: bankBranch,
        },
      };
    }

    if (customerType) {
      whereClause.customer_type = customerType;
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate + "T23:59:59.999Z");
      }
    }

    // Get total count for pagination with filters - count distinct transaction_ids
    const distinctTransactions = await prisma.sales_transaction.groupBy({
      by: ["transaction_id"],
      where: whereClause,
      _count: {
        transaction_id: true,
      },
    });
    const totalCount = distinctTransactions.length;

    // Get paginated sales transactions with filters - get distinct transaction_ids first
    const distinctTransactionIds = await prisma.sales_transaction.groupBy({
      by: ["transaction_id"],
      where: whereClause,
      orderBy: {
        transaction_id: "desc",
      },
      skip,
      take: pageSize,
    });

    // Get the actual sales data for these transaction_ids - only one record per transaction
    const sales = await prisma.sales_transaction.findMany({
      where: {
        transaction_id: {
          in: distinctTransactionIds.map((t) => t.transaction_id),
        },
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        type_id: true,
        bank_id: true,
        customer_id: true,
        walker_id: true,
        transaction_id: true,
        price_per_quantity: true,
        quantity: true,
        payment_method: true,
        customer_type: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        Product_type: {
          select: {
            id: true,
            name: true,
          },
        },
        Bank_list: {
          select: {
            id: true,
            branch: true,
          },
        },
        Customer: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });

    // Filter to get only one record per transaction_id (the first one)
    const uniqueSales = [];
    const seenTransactions = new Set();

    for (const sale of sales) {
      if (!seenTransactions.has(sale.transaction_id)) {
        uniqueSales.push(sale);
        seenTransactions.add(sale.transaction_id);
      }
    }

    const totalPages = Math.ceil(totalCount / pageSize);

    res.status(200).json({
      sales: uniqueSales,
      pagination: {
        currentPage: pageNumber,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "server error" });
  }
};

// Get Sales Details

const getSalesDetails = async (req, res) => {
  try {
    const { transaction_id } = req.params;

    if (!transaction_id) {
      return res.status(400).json({ message: "Transaction ID is required" });
    }
    const sales = await prisma.sales_transaction.findMany({
      where: {
        transaction_id: transaction_id,
      },
      select: {
        id: true,
        price_per_quantity: true,
        quantity: true,
        payment_method: true,
        createdAt: true,
        type_id: true,
        bank_id: true,
        customer_id: true,
        walker_id: true,
        transaction_id: true,

        updatedAt: true,
        Product_type: {
          select: {
            id: true,
            name: true,
          },
        },
        Bank_list: {
          select: {
            id: true,
            branch: true,
          },
        },
        Customer: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });
    res.status(200).json({ sales });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  getSalesReport,
  getSalesDetails,
};
