const prisma = require("../../prisma/prisma");

// Cash report with pagination
const productTransactions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            transactionId,
            categoryName,
            productName,
            startDate,
            endDate,
        } = req.query;

        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;

        const whereClause = { isActive: true };

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

        const [totalCount, rawTransactions] = await Promise.all([
            prisma.product_transaction.count({ where: whereClause }),

            prisma.product_transaction.findMany({
                where: whereClause,
                orderBy: { updatedAt: "desc" },
                skip,
                take: pageSize,
                select: {
                    id: true,
                    transaction_id: true,
                    manager_id: true,
                    casher_id: true,
                    type_id: true,
                    quantity: true,
                    price_per_quantity: true,
                    method: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                    Product_type: {
                        select: {
                            id: true,
                            name: true,
                            measurement: true,
                            Product_category: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            product_Stock: true,
                            createdAt: true,
                            updatedAt: true,
                        },
                    },
                },
            }),
        ]);

        // Filter by category and product name
        const filtered = rawTransactions.filter((tx) => {
            const categoryMatch = categoryName
                ? tx.Product_type?.Product_category?.name
                    ?.toLowerCase()
                    .includes(categoryName.toLowerCase())
                : true;

            const productMatch = productName
                ? tx.Product_type?.name
                    ?.toLowerCase()
                    .includes(productName.toLowerCase())
                : true;

            return categoryMatch && productMatch;
        });

        // Extract manager_id and casher_id for name mapping
        const userIds = [
            ...new Set(
                filtered.flatMap((tx) => [tx.manager_id, tx.casher_id]).filter(Boolean)
            ),
        ];

        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true },
        });

        const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

        // Inject names into each transaction object if needed (not changing structure)
        filtered.forEach((tx) => {
            tx.manager_name = tx.manager_id ? userMap[tx.manager_id] || null : null;
            tx.casher_name = tx.casher_id ? userMap[tx.casher_id] || null : null;
        });

        const totalPages = Math.ceil(totalCount / pageSize);

        return res.status(200).json({
            productTransactions: filtered,
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
        console.error("Error in productTransactions:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    productTransactions,
};
