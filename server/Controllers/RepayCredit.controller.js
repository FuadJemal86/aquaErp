const { sales_repay_credit, buy_repay_credit } = require("../Model/Validation");
const prisma = require("../prisma/prisma");
const path = require("path");
const { deleteFileIfExists } = require("../Utils/fileUtils");
const {
  generateSalesCreditTransactionId,
} = require("../Utils/GenerateTransactionId");

// const getSalesCreditDetailTransaction = async (req, res) => {
//   const transaction_id = req.params.id;

//   console.log(transaction_id);

//   try {
//     const salesCreditTransactionId =
//       await prisma.sales_credit_transaction.findMany({
//         where: { transaction_id },
//       });

//     if (!salesCreditTransactionId) {
//       return res
//         .status(400)
//         .json({ error: "not found sales credit transaction" });
//     }
//     return res
//       .status(201)
//       .json({ status: true, data: salesCreditTransactionId });
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(500)
//       .json({ status: false, error: "Internal server error" });
//   }
// };

const getSalesCreditDetails = async (req, res) => {
  const transaction_id = req.params.id;

  try {
    // Fetch sales transactions
    const salesTransactions = await prisma.sales_transaction.findMany({
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

    // Fetch sales credit transactions
    const salesCreditTransactions =
      await prisma.sales_credit_transaction.findMany({
        where: {
          transaction_id: transaction_id,
        },
        select: {
          id: true,
          amount_payed: true,
          payment_method: true,
          CTID: true,
          outstanding_balance: true,
          image: true,
          createdAt: true,
        },
      });

    if (salesTransactions.length === 0) {
      return res
        .status(404)
        .json({ status: false, error: "Sales credit detail not found" });
    }

    // Get user IDs for manager and customer names
    const userIds = Array.from(
      new Set(
        salesTransactions.flatMap((item) => [item.manager_id, item.customer_id])
      )
    ).filter(Boolean);

    // Fetch users
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });

    const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

    // Add manager and cashier names to sales transactions
    const salesTransactionsWithNames = salesTransactions.map((item) => ({
      ...item,
      manager_name: userMap[item.manager_id] || null,
      cashier_name: userMap[item.customer_id] || null,
    }));

    // Return unified response
    return res.status(200).json({
      status: true,
      data: {
        salesTransactions: salesTransactionsWithNames,
        salesCreditTransactions: salesCreditTransactions,
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

const salesCreditReportForRepay = async (req, res) => {
  try {
    // Get all sales credit entries
    const getSalesCreditReport = await prisma.sales_credit.findMany({
      where: {
        status: {
          in: ["ACCEPTED", "OVERDUE"],
        },
      },
    });

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


const repaySalesCredit = async (req, res) => {
  const {
    amount_payed,
    payment_method,
    transaction_id,
    outstanding_balance,
    bank_id,
  } = req.body;

  const bankId = bank_id ? parseInt(bank_id) : null;

  if (payment_method === "BANK" && !req.file?.fullPath) {
    return res
      .status(400)
      .json({ status: false, error: `"image" is required for BANK payments` });
  }

  const { error } = sales_repay_credit.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: false, error: error.details[0].message });
  }

  try {
    await prisma.$transaction(async (tx) => {
      let cashTransactionId = null;

      // Handle CASH
      if (payment_method === "CASH") {
        const newCash = await tx.cash_transaction.create({
          data: {
            in: parseFloat(amount_payed),
            out: 0,
            balance: parseFloat(amount_payed),
            transaction_id,
          },
        });
        cashTransactionId = newCash.id;

        const latestCashBalance = await tx.cash_balance.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        });

        const newCashBalance =
          (latestCashBalance?.balance || 0) + parseFloat(amount_payed);

        if (latestCashBalance) {
          await tx.cash_balance.update({
            where: { id: latestCashBalance.id },
            data: { balance: newCashBalance },
          });
        } else {
          await tx.cash_balance.create({
            data: { balance: parseFloat(amount_payed) },
          });
        }
      }

      // Handle BANK
      if (payment_method === "BANK" && bankId) {
        const latestBankBalance = await tx.bank_balance.findFirst({
          where: { bank_id: bankId, isActive: true },
          orderBy: { createdAt: "desc" },
        });

        const newBankBalance =
          (latestBankBalance?.balance || 0) + parseFloat(amount_payed);

        if (latestBankBalance) {
          await tx.bank_balance.update({
            where: { id: latestBankBalance.id },
            data: { balance: newBankBalance },
          });
        } else {
          await tx.bank_balance.create({
            data: {
              bank_id: bankId,
              balance: parseFloat(amount_payed),
            },
          });
        }

        await tx.bank_transaction.create({
          data: {
            in: parseFloat(amount_payed),
            out: 0,
            balance: parseFloat(amount_payed),
            transaction_id,
            receipt_image: req.file?.fullPath || null,
            bank_id: bankId,
          },
        });
      }

      // Credit transaction
      await tx.sales_credit_transaction.create({
        data: {
          transaction_id,
          amount_payed: parseFloat(amount_payed),
          payment_method,
          bank_id: bankId ?? null,
          cash_id: cashTransactionId,
          CTID: generateSalesCreditTransactionId(),
          outstanding_balance: parseFloat(outstanding_balance),
          image: req.file?.fullPath || "",
        },
      });

      const credit = await tx.sales_credit.findFirst({
        where: { transaction_id },
      });

      if (!credit) throw new Error("Related Sales_credit not found");

      const updatedTotal = credit.total_money - parseFloat(amount_payed);

      if (updatedTotal <= 0) {
        await tx.sales_credit.update({
          where: { id: credit.id },
          data: {
            status: "PAYED",
          },
        });
      } else {
        await tx.sales_credit.update({
          where: { id: credit.id },
          data: { total_money: updatedTotal },
        });
      }
    });

    return res.status(201).json({ status: true });
  } catch (err) {
    console.error("Error in repaySalesCredit:", err);

    if (req.file) {
      const absolutePath = path.join(__dirname, "..", req.file.fullPath);
      deleteFileIfExists(absolutePath);
    }

    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};



// Buy repay credit

const getBuyCreditDetails = async (req, res) => {
  const transaction_id = req.params.id;

  try {
    // Fetch buy transactions
    const buyTransactions = await prisma.buy_transaction.findMany({
      where: {
        transaction_id: transaction_id,
      },
      select: {
        id: true,
        price_per_quantity: true,
        payment_method: true,
        supplier_name: true,
        quantity: true,
        Product_type: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Fetch buy credit transactions
    const BuyCreditTransactions =
      await prisma.buy_credit_transaction.findMany({
        where: {
          transaction_id: transaction_id,
        },
        select: {
          id: true,
          amount_payed: true,
          payment_method: true,
          CTID: true,
          outstanding_balance: true,
          image: true,
          createdAt: true,
        },
      });

    if (buyTransactions.length === 0) {
      return res
        .status(404)
        .json({ status: false, error: "buy credit detail not found" });
    }

    return res.status(200).json({
      status: true,
      data: {
        buyCreditTransactions: BuyCreditTransactions,
        buyTransactions: buyTransactions,
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

const buyCreditReportForRepay = async (req, res) => {
  try {
    const getBuyCreditReport = await prisma.buy_credit.findMany({
      where: {
        status: {
          in: ["ACCEPTED", "OVERDUE"],
        },
      },
    });

    if (getBuyCreditReport.length === 0) {
      return res.status(404).json({
        status: false,
        error: "Buy credit report not found",
      });
    }

    const enrichedCredits = await Promise.all(
      getBuyCreditReport.map(async (credit) => {
        const transaction = await prisma.buy_transaction.findFirst({
          where: { transaction_id: credit.transaction_id },
          select: { supplier_name: true },
        });

        return {
          ...credit,
          supplier_name: transaction?.supplier_name || null,
        };
      })
    );

    return res.status(200).json({ status: true, data: enrichedCredits });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      error: "Internal server error",
    });
  }
};


const repayBuyCredit = async (req, res) => {
  const {
    amount_payed,
    payment_method,
    transaction_id,
    outstanding_balance,
    bank_id,
  } = req.body;

  const bankId = bank_id ? parseInt(bank_id) : null;

  // Require image only for BANK payments
  if (payment_method === "BANK" && !req.file?.fullPath) {
    return res
      .status(400)
      .json({ status: false, error: `"image" is required for BANK payments` });
  }

  const { error } = buy_repay_credit.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: false, error: error.details[0].message });
  }

  try {
    await prisma.$transaction(async (tx) => {
      let cashTransactionId = null;

      // Handle CASH
      if (payment_method === "CASH") {
        const newCash = await tx.cash_transaction.create({
          data: {
            in: 0,
            out: parseFloat(amount_payed),
            balance: parseFloat(amount_payed),
            transaction_id,
          },
        });
        cashTransactionId = newCash.id;

        const latestCashBalance = await tx.cash_balance.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        });

        const newCashBalance =
          (latestCashBalance?.balance || 0) - parseFloat(amount_payed);

        if (latestCashBalance) {
          await tx.cash_balance.update({
            where: { id: latestCashBalance.id },
            data: { balance: newCashBalance },
          });
        } else {
          await tx.cash_balance.create({
            data: { balance: parseFloat(amount_payed) },
          });
        }
      }

      // Handle BANK
      if (payment_method === "BANK" && bankId) {
        const latestBankBalance = await tx.bank_balance.findFirst({
          where: { bank_id: bankId, isActive: true },
          orderBy: { createdAt: "desc" },
        });

        const newBankBalance =
          (latestBankBalance?.balance || 0) - parseFloat(amount_payed);

        if (latestBankBalance) {
          await tx.bank_balance.update({
            where: { id: latestBankBalance.id },
            data: { balance: newBankBalance },
          });
        } else {
          await tx.bank_balance.create({
            data: {
              bank_id: bankId,
              balance: parseFloat(amount_payed),
            },
          });
        }

        await tx.bank_transaction.create({
          data: {
            in: 0,
            out: parseFloat(amount_payed),
            balance: parseFloat(amount_payed),
            transaction_id,
            receipt_image: req.file?.fullPath || null,
            bank_id: bankId,
          },
        });
      }

      await tx.buy_credit_transaction.create({
        data: {
          transaction_id,
          amount_payed: parseFloat(amount_payed),
          payment_method,
          Bank_id: bankId ?? null,
          CTID: generateSalesCreditTransactionId(),
          outstanding_balance: parseFloat(outstanding_balance),
          image: req.file?.fullPath || "",
        },
      });

      const credit = await tx.buy_credit.findFirst({
        where: { transaction_id },
      });

      if (!credit) {
        throw new Error("Related Buy_credit not found");
      }

      const updatedTotal = credit.total_money - parseFloat(amount_payed);

      if (updatedTotal <= 0) {
        await tx.buy_credit.update({
          where: { id: credit.id },
          data: {
            status: "PAYED",
          },
        });
      } else {
        await tx.buy_credit.update({
          where: { id: credit.id },
          data: { total_money: updatedTotal },
        });
      }
    });

    return res.status(201).json({ status: true });
  } catch (err) {
    console.error("Error in repayBuyCredit:", err);

    if (req.file) {
      const absolutePath = path.join(__dirname, "..", req.file.fullPath);
      deleteFileIfExists(absolutePath);
    }

    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

// get cash balance

const cashBalance = async (req, res) => {
  try {
    const getCashBalance = await prisma.cash_balance.findMany()

    if (getCashBalance.length === 0) {
      return res.status(404).json({ status: false, error: 'cash balance not found' })
    }
    res.status(200).json(getCashBalance)
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
}



module.exports = {
  repaySalesCredit,
  repayBuyCredit,

  salesCreditReportForRepay,
  getSalesCreditDetails,

  getBuyCreditDetails,
  buyCreditReportForRepay,

  cashBalance
};
