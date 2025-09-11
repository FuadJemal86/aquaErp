const prisma = require("../prisma/prisma");
const {
  Product_Category,
  Product_Type,
  Initialize_Stock,
  Bank_list,
  Add_user,
  Add_account,
  Add_account_list,
  Edit_account,
} = require("../Model/Validation");
const bcrypt = require("bcrypt");
const { date } = require("joi");

// Add Product  catagory
const addProductCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { error } = Product_Category.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if the product category already exists
    const findProductCategory = await prisma.product_category.findFirst({
      where: { name: name },
    });
    if (findProductCategory) {
      return res.status(400).json({ error: "Product category already exists" }); // 400 is bad request
    }

    // Create the product category
    const productCategory = await prisma.product_category.create({
      data: {
        name: name,
        description: description,
      },
    });
    res.json({
      message: "Product category added successfully",
      productCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add Product Type with realtion to category id
const addProductType = async (req, res) => {
  try {
    const { name, product_category_id, measurement } = req.body;
    const { error } = Product_Type.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if the product type already exists
    const findProductType = await prisma.product_type.findFirst({
      where: { name: name },
    });
    if (findProductType) {
      return res.status(400).json({ error: "Product type already exists" });
    }

    // Check if the product category exists
    const findProductCategory = await prisma.product_category.findUnique({
      where: { id: product_category_id },
    });
    if (!findProductCategory) {
      return res.status(400).json({ error: "Product category not found" });
    }
    // Create the product type
    const productType = await prisma.product_type.create({
      data: {
        name: name,
        measurement: measurement,
        product_category_id: product_category_id,
      },
    });
    res.json({
      message: "Product type added successfully",
      productType,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Initialize  stock for product type
const initializeStock = async (req, res) => {
  try {
    const { product_type_id, quantity, price_per_quantity } = req.body;
    const { error } = Initialize_Stock.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if the product type exists
    const findProductType = await prisma.product_type.findUnique({
      where: { id: product_type_id },
    });
    if (!findProductType) {
      return res.status(400).json({ error: "Product type not found" });
    }

    // Create the initialize stock
    const initializeStock = await prisma.product_stock.create({
      data: {
        quantity: quantity,
        price_per_quantity: price_per_quantity,
        amount_money: price_per_quantity * quantity,
        product_type_id: product_type_id,
      },
      include: {
        Product_type: true,
      },
    });
    res.json({
      message: "Initialize stock added successfully",
      initializeStock,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Product category
const getProductCategory = async (req, res) => {
  try {
    const productCategory = await prisma.product_category.findMany();
    res.json(productCategory);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Product type
const getProductType = async (req, res) => {
  try {
    const productType = await prisma.product_type.findMany({
      include: {
        Product_category: true,
        product_Stock: {
          where: { isActive: true },
          select: {
            quantity: true,
            price_per_quantity: true,
            amount_money: true,
          },
        },
      },
    });

    // Transform the data to include stock information
    const productTypeWithStock = productType.map((type) => {
      const stock = type.product_Stock[0]; // Get the first (and should be only) stock record
      return {
        ...type,
        available_quantity: stock ? stock.quantity : 0,
        price_per_quantity: stock ? stock.price_per_quantity : 0,
        total_amount: stock ? stock.amount_money : 0,
        product_Stock: undefined, // Remove the original stock array
      };
    });

    res.json(productTypeWithStock);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Product stock
const getProductStock = async (req, res) => {
  try {
    const productStock = await prisma.product_stock.findMany({
      include: {
        Product_type: true,
      },
    });
    res.json(productStock);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// edit product price

const editProductPrice = async (req, res) => {
  const id = req.body.stock_id
  const newPrice = req.body.price_per_quantity

  try {
    const isExist = await prisma.product_stock.findFirst({
      where: { id: Number(id) }
    })

    if (!isExist) {
      return res.status(404).json({ message: 'product price not found' })
    }
    await prisma.product_stock.update({
      where: { id: Number(id) },
      data: {
        price_per_quantity: newPrice
      }
    })

    return res.status(200).json({ message: 'price edit succussesfuly' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" });
  }
}

// Get Bank list
const getBankList = async (req, res) => {
  try {
    const bankList = await prisma.bank_list.findMany({
      where: { isActive: true },
      include: {
        bank_balance: {
          where: { isActive: true },
          select: {
            balance: true,
          },
        },
      },
    });
    res.json(bankList);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// add user
const addUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const { error } = Add_user.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // check if the user is already exist
    const checkUserExist = await prisma.user.findUnique({
      where: { email: email },
    });

    if (checkUserExist) {
      return res
        .status(400)
        .json({ status: false, error: "user already exist" });
    }

    // check if the role is valid
    if (role !== "ADMIN" && role !== "CASHIER") {
      return res.status(400).json({ status: false, error: "Invalid role" });
    }
    // password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // create the user
    await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        phone: phone,
        role: role,
      },
    });

    res.status(200).json({ status: true, message: "user successful added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get users
const getUsers = async (req, res) => {
  try {
    const allUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    if (!allUsers) {
      return res.status(400).json({ status: false, error: "no user found" });
    }
    res.json({ allUsers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// delete (soft delete) customer
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);


    //  if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        status: false,
        error: "User not found",
      });
    }

    //  Delete(soft delete) the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
      },
    });

    return res.status(200).json({
      status: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      error: "Internal server error",
    });
  }
};

// add account
const addAccount = async (req, res) => {
  try {
    const { branch, account_number, owner, balance } = req.body;
    const { error } = Add_account_list.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if account exists
    const checkAccountExist = await prisma.bank_list.findFirst({
      where: { isActive: true, account_number, branch },
    });

    if (checkAccountExist) {
      return res
        .status(400)
        .json({ status: false, error: "Bank account already exists" });
    }

    //  Create bank account
    const newBankAccount = await prisma.bank_list.create({
      data: {
        branch,
        account_number,
        owner,
      },
    });

    // Create initial balance linked to the new bank account
    await prisma.bank_balance.create({
      data: {
        bank_id: newBankAccount.id,
        balance: parseFloat(balance),
      },
    });

    return res
      .status(201)
      .json({ status: true, message: "Bank account created successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// get bank account
const getAccounts = async (req, res) => {
  try {
    const accounts = await prisma.bank_list.findMany({
      where: { isActive: true },
      include: {
        bank_balance: {
          where: { isActive: true },
        },
      },
    });

    res.json({ accounts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch accounts" });
  }
};

// update account
const editBankList = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch, account_number, owner } = req.body;
    const { error } = Edit_account.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    // Check if account exists
    const existingAccount = await prisma.bank_list.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingAccount) {
      return res.status(404).json({
        status: false,
        error: "Bank account not found",
      });
    }

    // Check if updated account number + branch combination already exists (excluding current account)
    const duplicateAccount = await prisma.bank_list.findFirst({
      where: {
        account_number: account_number,
        branch: branch,
        id: { not: parseInt(id) },
      },
    });

    if (duplicateAccount) {
      return res.status(400).json({
        status: false,
        error: "Bank account with this number and branch already exists",
      });
    }

    // Update bank account
    const updatedAccount = await prisma.bank_list.update({
      where: { id: parseInt(id) },
      data: {
        branch: branch,
        account_number: account_number,
        owner: owner.trim(),
      },
    });

    return res.status(200).json({
      status: true,
      message: "Bank account updated successfully",
      data: updatedAccount,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      error: "Internal server error",
    });
  }
};

// Delete Bank Account Endpoint
const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const bankId = parseInt(id);

    //  if the bank account exists
    const existingAccount = await prisma.bank_list.findUnique({
      where: { id: bankId },
    });

    if (!existingAccount) {
      return res.status(404).json({
        status: false,
        error: "Bank account not found",
      });
    }

    //  Deactivate related bank balances
    await prisma.bank_balance.updateMany({
      where: { bank_id: bankId },
      data: { isActive: false },
    });

    //  Delete the bank account
    await prisma.bank_list.update({
      where: { id: bankId },
      data: {
        isActive: false,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Bank account deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      error: "Internal server error",
    });
  }
};

module.exports = {
  addProductCategory,
  addProductType,
  initializeStock,
  getProductCategory,
  getProductType,
  getProductStock,
  editProductPrice,
  getBankList,
  addUser,
  getUsers,
  deleteUser,
  addAccount,
  getAccounts,
  editBankList,
  deleteAccount,
};
