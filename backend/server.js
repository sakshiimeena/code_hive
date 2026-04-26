import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import roomRoutes from './routes/room_route.js';
import userRoutes from './routes/user_route.js';
import fileRoutes from './routes/file_route.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Middleware
app.use(express.json());

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://codehiveng.vercel.app']
    : ['http://localhost:3000'],
  credentials: true
}));

// ✅ FIXED API ROUTE
app.post("/api/execute", async (req, res) => {
  try {
    const { language, version, sourceCode, stdin } = req.body;

    console.log("Incoming request:", req.body);

    // ✅ Validate input
    if (!sourceCode) {
      return res.status(400).json({ error: "No source code provided" });
    }

    const response = await axios.post(
      "http://13.60.55.22/api/v2/execute",
      {
        language: language || "python",   // ✅ default
        version: "*",          // ✅ default
        files: [
  {
    name: "main.js",
    content: sourceCode
  }
],
        stdin: stdin || ""
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "codelens-piston-2024"
        },
        timeout: 15000   // ✅ prevent hanging
      }
    );

    console.log("API Response:", response.data);

    // ✅ Always return clean response
    return res.status(200).json(response.data);

  } catch (error) {
    console.error("FULL ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);

// DB + Server
try {
  await connectDB();
  console.log('Database connected successfully');

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}