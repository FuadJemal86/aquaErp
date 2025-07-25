const prisma = require("../prisma/prisma");

const checkShortagesAndOverdueCredits = async (req, res) => {
    try {
        const messages = [];

        //  Product stock < 10
        const lowStockProducts = await prisma.product_stock.findMany({
            where: { quantity: { lt: 10 }, isActive: true },
            include: { Product_type: true },
        });

        for (const stock of lowStockProducts) {
            messages.push(`Low stock: "${stock.Product_type.name}" has only ${stock.quantity} left.`);
        }

        //  Overdue Sales Credits
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // filtering if the return date is today with there id
        const creditsToUpdate = await prisma.sales_credit.findMany({
            where: {
                status: {
                    not: "OVERDUE",
                },
                return_date: {
                    lt: today,
                },
            },
            select: {
                id: true,
            },
        });

        //  Extract the IDs to update
        const overdueIds = creditsToUpdate.map((c) => c.id);

        // Update only if there are any
        if (overdueIds.length > 0) {
            await prisma.sales_credit.updateMany({
                where: {
                    id: {
                        in: overdueIds,
                    },
                },
                data: {
                    status: "OVERDUE",
                },
            });
        }
        const overdueSales = await prisma.sales_credit.findMany({
            where: {
                status: 'OVERDUE',
                isActive: true,
            },
            include: { Customer: true },
        });

        for (const credit of overdueSales) {
            messages.push(`Sales credit overdue: Customer "${credit.Customer.full_name}" owes ${credit.total_money}.`);

        }

        //  Overdue Buy Credits
        today.setHours(0, 0, 0, 0);

        const buyCreditsToUpdate = await prisma.buy_credit.findMany({
            where: {
                status: {
                    not: "OVERDUE",
                },
                return_date: {
                    lt: today,
                },
            },
            select: {
                id: true,
            },
        });

        //  Extract the IDs to update
        const buyOverdueIds = buyCreditsToUpdate.map((c) => c.id);

        // Update only if there are any
        if (buyOverdueIds.length > 0) {
            await prisma.buy_credit.updateMany({
                where: {
                    id: {
                        in: buyOverdueIds,
                    },
                },
                data: {
                    status: "OVERDUE",
                },
            });
        }

        const overdueBuys = await prisma.buy_credit.findMany({
            where: {
                status: 'OVERDUE',
                isActive: true,
            },
        });

        for (const credit of overdueBuys) {
            const transaction = await prisma.buy_transaction.findFirst({
                where: { transaction_id: credit.transaction_id },
            });

            const supplierName = transaction?.supplier_name || 'Unknown Supplier';

            messages.push(`Buy credit overdue: Supplier "${supplierName}" is owed ${credit.total_money}.`);
        }

        if (messages.length === 0) {
            return res.json({ status: true, message: 'No alerts. Everything is up to date.' });
        }

        return res.json({ status: true, notifications: messages });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { checkShortagesAndOverdueCredits };
