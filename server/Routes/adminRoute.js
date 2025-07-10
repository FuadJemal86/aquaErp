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
  editBankList
} = require("../Controllers/Setting.controller");
const {
  addCustomer,
  getAllCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../Controllers/Customer.controller");
const { uploadCustomerProfileMiddleware } = require("../Utils/fileUtils");

router.post("/add-product-category", addProductCategory);
router.post("/add-product-type", addProductType);
router.post("/initialize-stock", initializeStock);
router.post('/add-user', addUser)
router.get('/get-user', getUsers)




router.get("/get-product-category", getProductCategory);
router.get("/get-product-type", getProductType);
router.get("/get-product-stock", getProductStock);

// bank list Route
router.post('/add-bank-list', addAccount)
router.get("/get-bank-list", getBankList);
router.put('/edit-bank-list/:id', editBankList)
router.put('/delete-bank-list/:id', deleteAccount)



// Customer Routes
router.post("/add-customer", uploadCustomerProfileMiddleware, addCustomer);
router.get("/get-all-customer", getAllCustomer);
router.put('/delete-customer/:id', deleteCustomer)
router.put(
  "/update-customer/:id",
  uploadCustomerProfileMiddleware,
  updateCustomer
);

module.exports = router;
