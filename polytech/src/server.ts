import "dotenv/config";
import express, { Express } from "express";
import studentRoutes from "./routes/student.routes";
import internshipRoutes from "./routes/internship.routes";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(studentRoutes);
app.use(internshipRoutes);

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
