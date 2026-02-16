import "dotenv/config";
import express from "express";
import studentRoutes from "./routes/student.routes.js";
import internshipRoutes from "./routes/internship.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(studentRoutes);
app.use(internshipRoutes);

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
