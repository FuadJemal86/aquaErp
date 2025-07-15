const prisma = require("../../prisma/prisma");

// Cash report with pagination
const cashReport = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      transactionId,
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

    if (startDate || endDate) {
      whereClause.updatedAt = {};
      if (startDate) {
        whereClause.updatedAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.updatedAt.lte = new Date(endDate + "T23:59:59.999Z");
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.cash_transaction.count({
      where: whereClause,
    });

    // Get paginated cash transactions
    const cashTransactions = await prisma.cash_transaction.findMany({
      where: whereClause,
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: pageSize,
      select: {
        id: true,
        in: true,
        out: true,
        balance: true,
        transaction_id: true,
        manager_id: true,
        casher_id: true,
        updatedAt: true,
      },
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    res.status(200).json({
      cashTransactions,
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
  cashReport,
};
