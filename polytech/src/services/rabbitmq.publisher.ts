/**
 * RabbitMQ Publisher Service for Polytech
 * Publishes domain events to the message bus
 */

import * as amqp from "amqplib";

export interface RabbitMQPublisherConfig {
  url: string;
  exchange: string;
}

export class RabbitMQPublisher {
  private connection: any = null;
  private channel: any = null;
  private config: RabbitMQPublisherConfig;
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: RabbitMQPublisherConfig) {
    this.config = config;
  }

  /**
   * Connect to RabbitMQ and setup exchange
   */
  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.config.url);
      this.channel = await this.connection.createChannel();

      // Assert exchange with type 'topic' for topic-based routing
      await this.channel!.assertExchange(this.config.exchange, "topic", { durable: true });

      this.connected = true;
      this.reconnectAttempts = 0;
      console.log(`✓ RabbitMQ Publisher connected - Exchange: ${this.config.exchange}`);
    } catch (err) {
      console.error("Failed to connect to RabbitMQ Publisher:", err);
      this.connected = false;
      // Implement retry logic
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.pow(2, this.reconnectAttempts) * 1000;
        console.log(`Retrying RabbitMQ Publisher connection in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        setTimeout(() => this.connect().catch(err => console.error("Reconnect failed:", err)), delay);
      }
    }
  }

  /**
   * Publish an event to the exchange
   * @param routingKey - The routing key for the event
   * @param data - The event payload
   */
  async publish(routingKey: string, data: any): Promise<void> {
    if (!this.connected || !this.channel) {
      console.warn(`[RabbitMQ] Not connected - skipping publish of ${routingKey}`);
      return;
    }

    try {
      this.channel.publish(
        this.config.exchange,
        routingKey,
        Buffer.from(JSON.stringify(data)),
        { persistent: true } // Make message persistent
      );
      console.log(`✓ Event published: ${routingKey}`);
    } catch (err) {
      console.error(`Failed to publish event ${routingKey}:`, err);
      // Don't throw - don't break the service because of message bus failure
    }
  }

  /**
   * Check if publisher is connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Close RabbitMQ connection
   */
  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.connected = false;
      console.log("✓ RabbitMQ Publisher connection closed");
    } catch (err) {
      console.error("Error closing RabbitMQ Publisher connection:", err);
    }
  }
}

// Singleton instance
let publisher: RabbitMQPublisher | null = null;

/**
 * Initialize and return the publisher instance
 */
export async function initializePublisher(): Promise<RabbitMQPublisher> {
  if (!publisher) {
    publisher = new RabbitMQPublisher({
      url: process.env.RABBITMQ_URL || "amqp://admin:admin@rabbitmq:5672",
      exchange: "notifications_exchange",
    });
  }
  
  // Always ensure connected
  if (!publisher.isConnected()) {
    await publisher.connect();
  }
  
  return publisher;
}

/**
 * Get the publisher instance
 */
export function getPublisher(): RabbitMQPublisher | null {
  return publisher;
}
