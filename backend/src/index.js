import dotenv from 'dotenv'
dotenv.config({ path: '.env' })


import express from 'express';
import studentRoutes from './routes/studentRoutes.js';
import connectDB from './db/index.js'
import cors from "cors";
import adminRoutes from "./routes/adminRoutes.js";


// initialise express app
const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",          // Local frontend
    "https://super30-psi.vercel.app" // Production frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Connect Database
connectDB()

// middleware to parse JSON Body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/api/students', studentRoutes);
app.use("/api/admin", adminRoutes);


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});


