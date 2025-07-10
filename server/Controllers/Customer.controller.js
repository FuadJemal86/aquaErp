const prisma = require("../prisma/prisma");
const { Customer } = require("../Model/Validation");
const path = require('path');
const { deleteFileIfExists } = require("../Utils/fileUtils");

// Add Customer
const addCustomer = async (req, res) => {
  try {
    const { full_name, phone, address } = req.body;

    // Get the file path from the uploaded file
    const id_card = req.file ? req.file.fullPath : undefined;

    const { error } = Customer.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const customer = await prisma.customer.create({
      data: {
        full_name,
        phone,
        address,
        id_card,
      },
    });

    console.log("Customer created successfully:", customer);
    res.status(201).json(customer);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get All Customer
const getAllCustomer = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { isActive: true }
    });
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update Customer
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, address } = req.body;

    // Validate required fields
    if (!full_name || !phone || !address) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Get existing customer
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Prepare update data (without updatedAt)
    const updateData = {
      full_name,
      phone,
      address
    };

    // Handle ID card
    if (req.file) {
      updateData.id_card = req.file.fullPath;
      // Delete old file if exists
      if (existingCustomer.id_card) {
        const absolutePath = path.join(__dirname, '..', existingCustomer.id_card);
        deleteFileIfExists(absolutePath);
      }
    } else if (req.body.removeIdCard === 'true') {
      updateData.id_card = null;
      if (existingCustomer.id_card) {
        const absolutePath = path.join(__dirname, '..', existingCustomer.id_card);
        deleteFileIfExists(absolutePath);
      }
    }

    // Validate data
    const { error } = Customer.validate(updateData);
    if (error) {
      if (req.file) {
        const absolutePath = path.join(__dirname, '..', req.file.fullPath);
        deleteFileIfExists(absolutePath);
      }
      return res.status(400).json({ error: error.details[0].message });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.status(200).json(updatedCustomer);

  } catch (error) {
    console.error("Error updating customer:", error);
    if (req.file) {
      const absolutePath = path.join(__dirname, '..', req.file.fullPath);
      deleteFileIfExists(absolutePath);
    }
    res.status(500).json({ error: "Internal server error" });
  }
};


// delete customer

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    //  check customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCustomer) {
      return res.status(404).json({
        status: false,
        error: 'customer not found'
      });
    }

    //  Delete the customer
    await prisma.customer.update({
      where: { id: parseInt(id) },
      data: {
        isActive: false
      }
    });

    return res.status(200).json({
      status: true,
      message: 'customer deleted successfully'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      error: 'Internal server error'
    });
  }
};
module.exports = { addCustomer, getAllCustomer, updateCustomer, deleteCustomer };
