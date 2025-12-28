import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const hashedPassword = await bcrypt.hash("123456", 10);
    
    const admin = await User.findOneAndUpdate(
      { email: "admin@example.com" },
      { 
        email: "admin@example.com", 
        username: "Admin", 
        password: hashedPassword, 
        isAdmin: true,
        isSuspended: false
      },
      { upsert: true, new: true }
    );

    console.log("✅ Admin user created/updated:");
    console.log("   Email:", admin.email);
    console.log("   Username:", admin.username);
    console.log("   isAdmin:", admin.isAdmin);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

createAdmin();
