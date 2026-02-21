const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const adminRouter = require("./Routes/adminRoute.js");
const authRouter = require("./Routes/authRoute.js");
const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://aqua-erp.vercel.app",
      "https://aqua.selamdca.org",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "UPDATE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);
app.use("/public", express.static(path.join(__dirname, "upload")));

app.get("/aquaErp", (req, res) => {
  res.send("The server is running");
});

// Public download route using query parameter
app.get("/public-download", (req, res) => {
  let encodedFilePath = req.query.path;
  if (!encodedFilePath) return res.status(400).send("Missing file path");
  let decodedFilePath = decodeURIComponent(encodedFilePath).replace(/\\/g, "/");
  // Remove leading 'upload/' if present
  if (decodedFilePath.startsWith("upload/")) {
    decodedFilePath = decodedFilePath.slice(7);
  }
  const safeFilePath = path.join(__dirname, "upload", decodedFilePath);
  res.download(safeFilePath, (err) => {
    if (err) {
      console.error("Error downloading the file:", err);
      res.status(404).send("File not found");
    }
  });
});


app.use("/check", (req, res) => {
  res.send("Welcome to Aqua ERP");
});

const prisma = require("./prisma/prisma");

// Test database connection
prisma
  .$connect()
  .then(() => {
    console.log("✅ Connected to database via Prisma!");
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
