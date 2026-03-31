export interface SubscriberData {
  studentId: number;
  domain: string;
  channel: "discord" | "email";
  contact: string;
  enabled?: boolean;
}

export interface Subscriber extends SubscriberData {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentRegisteredEvent {
  studentId: number;
  name: string;
  domain: string;
  createdAt: Date;
}
