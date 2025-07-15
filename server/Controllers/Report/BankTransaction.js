const prisma = require("../../prisma/prisma");

// Bank transaction report with pagination
const bankTransaction = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      transactionId,
      bankBranch,
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
    if (transactionId) {
      whereClause.transaction_id = {
        contains: transactionId,
      };
    }

    if (bankBranch) {
      whereClause.Bank_list = {
        branch: {
          contains: bankBranch,
        },
      };
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

    // Get total count for pagination
    const totalCount = await prisma.bank_transaction.count({
      where: whereClause,
    });

    // Get paginated bank transactions
    const bankTransactions = await prisma.bank_transaction.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
      select: {
        id: true,
        in: true,
        out: true,
        balance: true,
        transaction_id: true,
        description: true,
        receipt_image: true,
        createdAt: true,
        Bank_list: {
          select: {
            id: true,
            branch: true,
            account_number: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    res.status(200).json({
      bankTransactions,
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

module.exports = {
  bankTransaction,
};
