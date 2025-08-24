import express from "express";
import cors from "cors";
import analyzeRoute from "./routes/analyzeRoute";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// CORS configuration for production
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [process.env.FRONTEND_URL || "https://your-app.vercel.app"]
      : [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:3000",
        ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Health check endpoint for Railway
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

app.use("/api/analyze", analyzeRoute);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
