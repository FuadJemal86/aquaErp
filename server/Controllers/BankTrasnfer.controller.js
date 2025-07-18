const { Bank_deposit, Bank_withdraw } = require("../Model/Validation");
const { generateBankTransactionId } = require("../Utils/GenerateTransactionId");
const prisma = require("../prisma/prisma");

const addBankDeposit = async (req, res) => {
  try {
    let { bank_id, amount, description, deposit_method } = req.body;

    bank_id = parseInt(bank_id);
    amount = parseFloat(amount);

    const validate = Bank_deposit.validate(req.body);
    if (validate.error) {
      return res
        .status(400)
        .json({ message: validate.error.details[0].message });
    }
    const receipt_image = req.file ? req.file.fullPath : undefined;

    const bank_balance = await prisma.bank_balance.findFirst({
      where: {
        bank_id,
      },
    });

    if (!bank_balance) {
      return res.status(400).json({ message: "Bank balance not found" });
    }

    const new_balance = bank_balance.balance + amount || amount;

    const bank_deposit = await prisma.$transaction(async (tx) => {
      if (deposit_method === "cash_to_bank") {
        const cash_balance = await tx.cash_transaction.findFirst({
          orderBy: {
            id: "desc",
          },
        });
        console.log(cash_balance);

        if (!cash_balance) {
          throw new Error("Cash balance not found");
        }

        const new_cash_balance = cash_balance.balance - amount;

        if (new_cash_balance < 0) {
          throw new Error("Insufficient cash balance");
        }

        await tx.cash_transaction.create({
          data: {
            transaction_id: generateBankTransactionId(),
            manager_id: req.userId,
            casher_id: req.userId,
            out: amount,
            in: 0,
            balance: new_cash_balance,
          },
        });
      }

      const transaction = await tx.bank_transaction.create({
        data: {
          bank_id,
          in: amount,
          out: 0,
          balance: new_balance,
          transaction_id: generateBankTransactionId(),
          description,
          receipt_image,
        },
      });

      await tx.bank_balance.update({
        where: {
          id: bank_balance.id,
        },
        data: {
          balance: new_balance,
        },
      });

      return transaction;
    });

    return res.status(201).json(bank_deposit);
  } catch (error) {
    console.error(error);

    // Handle specific error messages
    if (error.message === "Cash balance not found") {
      return res.status(400).json({ message: "Cash balance not found" });
    } else if (error.message === "Insufficient cash balance") {
      return res.status(400).json({ message: "Insufficient cash balance" });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

const addBankWithdraw = async (req, res) => {
  try {
    let { bank_id, amount, description } = req.body;

    bank_id = parseInt(bank_id);
    amount = parseFloat(amount);

    const validate = Bank_withdraw.validate(req.body);
    if (validate.error) {
      return res
        .status(400)
        .json({ message: validate.error.details[0].message });
    }

    const receipt_image = req.file ? req.file.fullPath : undefined;

    const bank_balance = await prisma.bank_balance.findFirst({
      where: {
        bank_id,
      },
    });

    if (!bank_balance) {
      return res.status(400).json({ message: "Bank balance not found" });
    }

    const new_balance = bank_balance.balance - amount || amount;
    if (new_balance < 0) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const bank_withdraw = await prisma.$transaction(async (tx) => {
      const transaction = await tx.bank_transaction.create({
        data: {
          bank_id,
          in: 0,
          out: amount,
          balance: new_balance,
          transaction_id: generateBankTransactionId(),
          description,
          receipt_image,
        },
      });

      await tx.bank_balance.update({
        where: {
          id: bank_balance.id,
        },
        data: {
          balance: new_balance,
        },
      });

      return transaction;
    });

    res.status(201).json(bank_withdraw);
  } catch (error) {
    console.error(error);
    if (error.message.includes("Insufficient balance")) {
      return res.status(400).json({ message: error.message });
    } else if (error.message.includes("Bank balance not found")) {
      return res.status(400).json({ message: error.message });
    } else if (error.message.includes("Bank balance not found")) {
      return res.status(400).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
};

// get cash balance
const getCashBalance = async (req, res) => {
  try {
    const cash_balance = await prisma.cash_transaction.findFirst({
      orderBy: {
        id: "desc",
      },
    });

    return res.status(200).json(cash_balance);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addBankDeposit,
  addBankWithdraw,
  getCashBalance,
};
