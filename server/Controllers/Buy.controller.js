const { Buy_product } = require("../Model/Validation");
const { generateTransactionId } = require("../Utils/GenerateTransactionId");
const prisma = require("../prisma/prisma");

// buy product
const buyProduct = async (req, res) => {
  try {
    const {
      supplier_name,
      payment_method,
      bank_id,
      return_date,
      cart_list,
      description,
    } = req.body;

    // Validate request body
    const validate = Buy_product.validate(req.body);
    if (validate.error) {
      return res
        .status(400)
        .json({ message: validate.error.details[0].message });
    }

    const transaction_id = generateTransactionId();
    const total_money = cart_list.reduce(
      (acc, item) => acc + item.price_per_quantity * item.quantity,
      0
    );

    // Use Prisma transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Create Buy_transaction records for each cart item
      const buyTransactions = [];
      for (const item of cart_list) {
        // Format return_date properly for Prisma
        let formattedReturnDate = null;
        if (payment_method === "CREDIT" && return_date) {
          try {
            // Convert date string to ISO DateTime format
            const dateObj = new Date(return_date);
            if (!isNaN(dateObj.getTime())) {
              formattedReturnDate = dateObj.toISOString();
            }
          } catch (error) {
            console.error("Invalid return_date format:", return_date);
          }
        }

        const productStock = await tx.product_stock.findFirst({
          where: {
            product_type_id: item.product_type_id,
          },
        });
        // if product stock is not found, throw an error
        if (!productStock) {
          throw new Error("Product stock not found");
        }

        // Calculate new quantity and amount_money
        const newQuantity = productStock.quantity + item.quantity;

        const newAmountMoney = newQuantity * productStock.price_per_quantity;

        // Update the product stock
        await tx.product_stock.update({
          where: {
            id: productStock.id,
          },
          data: {
            quantity: newQuantity,
            amount_money: newAmountMoney,
          },
        });

        const buyTransaction = await tx.buy_transaction.create({
          data: {
            price_per_quantity: item.price_per_quantity,
            quantity: item.quantity,
            payment_method,
            total_money: item.price_per_quantity * item.quantity,
            supplier_name,
            transaction_id,
            type_id: item.product_type_id,
            bank_id: payment_method === "BANK" ? bank_id : null,
            return_date:
              payment_method === "CREDIT" ? formattedReturnDate : null,
          },
        });
        buyTransactions.push(buyTransaction);
      }

      // Handle payment method specific logic
      if (payment_method === "CREDIT") {
        // Format return_date for Buy_credit
        let formattedCreditReturnDate = null;
        if (return_date) {
          try {
            const dateObj = new Date(return_date);
            if (!isNaN(dateObj.getTime())) {
              formattedCreditReturnDate = dateObj.toISOString();
            }
          } catch (error) {
            console.error(
              "Invalid return_date format for Buy_credit:",
              return_date
            );
          }
        }

        // Create Buy_credit record
        await tx.buy_credit.create({
          data: {
            transaction_id,
            total_money,
            return_date: formattedCreditReturnDate,
            status: "ACCEPTED",
            issued_date: new Date(),
            description,
          },
        });
      } else if (payment_method === "BANK") {
        // Check bank balance
        const check_bank_balance = await tx.bank_balance.findFirst({
          where: {
            Bank_id: bank_id,
          },
        });

        if (!check_bank_balance) {
          throw new Error("Bank balance not found");
        }

        if (check_bank_balance.balance < total_money) {
          throw new Error("Bank balance not enough");
        }

        // Create Bank_transaction
        await tx.bank_transaction.create({
          data: {
            out: total_money,
            in: 0,
            balance: check_bank_balance.balance - total_money,
            transaction_id,
            bank_id,
          },
        });

        // Update bank balance
        await tx.bank_balance.update({
          where: {
            id: check_bank_balance.id,
          },
          data: {
            balance: check_bank_balance.balance - total_money,
          },
        });
      } else if (payment_method === "CASH") {
        // Create Cash_transaction
        await tx.cash_transaction.create({
          data: {
            out: total_money,
            in: 0,
            balance: 0, // You might want to get current cash balance
            transaction_id,
            manager_id: 1, // You might want to get from auth
            casher_id: 1, // You might want to get from auth
          },
        });
      } else {
        throw new Error("Invalid payment method");
      }

      return {
        message: "Purchase completed successfully",
        transaction_id,
        total_money,
        buyTransactions,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Error in buyProduct:", error);

    // Handle specific error types
    if (error.message) {
      // Handle transaction errors (bank balance, invalid payment method, etc.)
      if (error.message.includes("Bank balance not found")) {
        return res.status(400).json({ message: "Bank balance not found" });
      }
      if (error.message.includes("Bank balance not enough")) {
        return res
          .status(400)
          .json({ message: "Insufficient bank balance for this transaction" });
      }
      if (error.message.includes("Invalid payment method")) {
        return res
          .status(400)
          .json({ message: "Invalid payment method provided" });
      }
      if (error.message.includes("Bank balance not found")) {
        return res
          .status(400)
          .json({ message: "Selected bank account not found" });
      }

      // Handle validation errors
      if (error.message.includes("validation")) {
        return res.status(400).json({ message: error.message });
      }

      // Handle timeout errors
      if (error.code === "P1008") {
        return res
          .status(408)
          .json({ message: "Request timeout. Please try again." });
      }

      // For other known errors, return the specific message
      return res.status(500).json({ message: error.message });
    }

    // Fallback for unknown errors
    res.status(500).json({
      message: "Network error.",
    });
  }
};

// buy credit report
const buyCreditReport = async (req, res) => {
  try {
    const getBuyCreditReport = await prisma.buy_credit.findMany();

    if (getBuyCreditReport.length === 0) {
      return res.status(404).json({ status: false, error: 'Buy credit report not found' });
    }

    return res.status(200).json({ status: true, data: getBuyCreditReport });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      error: 'Internal server error'
    });
  }
};


// detail buy credit report
const detailBuyCredit = async (req, res) => {
  const transaction_id = req.params.id;

  try {
    const getDetailBuyCreditReport = await prisma.buy_transaction.findMany({
      where: {
        transaction_id: transaction_id
      },
      include: {
        Product_type: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (getDetailBuyCreditReport.length === 0) {
      return res.status(404).json({ status: false, error: 'Buy credit detail not found' });
    }

    return res.status(200).json({ status: true, data: getDetailBuyCreditReport });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      error: 'Internal server error'
    });
  }
};


module.exports = { buyProduct, buyCreditReport, detailBuyCredit };
