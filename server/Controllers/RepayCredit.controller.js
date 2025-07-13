const { sales_repay_credit } = require("../Model/Validation");
const prisma = require("../prisma/prisma");
const path = require("path");
const { deleteFileIfExists } = require("../Utils/fileUtils");

const repaySalesCredit = async (req, res) => {
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

  const { error } = sales_repay_credit.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: false, error: error.details[0].message });
  }

  try {
    let cashTransactionId = null;

    //  Handle CASH
    if (payment_method === "CASH") {
      const newCash = await prisma.cash_transaction.create({
        data: {
          in: parseFloat(amount_payed),
          out: 0,
          balance: parseFloat(amount_payed),
          transaction_id,
          //   manager_id: 1,
          //   casher_id: 1,
        },
      });
      cashTransactionId = newCash.id;

      const latestCashBalance = await prisma.cash_balance.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      });

      const newCashBalance =
        (latestCashBalance?.balance || 0) + parseFloat(amount_payed);

      if (latestCashBalance) {
        await prisma.cash_balance.update({
          where: { id: latestCashBalance.id },
          data: { balance: newCashBalance },
        });
      } else {
        await prisma.cash_balance.create({
          data: { balance: parseFloat(amount_payed) },
        });
      }
    }

    //  Handle BANK
    if (payment_method === "BANK" && bankId) {
      const latestBankBalance = await prisma.bank_balance.findFirst({
        where: { bank_id: bankId, isActive: true },
        orderBy: { createdAt: "desc" },
      });

      const newBankBalance =
        (latestBankBalance?.balance || 0) + parseFloat(amount_payed);

      if (latestBankBalance) {
        await prisma.bank_balance.update({
          where: { id: latestBankBalance.id },
          data: { balance: newBankBalance },
        });
      } else {
        await prisma.bank_balance.create({
          data: {
            bank_id: bankId,
            balance: parseFloat(amount_payed),
          },
        });
      }

      // Create bank_transaction
      await prisma.bank_transaction.create({
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

    // Create new credit transaction
    await prisma.sales_credit_transaction.create({
      data: {
        transaction_id,
        amount_payed: parseFloat(amount_payed),
        payment_method,
        bank_id: bankId ?? null,
        cash_id: cashTransactionId,
        outstanding_balance: parseFloat(outstanding_balance),
        image: req.file?.fullPath || "",
      },
    });

    // Update or delete credit record
    const credit = await prisma.sales_credit.findFirst({
      where: { transaction_id },
    });

    if (!credit) throw new Error("Related Sales_credit not found");

    const updatedTotal = credit.total_money - parseFloat(amount_payed);

    if (updatedTotal <= 0) {
      await prisma.sales_credit.update({
        where: { id: credit.id },
        data: {
          status: "PAYED",
        },
      });
    } else {
      await prisma.sales_credit.update({
        where: { id: credit.id },
        data: { total_money: updatedTotal },
      });
    }

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

module.exports = { repaySalesCredit };
