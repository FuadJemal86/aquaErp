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
} = require("../Controllers/RepayCredit.controller");



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

router.get("/get-all-sales-credits", salesCreditReport);

router.get("/get-sales-credit-details/:id", getSalesCreditDetails);
router.get("/get-sales-credit-report-for-repay", salesCreditReportForRepay);

module.exports = router;
