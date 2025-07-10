const Joi = require("joi");

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
  // id_card: Joi.string().optional(),
});

module.exports = {
  Product_Category,
  Product_Type,
  Initialize_Stock,
  Bank_list,
  Customer,
};
