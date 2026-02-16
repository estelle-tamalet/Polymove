import express from "express";
import studentRoutes from "./routes/student.routes.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(studentRoutes);

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
