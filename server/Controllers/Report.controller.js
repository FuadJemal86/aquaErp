const prisma = require("../prisma/prisma");

// Sales Report

const salesReport = async (req, res) => {
  try {
    const sales = await prisma.sales_transaction.findMany({
      distinct: ["transaction_id"],
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
    res.status(200).json({ sales });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Sales Details

const getSalesDetails = async (req, res) => {
  try {
    const { transaction_id } = req.params;
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
  salesReport,
  getSalesDetails,
};
