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

        // Build where clause for filtering product_transaction
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

        // Get all matching product transactions
        const [totalCount, productTransactions] = await Promise.all([
            prisma.product_transaction.count({
                where: whereClause,
            }),

            prisma.product_transaction.findMany({
                where: whereClause,
                orderBy: {
                    updatedAt: "desc",
                },
                skip,
                take: pageSize,
                include: {
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

        // Optional filtering by categoryName or productName after join
        const filtered = productTransactions.filter((tx) => {
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

        const totalPages = Math.ceil(totalCount / pageSize);

        res.status(200).json({
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
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    productTransactions,
};
