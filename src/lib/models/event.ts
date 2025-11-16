import { ObjectId, OptionalUnlessRequiredId } from "mongodb";
import { z } from "zod";
import { getMongoCollection } from "../mongodb";

export const eventInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  creatorFarcasterId: z.number().min(1, "Valid Farcaster FID is required"),
});

export type EventInput = z.infer<typeof eventInputSchema>;

export type EventDocument = EventInput & {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const EVENTS_COLLECTION =
  process.env.MONGODB_COLLECTION_EVENTS || "events";

export async function getEventsCollection() {
  return getMongoCollection<EventDocument>(EVENTS_COLLECTION);
}

export async function listEvents(limit = 50) {
  const collection = await getEventsCollection();
  return collection
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function createEvent(input: EventInput) {
  const data = eventInputSchema.parse(input);
  const collection = await getEventsCollection();
  const now = new Date();
  const doc: OptionalUnlessRequiredId<EventDocument> = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(doc);
  return { ...data, _id: result.insertedId, createdAt: now, updatedAt: now };
}

export async function updateEvent(
  id: ObjectId,
  input: Partial<EventInput>
) {
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
