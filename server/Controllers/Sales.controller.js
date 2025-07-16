const { Sales_product } = require("../Model/Validation");
const {
  generateTransactionId,
  generateWalkingId,
} = require("../Utils/GenerateTransactionId");
const prisma = require("../prisma/prisma");

// sell product
const sellProduct = async (req, res) => {
  try {
    const {
      customer_type,
      customer_id,
      payment_method,
      bank_id,
      return_date,
      cart_list,
      description,
    } = req.body;

    // Validate request body
    const validate = Sales_product.validate(req.body);
    if (validate.error) {
      return res
        .status(400)
        .json({ message: validate.error.details[0].message });
    }

    const transaction_id = generateTransactionId();
    const total_money = cart_list.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Check for duplicate product types in cart list
    const typeIds = cart_list.map((item) => item.type_id);
    const uniqueTypeIds = [...new Set(typeIds)];

    if (typeIds.length !== uniqueTypeIds.length) {
      return res.status(400).json({
        message:
          "Product already selected. Each product type can only be added once to the cart.",
      });
    }

    // Use Prisma transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Create Sales_transaction records for each cart item
      const salesTransactions = [];
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

        // get product stock
        let available_quantity = 0;
        const productStock = await tx.product_stock.findFirst({
          where: {
            product_type_id: item.type_id,
          },
        });
        // if product stock is not found, throw an error
        if (!productStock) {
          throw new Error("Product stock not found");
        }

        // Check if available quantity is sufficient
        if (productStock.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock. Available: ${productStock.quantity}, Requested: ${item.quantity}`
          );
        }

        // Calculate new quantity and amount_money
        const newQuantity = productStock.quantity - item.quantity;

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

        const salesTransaction = await tx.sales_transaction.create({
          data: {
            price_per_quantity: item.price,
            quantity: item.quantity,
            payment_method,
            customer_type,
            status: "DONE",
            transaction_id,
            type_id: item.type_id,
            customer_id: customer_type === "REGULAR" ? customer_id : null,
            walker_id: customer_type === "WALKER" ? generateWalkingId() : null,
            // manager_id: 1, // You might want to get from auth
            // casher_id: 1, // You might want to get from auth
            bank_id: payment_method === "BANK" ? bank_id : null, // Default bank for CASH/CREDIT
          },
        });
        salesTransactions.push(salesTransaction);
      }

      // Handle payment method specific logic
      if (payment_method === "CREDIT") {
        // Format return_date for Sales_credit
        let formattedCreditReturnDate = null;
        if (return_date) {
          try {
            const dateObj = new Date(return_date);
            if (!isNaN(dateObj.getTime())) {
              formattedCreditReturnDate = dateObj.toISOString();
            }
          } catch (error) {
            console.error(
              "Invalid return_date format for Sales_credit:",
              return_date
            );
          }
        }

        // Create Sales_credit record (only for REGULAR customers)
        if (customer_type === "REGULAR" && customer_id) {
          const salesCredit = await tx.sales_credit.create({
            data: {
              customer_id,
              transaction_id,
              total_money,
              return_date: formattedCreditReturnDate,
              status: "ACCEPTED",
              issued_date: new Date(),
              description,
            },
          });
        }
      } else if (payment_method === "BANK") {
        // Check bank balance
        const check_bank_balance = await tx.bank_balance.findFirst({
          where: {
            bank_id: bank_id,
          },
        });

        if (!check_bank_balance) {
          throw new Error("Bank balance not found");
        }

        // Create Bank_transaction (money coming in for sales)
        await tx.bank_transaction.create({
          data: {
            in: total_money,
            out: 0,
            balance: check_bank_balance.balance + total_money,
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
            balance: check_bank_balance.balance + total_money,
          },
        });
      } else if (payment_method === "CASH") {
        // Create Cash_transaction (money coming in for sales)
        let currentCashBalance = 0;

        try {
          const check_cash_balance = await tx.cash_balance.findFirst({
            where: {
              id: 1,
            },
          });

          if (check_cash_balance) {
            currentCashBalance = check_cash_balance.balance;
          }
        } catch (error) {
          console.log("Cash balance not found, starting with 0");
        }

        await tx.cash_transaction.create({
          data: {
            in: total_money,
            out: 0,
            balance: total_money + currentCashBalance,
            transaction_id,
            manager_id: 1, // You might want to get from auth
            casher_id: 1, // You might want to get from auth
          },
        });

        // Update cash balance if it exists
        try {
          await tx.cash_balance.upsert({
            where: { id: 1 },
            update: {
              balance: total_money + currentCashBalance,
            },
            create: {
              id: 1,
              balance: total_money + currentCashBalance,
            },
          });
        } catch (error) {
          console.log("Could not update cash balance");
        }
      } else {
        throw new Error("Invalid payment method");
      }

      return {
        message: "Sale completed successfully",
        transaction_id,
        total_money,
        salesTransactions,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Error in sellProduct:", error);

    // Handle specific error types
    if (error.message) {
      // Handle transaction errors (bank balance, invalid payment method, etc.)
      if (error.message.includes("Bank balance not found")) {
        return res.status(400).json({ message: "Bank balance not found" });
      }
      if (error.message.includes("Invalid payment method")) {
        return res
          .status(400)
          .json({ message: "Invalid payment method provided" });
      }
      if (error.message.includes("Insufficient stock")) {
        return res.status(400).json({ message: error.message });
      }
      if (error.message.includes("Product stock not found")) {
        return res.status(400).json({ message: "Product stock not found" });
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

// sales credit report
const salesCreditReport = async (req, res) => {
  try {
    // Get all sales credit entries
    const getSalesCreditReport = await prisma.sales_credit.findMany();

    if (getSalesCreditReport.length === 0) {
      return res
        .status(404)
        .json({ status: false, error: "Sales credit report not found" });
    }

    // Extract all unique customer_ids
    const customerIds = [
      ...new Set(getSalesCreditReport.map((item) => item.customer_id)),
    ];

    // Fetch customer info based on those IDs
    const customers = await prisma.customer.findMany({
      where: {
        id: { in: customerIds },
      },
      select: {
        id: true,
        full_name: true,
      },
    });

    // Create a map for fast lookup
    const customerMap = {};
    customers.forEach((cust) => {
      customerMap[cust.id] = cust.full_name;
    });

    // Append customer name to each sales credit report
    const reportWithCustomerName = getSalesCreditReport.map((report) => ({
      ...report,
      customer_name: customerMap[report.customer_id] || "Unknown",
    }));

    return res.status(200).json({ status: true, data: reportWithCustomerName });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      error: "Internal server error",
    });
  }
};

// detail sales credit report
const detailSalesCredit = async (req, res) => {
  const transaction_id = req.params.transaction_id;
  console.log(transaction_id);

  try {
    // Fetch sales transactions
    const getDetailSalesCredit = await prisma.sales_transaction.findMany({
      where: {
        transaction_id: transaction_id,
      },
      select: {
        id: true,
        price_per_quantity: true,
        payment_method: true,
        manager_id: true,
        customer_id: true,
        customer_type: true,
        status: true,
        quantity: true,
        Product_type: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (getDetailSalesCredit.length === 0) {
      return res
        .status(404)
        .json({ status: false, error: "Sales credit detail not found" });
    }

    const userIds = Array.from(
      new Set(
        getDetailSalesCredit.flatMap((item) => [
          item.manager_id,
          item.customer_id,
        ])
      )
    ).filter(Boolean);

    //  Fetch users
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });

    const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

    // Mutate original result in place to add names
    getDetailSalesCredit.forEach((item) => {
      item.manager_name = userMap[item.manager_id] || null;
      item.cashier_name = userMap[item.customer_id] || null;
    });

    //  Return in original structure
    return res.status(200).json({ status: true, data: getDetailSalesCredit });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      error: "Internal server error",
    });
  }
};

// List of credit

module.exports = { sellProduct, salesCreditReport, detailSalesCredit };
