import * as amqp from "amqplib";

export interface RabbitMQConfig {
  url: string;
  exchange: string;
  queue: string;
  routingKey: string;
}

export class RabbitMQService {
  private connection: any = null;
  private channel: any = null;
  private config: RabbitMQConfig;

  constructor(config: RabbitMQConfig) {
    this.config = config;
  }


  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.config.url);
      this.channel = await this.connection.createChannel();

      await this.channel!.assertExchange(this.config.exchange, "topic", { durable: true });

      await this.channel!.assertQueue(this.config.queue, { durable: true });

      await this.channel!.bindQueue(this.config.queue, this.config.exchange, this.config.routingKey);

      console.log(`✓ RabbitMQ connected - Exchange: ${this.config.exchange}, Queue: ${this.config.queue}`);
    } catch (err) {
      console.error("Failed to connect to RabbitMQ:", err);
      throw err;
    }
  }

  /**
   * Subscribe to messages on the configured queue
   * @param callback - Async function to handle received messages
   */
  async subscribe(callback: (msg: any) => Promise<void>): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    try {
      await this.channel.consume(
        this.config.queue,
        async (msg: any) => {
          if (msg) {
            try {
              await callback(msg);
              this.channel!.ack(msg);
              console.log(`✓ Message acknowledged: ${this.config.routingKey}`);
            } catch (err) {
              console.error("Error processing message:", err);
              this.channel!.nack(msg, false, true);
            }
          }
        },
        { noAck: false }
      );

      console.log(`✓ Subscribed to ${this.config.routingKey}`);
    } catch (err) {
      console.error("Failed to subscribe:", err);
      throw err;
    }
  }

  /**
   * Publish a message to the exchange
   * @param data - Message payload
   */
  async publish(data: any): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    try {
      this.channel.publish(
        this.config.exchange,
        this.config.routingKey,
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
      );
      console.log(`✓ Message published: ${this.config.routingKey}`);
    } catch (err) {
      console.error("Failed to publish message:", err);
      throw err;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log("✓ RabbitMQ connection closed");
    } catch (err) {
      console.error("Error closing RabbitMQ connection:", err);
    }
  }
}
