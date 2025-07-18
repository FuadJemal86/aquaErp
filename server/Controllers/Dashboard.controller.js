const prisma = require("../prisma/prisma");

const getDashboardData = async (req, res) => {
  try {
    // const totalSal
    // res.status(200).json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboardData,
};
