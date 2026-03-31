import * as amqp from "amqplib";

export interface RabbitMQPublisherConfig {
  url: string;
  exchange: string;
}

export class RabbitMQPublisher {
  private connection: any = null;
  private channel: any = null;
  private config: RabbitMQPublisherConfig;
  private isConnected = false;

  constructor(config: RabbitMQPublisherConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    let retries = 5;
    let delay = 1000;

    while (retries > 0) {
      try {
        this.connection = await amqp.connect(this.config.url);
        this.channel = await this.connection.createChannel();

        await this.channel!.assertExchange(this.config.exchange, "topic", { durable: true });

        this.isConnected = true;
        console.log(`✓ RabbitMQ Publisher connected - Exchange: ${this.config.exchange}`);
        return;
      } catch (err) {
        retries--;
        if (retries > 0) {
          console.warn(`RabbitMQ connect attempt failed, retrying in ${delay}ms... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 1.5;
        } else {
          console.error("Failed to connect to RabbitMQ Publisher after retries:", err);
          this.isConnected = false;
        }
      }
    }
  }

  async publish(routingKey: string, message: any): Promise<void> {
    if (!this.isConnected) {
      console.warn(`[RabbitMQ] Not connected, skipping publish to ${routingKey}`);
      return;
    }

    try {
      const payload = JSON.stringify(message);
      this.channel!.publish(this.config.exchange, routingKey, Buffer.from(payload), { persistent: true });
    } catch (err) {
      console.error(`Failed to publish message to ${routingKey}:`, err);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.isConnected = false;
    } catch (err) {
      console.error("Failed to disconnect from RabbitMQ:", err);
    }
  }
}

let publisher: RabbitMQPublisher | null = null;

export async function initializePublisher(): Promise<void> {
  const config: RabbitMQPublisherConfig = {
    url: process.env.RABBITMQ_URL || "amqp://admin:admin@rabbitmq:5672",
    exchange: "offers_exchange",
  };

  publisher = new RabbitMQPublisher(config);
  await publisher.connect();
}

export function getPublisher(): RabbitMQPublisher | null {
  return publisher;
}
