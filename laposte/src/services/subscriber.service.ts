import * as subscriberRepository from "../repository/subscriber.repository.js";
import {
  Subscriber,
  SubscriberData,
  StudentRegisteredEvent,
  OfferCreatedEvent,
} from "../models/subscriber.model.js";

export async function createSubscriber(data: SubscriberData): Promise<Subscriber> {
  return subscriberRepository.createSubscriber(data);
}

export async function getSubscribers(studentId: number): Promise<Subscriber[]> {
  return subscriberRepository.getSubscribersByStudentId(studentId);
}

export async function updateSubscriber(
  studentId: number,
  channel: string,
  updates: Partial<SubscriberData>
): Promise<Subscriber> {
  return subscriberRepository.updateSubscriber(studentId, channel, updates);
}

export async function deleteSubscriber(studentId: number, channel: string): Promise<void> {
  return subscriberRepository.deleteSubscriber(studentId, channel);
}

/**
 * Handle student registered event from Polytech
 * When a new student registers, create default subscriber preferences
 * @param event - Student registered event
 */
export async function handleStudentRegistered(event: StudentRegisteredEvent): Promise<void> {
  console.log(`[Subscriber Service] Processing student registered event for student ${event.studentId}`);

  try {
    console.log(`Student registered: ${event.studentId} | Domain: ${event.domain} | Name: ${event.name}`);

    const preferences = [
      {
        studentId: event.studentId,
        domain: event.domain,
        channel: "email" as const,
        contact: "",
        enabled: false,
      },
      {
        studentId: event.studentId,
        domain: event.domain,
        channel: "discord" as const,
        contact: "",
        enabled: false,
      },
    ];

    for (const pref of preferences) {
      try {
        await subscriberRepository.createSubscriber(pref);
        console.log(`✓ Created default preference for student ${event.studentId} on channel ${pref.channel}`);
      } catch (err) {
        if ((err as any).constructor.name === "ConflictError") {
          console.log(`[Info] Preference already exists for student ${event.studentId} on channel ${pref.channel}`);
        } else {
          console.warn(`Could not create preference for ${pref.channel}:`, (err as Error).message);
        }
      }
    }

    console.log(`✓ Student ${event.studentId} preferences initialized`);
  } catch (err) {
    console.error(`Error handling student registered event: ${(err as Error).message}`);
    throw err;
  }
}

export async function handleOfferCreated(event: OfferCreatedEvent): Promise<void> {
  console.log(`[Subscriber Service] Processing offer created event for offerId ${event.offerId}`);

  try {
    const subscribers = await subscriberRepository.getSubscribersByDomain(event.domain);

    for (const subscriber of subscribers) {
      if (!subscriber.enabled || !subscriber.contact) {
        continue;
      }

      const alertMessage = `New ${event.domain} internship in ${event.city}: ${event.title}${event.salary ? ` (${event.salary}€)` : ''}`;

      console.log(`[Alert] Sending ${subscriber.channel} alert to subscriber ${subscriber.studentId}: ${alertMessage}`);
    }

    console.log(`✓ Processed offer alert for ${subscribers.length} subscribers in domain ${event.domain}`);
  } catch (err) {
    console.error(`Error handling offer created event: ${(err as Error).message}`);
    throw err;
  }
}
