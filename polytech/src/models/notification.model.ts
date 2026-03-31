export interface Notification {
  id: number;
  studentId: number;
  type: string;
  offerId: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface NotificationData {
  studentId: number;
  type: string;
  offerId: string;
  message: string;
}
