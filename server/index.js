const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const adminRouter = require("./Routes/adminRoute.js");
const authRouter = require("./Routes/authRoute.js");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://aqua-erp.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "UPDATE"],
    credentials: true,
    // /
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);

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
