const express = require("express");
const router = express.Router();
const {
  addProductCategory,
  addProductType,
  initializeStock,
  createBank,
  getProductCategory,
  getProductType,
  getProductStock,
  getBankList,
  addUser,
  getUsers,
  addAccount
} = require("../Controllers/Setting.controller");
const {
  addCustomer,
  getAllCustomer,
  updateCustomer,
} = require("../Controllers/Customer.controller");
const { uploadCustomerProfileMiddleware } = require("../Utils/fileUtils");

router.post("/add-product-category", addProductCategory);
router.post("/add-product-type", addProductType);
router.post("/initialize-stock", initializeStock);
router.post("/create-bank", createBank);
router.post('/add-user', addUser)
router.post('/add-bank-list', addAccount)


router.get("/get-product-category", getProductCategory);
router.get("/get-product-type", getProductType);
router.get("/get-product-stock", getProductStock);
router.get("/get-bank-list", getBankList);
router.get('/get-user', getUsers)

// Customer Routes
router.post("/add-customer", uploadCustomerProfileMiddleware, addCustomer);
router.get("/get-all-customer", getAllCustomer);
router.put(
  "/update-customer/:id",
  uploadCustomerProfileMiddleware,
  updateCustomer
);

module.exports = router;
