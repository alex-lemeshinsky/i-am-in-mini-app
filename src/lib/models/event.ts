import { Filter, ObjectId, OptionalUnlessRequiredId } from "mongodb";
import { z } from "zod";
import { getMongoCollection } from "../mongodb";
import { farcasterUserSchema, type FarcasterUser } from "./user";

export const eventInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  creator: farcasterUserSchema,
  participants: z.array(farcasterUserSchema).default([]),
});

export type EventInput = z.infer<typeof eventInputSchema>;

export type EventDocument = EventInput & {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const EVENTS_COLLECTION = process.env.MONGODB_COLLECTION_EVENTS || "events";

export async function getEventsCollection() {
  return getMongoCollection<EventDocument>(EVENTS_COLLECTION);
}

export async function listEvents(
  limit = 50,
  skip = 0,
  creatorFid?: number,
  participantFid?: number
) {
  const collection = await getEventsCollection();
  const query: Filter<EventDocument> = {};

  if (creatorFid) {
    query["creator.fid"] = creatorFid;
  }

  if (participantFid) {
    query["participants.fid"] = participantFid;
  }

  return collection
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
}

export async function getEventById(id: string) {
  const collection = await getEventsCollection();
  try {
    const objectId = new ObjectId(id);
    return await collection.findOne({ _id: objectId });
  } catch {
    return null;
  }
}

export async function createEvent(input: EventInput) {
  const data = eventInputSchema.parse(input);
  const collection = await getEventsCollection();
  const now = new Date();
  const doc: OptionalUnlessRequiredId<EventDocument> = {
    _id: new ObjectId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(doc);
  return { ...data, _id: result.insertedId, createdAt: now, updatedAt: now };
}

export async function updateEvent(id: ObjectId, input: Partial<EventInput>) {
  const collection = await getEventsCollection();
  const now = new Date();
  await collection.updateOne(
    { _id: id },
    {
      $set: {
        ...input,
        updatedAt: now,
      },
    }
  );
  return collection.findOne({ _id: id });
}

export function serializeEvent(event: EventDocument) {
  return {
    ...event,
    _id: event._id.toString(),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}

export async function addParticipantToEvent(
  eventId: string,
  participant: FarcasterUser
) {
  const collection = await getEventsCollection();
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(eventId);
  } catch {
    return null;
  }

  const event = await collection.findOne({ _id: objectId });
  if (!event) {
    return null;
  }

  const alreadyRegistered = event.participants?.some(
    (entry) => entry.fid === participant.fid
  );
  if (alreadyRegistered) {
    return event;
  }

  const updatedAt = new Date();
  await collection.updateOne(
    { _id: objectId },
    {
      $push: { participants: participant },
      $set: { updatedAt },
    }
  );

  const updatedEvent = await collection.findOne({ _id: objectId });
  if (!updatedEvent) {
    return null;
  }

  return { event: updatedEvent, updatedAt };
}
