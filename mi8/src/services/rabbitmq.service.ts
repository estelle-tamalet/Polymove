import * as amqp from 'amqplib';

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
      
      // Assert exchange with type 'topic' for event-driven architecture
      await this.channel.assertExchange(this.config.exchange, 'topic', { durable: true });
      
      // Assert queue
      await this.channel.assertQueue(this.config.queue, { durable: true });
      
      // Bind queue to exchange with routing key
      await this.channel.bindQueue(this.config.queue, this.config.exchange, this.config.routingKey);

      console.log(`RabbitMQ connected - Exchange: ${this.config.exchange}, Queue: ${this.config.queue}`);
    } catch (err) {
      console.error('RabbitMQ connection error:', err);
      throw err;
    }
  }

  async subscribe(callback: (msg: any) => Promise<void>): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not connected');
    }

    try {
      await this.channel.consume(this.config.queue, async (msg: any) => {
        if (msg) {
          try {
            await callback(msg);
            this.channel.ack(msg);
          } catch (err) {
            console.error('Error processing RabbitMQ message:', err);
            this.channel.nack(msg, false, true); // Requeue on error
          }
        }
      }, { noAck: false });

      console.log(`Subscribed to queue: ${this.config.queue}`);
    } catch (err) {
      console.error('RabbitMQ subscribe error:', err);
      throw err;
    }
  }

  async publish(data: any): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not connected');
    }

    try {
      this.channel.publish(
        this.config.exchange,
        this.config.routingKey,
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
      );
    } catch (err) {
      console.error('RabbitMQ publish error:', err);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('RabbitMQ disconnected');
    } catch (err) {
      console.error('RabbitMQ disconnect error:', err);
    }
  }
}
