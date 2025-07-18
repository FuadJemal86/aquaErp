const { Buy_product } = require("../Model/Validation");
const { generateTransactionId } = require("../Utils/GenerateTransactionId");
const prisma = require("../prisma/prisma");
const jwt = require('jsonwebtoken')
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
      return res.status(400).json({ message: validate.error.details[0].message });
    }

    // Get user info from JWT in cookies
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    let userId = null;
    let role = null;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
      role = decoded.role;
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const transaction_id = generateTransactionId();
    const total_money = cart_list.reduce(
      (acc, item) => acc + item.price_per_quantity * item.quantity,
      0
    );

    const result = await prisma.$transaction(async (tx) => {
      const buyTransactions = [];

      //  Move inside transaction scope
      const managerId = role === "ADMIN" ? userId : null;
      const casherId = role === "CASHER" ? userId : null;

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
            product_type_id: item.product_type_id,
          },
        });

        if (!productStock) {
          throw new Error("Product stock not found");
        }

        const newQuantity = productStock.quantity + item.quantity;
        const newAmountMoney = newQuantity * productStock.price_per_quantity;

        await tx.product_stock.update({
          where: { id: productStock.id },
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
            manager_id: managerId,
            casher_id: casherId,
            transaction_id,
            type_id: item.product_type_id,
            bank_id: payment_method === "BANK" ? bank_id : null,
            return_date:
              payment_method === "CREDIT" ? formattedReturnDate : null,
          },
        });

        buyTransactions.push(buyTransaction);

        await tx.product_transaction.create({
          data: {
            transaction_id,
            type_id: item.product_type_id,
            quantity: item.quantity,
            price_per_quantity: item.price_per_quantity,
            method: "IN",
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
            console.error("Invalid return_date format for Buy_credit:", return_date);
          }
        }

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
        const check_bank_balance = await tx.bank_balance.findFirst({
          where: { bank_id },
        });

        if (!check_bank_balance) {
          throw new Error("Bank balance not found");
        }

        if (check_bank_balance.balance < total_money) {
          throw new Error("Bank balance not enough");
        }

        await tx.bank_transaction.create({
          data: {
            out: total_money,
            in: 0,
            balance: check_bank_balance.balance - total_money,
            transaction_id,
            bank_id,
          },
        });

        await tx.bank_balance.update({
          where: { id: check_bank_balance.id },
          data: {
            balance: check_bank_balance.balance - total_money,
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
            out: total_money,
            in: 0,
            balance: currentCashBalance - total_money,
            transaction_id,
            manager_id: managerId,
            casher_id: casherId,
          },
        });

        await tx.cash_balance.upsert({
          where: { id: 1 },
          update: {
            balance: currentCashBalance - total_money,
          },
          create: {
            id: 1,
            balance: currentCashBalance - total_money,
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

    if (error.message) {
      if (error.message.includes("Bank balance not found")) {
        return res.status(400).json({ message: "Bank balance not found" });
      }
      if (error.message.includes("Bank balance not enough")) {
        return res.status(400).json({ message: "Insufficient bank balance for this transaction" });
      }
      if (error.message.includes("Invalid payment method")) {
        return res.status(400).json({ message: "Invalid payment method provided" });
      }
      if (error.message.includes("validation")) {
        return res.status(400).json({ message: error.message });
      }
      if (error.code === "P1008") {
        return res.status(408).json({ message: "Request timeout. Please try again." });
      }

      return res.status(500).json({ message: error.message });
    }

    res.status(500).json({ message: "Network error." });
  }
};



// buy credit report
const buyCreditReport = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      transactionId,
      status,
      startDate,
      endDate,
      supplierName,
      isActive = true,
    } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;

    // Build where clause for filtering
    const whereClause = {
      isActive: isActive === "true" || isActive === true,
    };

    // Add filters if provided
    if (transactionId) {
      whereClause.transaction_id = {
        contains: transactionId,
      };
    }

    if (status) {
      whereClause.status = status;
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Add 1 day to endDate to include the entire end date
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        whereClause.createdAt.lt = endDateTime;
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.buy_credit.count({
      where: whereClause,
    });

    // Get paginated data
    const getBuyCreditReport = await prisma.buy_credit.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limitNumber,
    });

    // Manually join with buy_transaction to get supplier_name
    const buyCreditWithSupplier = await Promise.all(
      getBuyCreditReport.map(async (credit) => {
        const buyTransactions = await prisma.buy_transaction.findMany({
          where: {
            transaction_id: credit.transaction_id,
          },
          select: {
            supplier_name: true,
          },
          take: 1, // Get first one since supplier_name should be same for all in same transaction
        });

        return {
          ...credit,
          supplier_name: buyTransactions[0]?.supplier_name || null,
        };
      })
    );

    // Filter by supplier name if provided
    let filteredResults = buyCreditWithSupplier;
    if (supplierName) {
      filteredResults = buyCreditWithSupplier.filter((credit) =>
        credit.supplier_name?.toLowerCase().includes(supplierName.toLowerCase())
      );
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPreviousPage = pageNumber > 1;

    const paginationData = {
      currentPage: pageNumber,
      pageSize: limitNumber,
      totalCount,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };

    if (filteredResults.length === 0 && totalCount === 0) {
      return res.status(404).json({
        status: false,
        error: "Buy credit report not found",
        pagination: paginationData,
      });
    }

    return res.status(200).json({
      status: true,
      data: filteredResults,
      pagination: paginationData,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      error: "Internal server error",
    });
  }
};

// detail buy credit report
const detailBuyCredit = async (req, res) => {
  const transaction_id = req.params.id;

  try {
    const getDetailBuyCreditReport = await prisma.buy_transaction.findMany({
      where: {
        transaction_id: transaction_id,
      },
      select: {
        id: true,
        price_per_quantity: true,
        quantity: true,
        payment_method: true,
        total_money: true,
        supplier_name: true,
        transaction_id: true,
        manager_id: true,
        casher_id: true,
        Product_type: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (getDetailBuyCreditReport.length === 0) {
      return res
        .status(404)
        .json({ status: false, error: "Buy credit detail not found" });
    }

    // Extract manager and casher IDs from the report
    const userIds = Array.from(
      new Set(
        getDetailBuyCreditReport.flatMap((item) => [
          item.manager_id,
          item.casher_id,
        ])
      )
    ).filter(Boolean); // Remove null/undefined values

    // Fetch user names based on manager and casher IDs
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });

    // Create a map of user IDs to their names
    const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

    // Add manager and casher names to the buy transaction details
    getDetailBuyCreditReport.forEach((item) => {
      item.manager_name = userMap[item.manager_id] || null;
      item.casher_name = userMap[item.casher_id] || null;
    });

    // Return the response with the manager and casher names included
    return res
      .status(200)
      .json({ status: true, data: getDetailBuyCreditReport });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      error: "Internal server error",
    });
  }
};

module.exports = { buyProduct, buyCreditReport, detailBuyCredit };
