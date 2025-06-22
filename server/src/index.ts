import express from "express";
import analyzeRoute from "./routes/analyzeRoute";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use("/api/analyze", analyzeRoute);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
