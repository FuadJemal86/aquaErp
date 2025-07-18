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

    const whereClause = {
      isActive: true,
    };

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

    // Fetch paginated transactions
    const [totalCount, bankTransactions] = await Promise.all([
      prisma.bank_transaction.count({ where: whereClause }),

      prisma.bank_transaction.findMany({
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
          manager_id: true,
          casher_id: true,
          Bank_list: {
            select: {
              id: true,
              branch: true,
              account_number: true,
            },
          },
        },
      }),
    ]);

    // Get distinct user IDs to fetch names
    const userIds = [
      ...new Set(
        bankTransactions
          .flatMap(tx => [tx.manager_id, tx.casher_id])
          .filter(Boolean)
      ),
    ];

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });

    const userMap = Object.fromEntries(users.map(user => [user.id, user.name]));

    // Inject manager_name and casher_name
    bankTransactions.forEach(tx => {
      tx.manager_name = tx.manager_id ? userMap[tx.manager_id] || null : null;
      tx.casher_name = tx.casher_id ? userMap[tx.casher_id] || null : null;
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
    console.log("Error in bankTransaction:", error);
    res.status(500).json({ message: "server error" });
  }
};


module.exports = {
  bankTransaction,
};
