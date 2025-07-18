

// get buy report

const prisma = require("../../prisma/prisma");

const getBuyReport = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            supplier_name,
            transactionId,
            paymentMethod,
            bankBranch,
            startDate,
            endDate,
        } = req.query;

        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;

        // Build where clause for filtering
        const whereClause = {
            // isActive: true,
        };

        // Add filters if they are provided
        if (supplier_name) {
            whereClause.supplier_name = {
                contains: supplier_name,
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
        const distinctTransactions = await prisma.buy_transaction.groupBy({
            by: ["transaction_id"],
            where: whereClause,
            _count: {
                transaction_id: true,
            },
        });
        const totalCount = distinctTransactions.length;

        // Get paginated buy transactions with filters - get distinct transaction_ids first
        const distinctTransactionIds = await prisma.buy_transaction.groupBy({
            by: ["transaction_id"],
            where: whereClause,
            orderBy: {
                transaction_id: "desc",
            },
            skip,
            take: pageSize,
        });

        // Get the actual buy data for these transaction_ids - only one record per transaction
        const buy = await prisma.buy_transaction.findMany({
            where: {
                transaction_id: {
                    in: distinctTransactionIds.map((t) => t.transaction_id),
                },
                // isActive: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                type_id: true,
                bank_id: true,
                transaction_id: true,
                price_per_quantity: true,
                quantity: true,
                supplier_name: true,
                payment_method: true,
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
            },
        });

        // Filter to get only one record per transaction_id (the first one)
        const uniqueBuy = [];
        const seenTransactions = new Set();

        for (const buyReport of buy) {
            if (!seenTransactions.has(buyReport.transaction_id)) {
                uniqueBuy.push(buyReport);
                seenTransactions.add(buyReport.transaction_id);
            }
        }

        const totalPages = Math.ceil(totalCount / pageSize);

        res.status(200).json({
            buy: uniqueBuy,
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

// get buy detail

const getBuyDetails = async (req, res) => {
    try {
        const { transaction_id } = req.params;

        if (!transaction_id) {
            return res.status(400).json({ message: "Transaction ID is required" });
        }

        // Step 1: Fetch buy transactions
        const buy = await prisma.buy_transaction.findMany({
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
                supplier_name: true,
                manager_id: true,
                casher_id: true,
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
            },
        });

        // Step 2: Extract unique user IDs
        const userIds = Array.from(
            new Set(buy.flatMap((item) => [item.manager_id, item.casher_id]))
        ).filter(Boolean);

        // Step 3: Fetch user names
        const users = await prisma.user.findMany({
            where: {
                id: { in: userIds },
            },
            select: {
                id: true,
                name: true,
            },
        });

        const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

        // Step 4: Inject names directly into `buy` array
        buy.forEach((item) => {
            item.manager_name = userMap[item.manager_id] || null;
            item.casher_name = userMap[item.casher_id] || null;
        });

        // ✅ Final response in original style
        res.status(200).json({ buy });
    } catch (error) {
        console.error("Error in getBuyDetails:", error);
        res.status(500).json({ message: error.message });
    }
};



module.exports = {
    getBuyReport,
    getBuyDetails,
};
