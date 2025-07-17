const prisma = require("../prisma/prisma");
const { Customer } = require("../Model/Validation");
const path = require("path");
const { deleteFileIfExists } = require("../Utils/fileUtils");

// Add Customer
const addCustomer = async (req, res) => {
  try {
    const { full_name, phone, address } = req.body;

    // Get the file path from the uploaded file
    const id_card = req.file ? req.file.fullPath : undefined;

    const { error } = Customer.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details[0].message,
      });
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
    return res.status(201).json({
      status: true,
      data: customer,
      message: "Customer created successfully",
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    return res.status(500).json({
      status: false,
      error: "Internal server error",
    });
  }
};

// Get All Customer
const getAllCustomer = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      startDate,
      endDate,
      isActive = true,
    } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;

    // Build where clause for filtering
    const whereClause = {
      isActive: isActive === "true" || isActive === true,
    };

    // Add search filter if provided
    if (search) {
      whereClause.OR = [
        {
          full_name: {
            contains: search,
          },
        },
        {
          phone: {
            contains: search,
          },
        },
        {
          address: {
            contains: search,
          },
        },
      ];
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Add 1 day to endDate to include the entire end date
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        whereClause.createdAt.lt = endDateTime;
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.customer.count({
      where: whereClause,
    });

    // Get paginated data
    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limitNumber,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPreviousPage = pageNumber > 1;

    const paginationData = {
      currentPage: pageNumber,
      pageSize: limitNumber,
      totalCount,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };

    if (customers.length === 0 && totalCount === 0) {
      return res.status(404).json({
        status: false,
        error: "No customers found",
        pagination: paginationData,
      });
    }

    return res.status(200).json({
      status: true,
      data: customers,
      pagination: paginationData,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return res.status(500).json({
      status: false,
      error: "Internal server error",
    });
  }
};

// Update Customer
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, address } = req.body;

    // Validate required fields
    if (!full_name || !phone || !address) {
      return res.status(400).json({
        status: false,
        error: "All fields are required",
      });
    }

    // Get existing customer
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCustomer) {
      return res.status(404).json({
        status: false,
        error: "Customer not found",
      });
    }

    // Prepare update data (without updatedAt)
    const updateData = {
      full_name,
      phone,
      address,
    };

    // Handle ID card
    if (req.file) {
      updateData.id_card = req.file.fullPath;
      // Delete old file if exists
      if (existingCustomer.id_card) {
        const absolutePath = path.join(
          __dirname,
          "..",
          existingCustomer.id_card
        );
        deleteFileIfExists(absolutePath);
      }
    } else if (req.body.removeIdCard === "true") {
      updateData.id_card = null;
      if (existingCustomer.id_card) {
        const absolutePath = path.join(
          __dirname,
          "..",
          existingCustomer.id_card
        );
        deleteFileIfExists(absolutePath);
      }
    }

    // Validate data
    const { error } = Customer.validate(updateData);
    if (error) {
      if (req.file) {
        const absolutePath = path.join(__dirname, "..", req.file.fullPath);
        deleteFileIfExists(absolutePath);
      }
      return res.status(400).json({
        status: false,
        error: error.details[0].message,
      });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return res.status(200).json({
      status: true,
      data: updatedCustomer,
      message: "Customer updated successfully",
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    if (req.file) {
      const absolutePath = path.join(__dirname, "..", req.file.fullPath);
      deleteFileIfExists(absolutePath);
    }
    return res.status(500).json({
      status: false,
      error: "Internal server error",
    });
  }
};

// delete customer
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    //  check customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCustomer) {
      return res.status(404).json({
        status: false,
        error: "Customer not found",
      });
    }

    //  Delete the customer
    await prisma.customer.update({
      where: { id: parseInt(id) },
      data: {
        isActive: false,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Customer deleted successfully",
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
  addCustomer,
  getAllCustomer,
  updateCustomer,
  deleteCustomer,
};
