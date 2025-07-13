const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create required directories if they don't exist
const createDirectories = () => {
  const baseUploadDir = path.join(__dirname, "..", "upload");

  const directories = [
    path.join(baseUploadDir, "Images", "Customer", "Profile"),
    path.join(baseUploadDir, "Images", "Bank", "Deposit", "Receipt"),
    path.join(baseUploadDir, "Images", "Bank", "Withdraw", "Receipt"),
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  console.log("File filter called for:", file.originalname);
  console.log("File mimetype:", file.mimetype);

  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  console.log("File validation result:", { extname, mimetype });

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error("Only images (jpg, jpeg, png) and PDFs are allowed"));
};

// Customer profile upload middleware
const uploadCustomerProfile = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      console.log("Processing customer profile upload");
      const uploadPath = path.join(
        __dirname,
        "..",
        "upload",
        "Images",
        "Customer",
        "Profile"
      );
      if (!fs.existsSync(uploadPath)) {
        console.log("Creating customer profile directory:", uploadPath);
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      console.log(
        "Generating filename for customer profile:",
        file.originalname
      );
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const sanitizedOriginalname = file.originalname.replace(
        /[^a-zA-Z0-9.]/g,
        "_"
      );
      const finalFilename = uniqueSuffix + "-" + sanitizedOriginalname;
      console.log("Generated filename for customer profile:", finalFilename);
      cb(null, finalFilename);
    },
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).single("id_card");

// Modify the middleware to store the full path
const uploadCustomerProfileMiddleware = (req, res, next) => {
  uploadCustomerProfile(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    // If file was uploaded, store the full path using normalized path
    if (req.file) {
      const relativePath = path.join(
        "upload",
        "Images",
        "Customer",
        "Profile",
        req.file.filename
      );
      // Convert Windows backslashes to forward slashes for URL consistency
      req.file.fullPath = relativePath.split(path.sep).join("/");
    }
    next();
  });
};

// Delete file utility function
const deleteFileIfExists = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`File deleted successfully: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
};
// Bank deposit receipt upload middleware
const uploadBankDepositReceipt = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      console.log("Processing bank deposit receipt upload");
      const uploadPath = path.join(
        __dirname,
        "..",
        "upload",
        "Images",
        "Bank",
        "Deposit",
        "Receipt"
      );
      if (!fs.existsSync(uploadPath)) {
        console.log("Creating bank deposit receipt directory:", uploadPath);
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      console.log(
        "Generating filename for bank deposit receipt:",
        file.originalname
      );
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const sanitizedOriginalname = file.originalname.replace(
        /[^a-zA-Z0-9.]/g,
        "_"
      );
      const finalFilename = uniqueSuffix + "-" + sanitizedOriginalname;
      console.log(
        "Generated filename for bank deposit receipt:",
        finalFilename
      );
      cb(null, finalFilename);
    },
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).single("receipt_image");

const uploadBankDepositReceiptMiddleware = (req, res, next) => {
  uploadBankDepositReceipt(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    // If file was uploaded, store the full path using normalized path
    if (req.file) {
      const relativePath = path.join(
        "upload",
        "Images",
        "Bank",
        "Deposit",
        "Receipt",
        req.file.filename
      );
      // Convert Windows backslashes to forward slashes for URL consistency
      req.file.fullPath = relativePath.split(path.sep).join("/");
    }
    next();
  });
};

const uploadBankWithdrawReceipt = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      console.log("Processing bank withdraw receipt upload");
      const uploadPath = path.join(
        __dirname,
        "..",
        "upload",
        "Images",
        "Bank",
        "Withdraw",
        "Receipt"
      );
      if (!fs.existsSync(uploadPath)) {
        console.log("Creating bank withdraw receipt directory:", uploadPath);
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      console.log(
        "Generating filename for bank withdraw receipt:",
        file.originalname
      );
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const sanitizedOriginalname = file.originalname.replace(
        /[^a-zA-Z0-9.]/g,
        "_"
      );
      const finalFilename = uniqueSuffix + "-" + sanitizedOriginalname;
      console.log(
        "Generated filename for bank withdraw receipt:",
        finalFilename
      );
      cb(null, finalFilename);
    },
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).single("receipt_image");

const uploadBankWithdrawReceiptMiddleware = (req, res, next) => {
  uploadBankWithdrawReceipt(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    // If file was uploaded, store the full path using normalized path
    if (req.file) {
      const relativePath = path.join(
        "upload",
        "Images",
        "Bank",
        "Withdraw",
        "Receipt",
        req.file.filename
      );
      // Convert Windows backslashes to forward slashes for URL consistency
      req.file.fullPath = relativePath.split(path.sep).join("/");
    }
    next();
  });
};

// upload sale credit receipt
const uploadSalesCreditReceipt = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(__dirname, "..", "upload", "Images", "Sales", "Credit", "Receipt");
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const sanitizedOriginalname = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
      const finalFilename = uniqueSuffix + "-" + sanitizedOriginalname;
      file.generatedFilename = finalFilename; // Store filename directly on file
      cb(null, finalFilename);
    },
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("image"); // Make sure frontend uses name="image"


const uploadSalesCreditReceiptMiddleware = (req, res, next) => {
  uploadSalesCreditReceipt(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (req.file && req.file.generatedFilename) {
      const relativePath = path.join(
        "upload",
        "Images",
        "Sales",
        "Credit",
        "Receipt",
        req.file.generatedFilename
      );
      req.file.fullPath = relativePath.split(path.sep).join("/"); // Normalize slashes
    }

    next();
  });
};

// Create directories on module load
createDirectories();

module.exports = {
  uploadCustomerProfileMiddleware,
  deleteFileIfExists,
  uploadBankDepositReceipt,
  uploadBankDepositReceiptMiddleware,
  uploadBankWithdrawReceipt,
  uploadBankWithdrawReceiptMiddleware,
  uploadSalesCreditReceipt,
  uploadSalesCreditReceiptMiddleware
};
