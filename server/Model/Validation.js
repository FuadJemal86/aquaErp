const Joi = require("joi");
const { join } = require("../generated/prisma/runtime/library");

// Validation all here  with joi

const Product_Category = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
});

const Product_Type = Joi.object({
  name: Joi.string().required(),

  product_category_id: Joi.number().required(),
  measurement: Joi.string().required(),
});

const Initialize_Stock = Joi.object({
  product_type_id: Joi.number().required(),
  quantity: Joi.number().required(),
  price_per_quantity: Joi.number().required(),
});

const Bank_list = Joi.object({
  branch: Joi.string().required(),
  account_number: Joi.string().required(),
  owner: Joi.string().required(),
});

const Customer = Joi.object({
  full_name: Joi.string().required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  id_card: Joi.string().optional().allow("", null),
});

const Add_user = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().required(),
  role: Joi.string().valid("ADMIN", "CASHIER").required(),
});

const Add_account_list = Joi.object({
  branch: Joi.string().required(),
  account_number: Joi.string().required(),
  owner: Joi.string().required(),
  balance: Joi.number().required(),
});

const Cart_Item = Joi.object({
  product_category_id: Joi.number().required(),
  product_type_id: Joi.number().required(),
  quantity: Joi.number().required(),
  price_per_quantity: Joi.number().required(),
});

const Buy_product = Joi.object({
  supplier_name: Joi.string().required(),
  payment_method: Joi.string().valid("CASH", "BANK", "CREDIT").required(),
  bank_id: Joi.number().optional(),
  return_date: Joi.date().optional(),
  cart_list: Joi.array().items(Cart_Item).min(1).required(),
  description: Joi.string().optional(),
});
const Edit_account = Joi.object({
  branch: Joi.string().required(),
  account_number: Joi.string().required(),
  owner: Joi.string().required(),
});

const Sales_cart_item = Joi.object({
  type_id: Joi.number().required(),
  quantity: Joi.number().required(),
  price: Joi.number().required(),
});

const Sales_product = Joi.object({
  cart_list: Joi.array().items(Sales_cart_item).min(1).required(),
  payment_method: Joi.string().valid("CASH", "BANK", "CREDIT").required(),
  customer_type: Joi.string().valid("WALKER", "REGULAR").required(),
  customer_id: Joi.when("customer_type", {
    is: "REGULAR",
    then: Joi.number().required(),
    otherwise: Joi.number().optional().allow(null),
  }),
  bank_id: Joi.when("payment_method", {
    is: "BANK",
    then: Joi.number().required(),
    otherwise: Joi.number().optional().allow(null),
  }),
  return_date: Joi.when("payment_method", {
    is: "CREDIT",
    then: Joi.date().required(),
    otherwise: Joi.date().optional().allow(null),
  }),
  description: Joi.when("payment_method", {
    is: "CREDIT",
    then: Joi.string().required(),
    otherwise: Joi.string().optional().allow(null),
  }),
});

const Bank_deposit = Joi.object({
  bank_id: Joi.number().required(),
  amount: Joi.number().required(),
  description: Joi.string().optional(),
});

const Bank_withdraw = Joi.object({
  bank_id: Joi.number().required(),
  amount: Joi.number().required(),
  description: Joi.string().optional(),
});

module.exports = {
  Product_Category,
  Product_Type,
  Initialize_Stock,
  Bank_list,
  Customer,
  Add_user,
  Add_account_list,
  Buy_product,
  Cart_Item,
  Edit_account,
  Sales_product,
  Bank_deposit,
  Bank_withdraw,
};
