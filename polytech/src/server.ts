import "dotenv/config";
import express, { Express, Request, Response } from "express";
import studentRoutes from "./routes/student.routes.js";
import internshipRoutes from "./routes/internship.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import { getOffers } from "./services/offerAggregator.service.js";
import { initializePublisher } from "./services/rabbitmq.publisher.js";
import { RabbitMQSubscriber } from "./services/rabbitmq.subscriber.js";
import * as studentService from "./services/student.service.js";
import * as notificationService from "./services/notification.service.js";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(studentRoutes);
app.use(internshipRoutes);
app.use(notificationRoutes);

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

async function initializeRabbitMQSubscriber(): Promise<void> {
  const config = {
    url: process.env.RABBITMQ_URL || "amqp://admin:admin@rabbitmq:5672",
    exchange: "offers_exchange",
    queue: "polytech.offer.created",
    routingKey: "offer.created",
  };

  const subscriber = new RabbitMQSubscriber(config);

  try {
    await subscriber.connect();

    await subscriber.subscribe(async (msg: any) => {
      const event = JSON.parse(msg.content.toString());
      console.log(`[Polytech] Received event: offer.created for offerId ${event.offerId}`);

      try {
        const students = await studentService.getAllStudents(event.domain);

        for (const student of students) {
          await notificationService.createNotification({
            studentId: student.id,
            type: "new_offer",
            offerId: event.offerId,
            message: `New ${event.domain} internship in ${event.city}: ${event.title}`,
          });
        }

        console.log(`[Polytech] Notifications created for ${students.length} students`);
      } catch (err) {
        console.error(`[Error] Failed to process offer.created event:`, err);
        throw err;
      }
    });

    console.log("✓ RabbitMQ subscriber initialized");
  } catch (err) {
    console.error("Warning: RabbitMQ subscriber initialization failed (service will continue):", err);
  }
}

async function startServer(): Promise<void> {
  try {
    console.log("Initializing RabbitMQ Publisher...");
    await initializePublisher();
    console.log("✓ RabbitMQ Publisher initialized");
  } catch (err) {
    console.error("Warning: RabbitMQ Publisher initialization failed (service will continue):", err);
  }

  try {
    console.log("Initializing RabbitMQ Subscriber...");
    await initializeRabbitMQSubscriber();
  } catch (err) {
    console.error("Warning: RabbitMQ Subscriber initialization failed (service will continue):", err);
  }

  app.listen(PORT, () => {
    console.log("✓ Polytech service running on port " + PORT);
  });
}


startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
