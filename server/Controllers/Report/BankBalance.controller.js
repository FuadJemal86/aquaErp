const prisma = require("../../prisma/prisma");

// Bank Balance report
const bankBalance = async (req, res) => {
  try {
    const bankBalances = await prisma.bank_balance.findMany({
      where: {
        isActive: true,
      },
      include: {
        Bank_list: {
          select: {
            id: true,
            branch: true,
            account_number: true,
            owner: true,
          },
        },
      },
      orderBy: {
        Bank_list: {
          branch: "asc",
        },
      },
    });

    res.status(200).json({
      bankBalances,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
};

module.exports = {
  bankBalance,
};
