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

    const whereClause = {
      isActive: true,
    };

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

    const totalCount = await prisma.cash_transaction.count({
      where: whereClause,
    });

    const cashTransactionsRaw = await prisma.cash_transaction.findMany({
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

    // Get unique manager_ids
    const managerIds = Array.from(
      new Set(cashTransactionsRaw.map(t => t.manager_id).filter(Boolean))
    );

    // Get manager names
    const managers = await prisma.user.findMany({
      where: { id: { in: managerIds } },
      select: { id: true, name: true },
    });

    const managerMap = Object.fromEntries(
      managers.map(m => [m.id, m.name])
    );

    // Add manager_name to each transaction
    const cashTransactions = cashTransactionsRaw.map(t => ({
      ...t,
      manager_name: t.manager_id ? managerMap[t.manager_id] || null : null,
      casher_name: t.casher_id ? managerMap[t.casher_id] || null : null,
    }));

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
