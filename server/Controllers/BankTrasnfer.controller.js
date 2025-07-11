const { Bank_deposit } = require("../Model/Validation");
const { generateBankTransactionId } = require("../Utils/GenerateTransactionId");
const prisma = require("../prisma/prisma");

const addBankDeposit = async (req, res) => {
  try {
    let { bank_id, amount, description } = req.body;

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

    const bank_deposit = await prisma.bank_transaction.create({
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

    res.status(201).json(bank_deposit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addBankDeposit,
};
