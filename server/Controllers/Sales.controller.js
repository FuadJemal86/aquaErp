const { Sales_product } = require("../Model/Validation");
const {
  generateTransactionId,
  generateWalkingId,
} = require("../Utils/GenerateTransactionId");
const prisma = require("../prisma/prisma");

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
    if (req.body.customer_id) {
      req.body.customer_id = parseInt(req.body.customer_id);
    }
    const validate = Sales_product.validate(req.body);
    if (validate.error) {
      return res
        .status(400)
        .json({ message: validate.error.details[0].message });
    }

    // Get user info from middleware
    const userId = req.userId;
    const role = req.role;

    const responsibleField =
      role === "ADMIN"
        ? { manager_id: userId }
        : role === "CASHER"
          ? { casher_id: userId }
          : {};


    const transaction_id = generateTransactionId();
    const total_money = cart_list.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const typeIds = cart_list.map((item) => item.type_id);
    const uniqueTypeIds = [...new Set(typeIds)];
    if (typeIds.length !== uniqueTypeIds.length) {
      return res.status(400).json({
        message:
          "Product already selected. Each product type can only be added once to the cart.",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const salesTransactions = [];

      for (const item of cart_list) {
        let formattedReturnDate = null;
        if (payment_method === "CREDIT" && return_date) {
          try {
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
            product_type_id: item.type_id,
          },
        });

        if (!productStock) {
          throw new Error("Product stock not found");
        }

        if (productStock.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock. Available: ${productStock.quantity}, Requested: ${item.quantity}`
          );
        }

        const newQuantity = productStock.quantity - item.quantity;
        const newAmountMoney = newQuantity * productStock.price_per_quantity;

        await tx.product_stock.update({
          where: { id: productStock.id },
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
            bank_id: payment_method === "BANK" ? bank_id : null,
            ...responsibleField

          },
        });

        salesTransactions.push(salesTransaction);

        await tx.product_transaction.create({
          data: {
            transaction_id,
            type_id: item.type_id,
            quantity: item.quantity,
            price_per_quantity: item.price,
            ...responsibleField,
            method: "OUT",
            isActive: true,
          },
        });
      }

      if (payment_method === "CREDIT") {
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

        if (customer_type === "REGULAR" && customer_id) {
          await tx.sales_credit.create({
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
        const check_bank_balance = await tx.bank_balance.findFirst({
          where: { bank_id },
        });

        if (!check_bank_balance) {
          throw new Error("Bank balance not found");
        }

        await tx.bank_transaction.create({
          data: {
            in: total_money,
            out: 0,
            balance: check_bank_balance.balance + total_money,
            ...responsibleField,
            transaction_id,
            bank_id,
          },
        });

        await tx.bank_balance.update({
          where: { id: check_bank_balance.id },
          data: {
            balance: check_bank_balance.balance + total_money,
          },
        });
      } else if (payment_method === "CASH") {
        let currentCashBalance = 0;

        const check_cash_balance = await tx.cash_balance.findFirst({
          where: { id: 1 },
        });

        if (check_cash_balance) {
          currentCashBalance = check_cash_balance.balance;
        }

        await tx.cash_transaction.create({
          data: {
            in: total_money,
            out: 0,
            balance: total_money + currentCashBalance,
            transaction_id,
            ...responsibleField,
          },
        });

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

    if (error.message) {
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
      if (error.code === "P1008") {
        return res
          .status(408)
          .json({ message: "Request timeout. Please try again." });
      }
      return res.status(500).json({ message: error.message });
    }

    res.status(500).json({ message: "Network error." });
  }
};

// sales credit report
const salesCreditReport = async (req, res) => {
  try {
    // Extract query parameters for pagination and filtering
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter conditions
    const whereConditions = {
      isActive: true,
    };

    // Add filter conditions based on query parameters
    if (req.query.transactionId) {
      whereConditions.transaction_id = {
        contains: req.query.transactionId,
      };
    }

    if (req.query.customerName) {
      // First find customer IDs that match the name
      const customers = await prisma.customer.findMany({
        where: {
          full_name: {
            contains: req.query.customerName,
          },
        },
        select: {
          id: true,
        },
      });

      const customerIds = customers.map((c) => c.id);
      whereConditions.customer_id = {
        in: customerIds,
      };
    }

    if (req.query.status) {
      whereConditions.status = req.query.status;
    }

    if (req.query.startDate) {
      whereConditions.issued_date = {
        gte: new Date(req.query.startDate),
      };
    }

    if (req.query.endDate) {
      whereConditions.issued_date = {
        ...whereConditions.issued_date,
        lte: new Date(req.query.endDate),
      };
    }

    // Get total count of records (for pagination)
    const totalCount = await prisma.sales_credit.count({
      where: whereConditions,
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated sales credit entries
    const getSalesCreditReport = await prisma.sales_credit.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        issued_date: "desc",
      },
    });

    if (getSalesCreditReport.length === 0) {
      return res.status(200).json({
        status: true,
        data: {
          credits: [],
          pagination: {
            currentPage: page,
            pageSize: limit,
            totalCount: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      });
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

    return res.status(200).json({
      status: true,
      data: {
        credits: reportWithCustomerName,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    });
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
  const transaction_id = req.params.transactionId;

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
        casher_id: true,
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

// get all customer for sale
const getAllCustomerForSale = async (req, res) => {
  const customers = await prisma.customer.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      full_name: true,
      phone: true,
      address: true,
    },
  });
  return res.status(200).json({ status: true, customers: customers });
};

// List of credit

module.exports = {
  sellProduct,
  salesCreditReport,
  detailSalesCredit,
  getAllCustomerForSale,
};
