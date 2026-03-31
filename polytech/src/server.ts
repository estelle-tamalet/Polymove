import "dotenv/config";
import express, { Express, Request, Response } from "express";
import studentRoutes from "./routes/student.routes.js";
import internshipRoutes from "./routes/internship.routes.js";
import { getOffers } from "./services/offerAggregator.service.js";
import { initializePublisher } from "./services/rabbitmq.publisher.js";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(studentRoutes);
app.use(internshipRoutes);

app.get("/offers", async (req: Request, res: Response): Promise<void> => {
  try {
    const offers = await getOffers(req.query);
    res.json(offers);
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({ error: (err as Error).message });
  }
});

app.use((err: any, req: express.Request, res: Response, next: express.NextFunction) => {
  console.error("[Server] Unhandled error:", err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ error: err.message || "Internal server error" });
});

app.use((req: express.Request, res: Response) => {
  console.log("[Server] 404 for:", req.method, req.path);
  res.status(404).json({ error: "Not found" });
});


async function startServer(): Promise<void> {
  try {
    console.log("Initializing RabbitMQ Publisher...");
    await initializePublisher();
    console.log("✓ RabbitMQ Publisher initialized");
  } catch (err) {
    console.error("Warning: RabbitMQ Publisher initialization failed (service will continue):", err);
  }

  app.listen(PORT, () => {
    console.log("✓ Polytech service running on port " + PORT);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
