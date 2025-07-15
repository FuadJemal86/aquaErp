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

        // Build where clause for filtering
        const whereClause = {
            isActive: true,
        };

        if (categoryName) {
            whereClause.Product_category = {
                name: {
                    contains: categoryName,
                },
            };
        }

        if (productName) {
            whereClause.name = {
                contains: productName,
            };
        }



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
        const totalCount = await prisma.product_type.count({
            where: whereClause,
        });

        // Get paginated cash transactions
        const productTransaction = await prisma.product_type.findMany({
            where: whereClause,
            orderBy: {
                updatedAt: "desc",
            },
            skip,
            take: pageSize,
            select: {
                id: true,
                name: true,
                measurement: true,
                updatedAt: true,
                product_Stock: true,
                Product_category: true,
                createdAt: true,
            },
        });


        const totalPages = Math.ceil(totalCount / pageSize);

        res.status(200).json({
            productTransaction,
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
    productTransactions,
};
