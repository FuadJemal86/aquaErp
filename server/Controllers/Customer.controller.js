const prisma = require("../prisma/prisma");
const { Customer } = require("../Model/Validation");

// Add Customer
const addCustomer = async (req, res) => {
  try {
    const { full_name, email, phone, address } = req.body;

    // Get the file path from the uploaded file
    const id_card = req.file ? req.file.fullPath : undefined;

    const { error } = Customer.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const customer = await prisma.customer.create({
      data: {
        full_name,
        email,
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
    const customers = await prisma.customer.findMany();
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
    const { full_name, email, phone, address } = req.body;

    // Get the file path from the uploaded file (if any)
    const id_card = req.file ? req.file.fullPath : undefined;

    console.log("Updating customer:", {
      id,
      full_name,
      email,
      phone,
      address,
      id_card,
    });

    // Create validation data including the file path
    const validationData = {
      full_name,
      email,
      phone,
      address,
      id_card,
    };

    const { error } = Customer.validate(validationData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Only update id_card if a new file was uploaded
    const updateData = {
      full_name,
      email,
      phone,
      address,
    };

    if (id_card) {
      updateData.id_card = id_card;
    }

    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    console.log("Customer updated successfully:", customer);
    res.status(200).json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { addCustomer, getAllCustomer, updateCustomer };
