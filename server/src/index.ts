import express from "express";
import cors from "cors";
import analyzeRoute from "./routes/analyzeRoute";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());
app.use("/api/analyze", analyzeRoute);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
