import express from "express";
import { initDatabase, pool } from "./db/db.js";
import { RabbitMQService, type RabbitMQConfig } from "./services/rabbitmq.service.js";
import * as subscriberService from "./services/subscriber.service.js";
import subscriberRoutes from "./routes/subscriber.routes.js";

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());

async function initializeRabbitMQ(): Promise<void> {
  const rabbitmqConfig: RabbitMQConfig = {
    url: process.env.RABBITMQ_URL || "amqp://admin:admin@rabbitmq:5672",
    exchange: "notifications_exchange",
    queue: "laposte.student.registered",
    routingKey: "student.registered",
  };

  const rabbitmq = new RabbitMQService(rabbitmqConfig);

  try {
    await rabbitmq.connect();

    await rabbitmq.subscribe(async (msg: any) => {
      const event = JSON.parse(msg.content.toString());
      console.log(`[La Poste] Received event: student.registered for studentId ${event.studentId}`);

      try {
        await subscriberService.handleStudentRegistered(event);
      } catch (err) {
        console.error(`[Error] Failed to process student.registered event:`, err);
        throw err;
      }
    });

    console.log("✓ RabbitMQ subscriber initialized");
  } catch (err) {
    console.error("Failed to initialize RabbitMQ:", err);
  }
}

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "la-poste" });
});

app.use("/api", subscriberRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || "Internal server error",
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

async function startServer(): Promise<void> {
  try {
    console.log("Initializing database...");
    await initDatabase();

    console.log("Initializing RabbitMQ...");
    await initializeRabbitMQ();

    app.listen(PORT, () => {
      console.log(`✓ La Poste service running on port ${PORT}`);
      console.log(`  API: http://localhost:${PORT}/api`);
      console.log(`  Health: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("\nShutting down La Poste service...");
  try {
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
});

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
