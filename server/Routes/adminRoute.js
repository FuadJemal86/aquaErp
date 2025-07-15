const express = require("express");
const router = express.Router();
const {
  addProductCategory,
  addProductType,
  initializeStock,
  getProductCategory,
  getProductType,
  getProductStock,
  getBankList,
  addUser,
  getUsers,
  addAccount,
  deleteAccount,
  editBankList,
} = require("../Controllers/Setting.controller");
const {
  addCustomer,
  getAllCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../Controllers/Customer.controller");
const {
  uploadCustomerProfileMiddleware,
  uploadSalesCreditReceiptMiddleware,
} = require("../Utils/fileUtils");
const {
  buyProduct,
  buyCreditReport,
  detailBuyCredit,
} = require("../Controllers/Buy.controller");
const {
  sellProduct,
  detailSalesCredit,
  salesCreditReport,
} = require("../Controllers/Sales.controller");
const {
  addBankDeposit,
  addBankWithdraw,
} = require("../Controllers/BankTrasnfer.controller");
const {
  uploadBankDepositReceiptMiddleware,
  uploadBankWithdrawReceiptMiddleware,
} = require("../Utils/fileUtils");
const {
  repaySalesCredit,
  getSalesCreditDetailTransaction,
  salesCreditReportForRepay,
  getSalesCreditDetails,
  buyCreditReportForRepay,
  getBuyCreditDetails,
  repayBuyCredit,
  cashBalance,
} = require("../Controllers/RepayCredit.controller");
const {
  getSalesReport,
  getSalesDetails,
  getBuyReport,
  getBuyDetails,
} = require("../Controllers/Report.controller");
const { cashReport } = require("../Controllers/Report/Cash.controller");
const { bankTransaction } = require("../Controllers/Report/BankTransaction");
const { bankBalance } = require("../Controllers/Report/BankBalance.controller");

router.post("/add-product-category", addProductCategory);
router.post("/add-product-type", addProductType);
router.post("/initialize-stock", initializeStock);

router.post("/add-user", addUser);
router.post("/add-bank-list", addAccount);
router.post("/add-user", addUser);
router.get("/get-user", getUsers);

router.get("/get-product-category", getProductCategory);
router.get("/get-product-type", getProductType);
router.get("/get-product-stock", getProductStock);

// bank list Route
router.post("/add-bank-list", addAccount);
router.get("/get-bank-list", getBankList);
router.get("/get-user", getUsers);
router.put("/edit-bank-list/:id", editBankList);
router.put("/delete-bank-list/:id", deleteAccount);

// Customer Routes
router.post("/add-customer", uploadCustomerProfileMiddleware, addCustomer);
router.get("/get-all-customer", getAllCustomer);
router.put("/delete-customer/:id", deleteCustomer);
router.put(
  "/update-customer/:id",
  uploadCustomerProfileMiddleware,
  updateCustomer
);

// Buy Routes
router.post("/buy-product", buyProduct);
router.get("/get-all-buy-credits", buyCreditReport);
router.get("/get-buy-transaction-details/:id", detailBuyCredit);

// Sales Routes
router.post("/sell-product", sellProduct);

//sales and buy repay credit
router.post(
  "/repay-credit-sales",
  uploadSalesCreditReceiptMiddleware,
  repaySalesCredit
);

// Bank Transfer Routes
router.post(
  "/add-bank-deposit",
  uploadBankDepositReceiptMiddleware,
  addBankDeposit
);
router.post(
  "/add-bank-withdrawal",
  uploadBankWithdrawReceiptMiddleware,
  addBankWithdraw
);

// get cash balance
router.get("/get-cash-balance", cashBalance);

router.get("/get-all-sales-credits", salesCreditReport);

router.get("/get-sales-credit-details/:id", getSalesCreditDetails);
router.get("/get-sales-credit-report-for-repay", salesCreditReportForRepay);

// Sales report
router.get("/get-sales-report", getSalesReport);
router.get("/get-sales-details/:transaction_id", getSalesDetails);

// buy report
router.get("/get-buy-report", getBuyReport)
router.get("/get-buy-details/:transaction_id", getBuyDetails)

// for buy credit
router.get("/get-all-buy-credits", buyCreditReport);
router.get("/get-buy-credit-report-for-repay", buyCreditReportForRepay);
router.get("/get-buy-credit-details/:id", getBuyCreditDetails);
router.post(
  "/repay-credit-buy",
  uploadSalesCreditReceiptMiddleware,
  repayBuyCredit
);

// cash transaction
router.get("/get-cash-transaction", cashReport);

// Bank transaction
router.get("/get-bank-transaction", bankTransaction);

// Bank balance
router.get("/get-bank-balance", bankBalance);

module.exports = router;
