import * as amqp from "amqplib";

export interface RabbitMQSubscriberConfig {
  url: string;
  exchange: string;
  queue: string;
  routingKey: string;
}

export class RabbitMQSubscriber {
  private connection: any = null;
  private channel: any = null;
  private config: RabbitMQSubscriberConfig;

  constructor(config: RabbitMQSubscriberConfig) {
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

        await this.channel!.assertQueue(this.config.queue, { durable: true });

        await this.channel!.bindQueue(this.config.queue, this.config.exchange, this.config.routingKey);

        console.log(`✓ RabbitMQ connected - Exchange: ${this.config.exchange}, Queue: ${this.config.queue}`);
        return;
      } catch (err) {
        retries--;
        if (retries > 0) {
          console.warn(`RabbitMQ connect attempt failed, retrying in ${delay}ms... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 1.5;
        } else {
          console.error("Failed to connect to RabbitMQ:", err);
          throw err;
        }
      }
    }
  }

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
              this.channel.ack(msg);
            } catch (err) {
              console.error(`[RabbitMQ] Error processing message:`, err);
              this.channel.nack(msg, false, true);
            }
          }
        },
        { noAck: false }
      );
    } catch (err) {
      console.error("Failed to set up subscription:", err);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch (err) {
      console.error("Failed to disconnect from RabbitMQ:", err);
    }
  }
}
