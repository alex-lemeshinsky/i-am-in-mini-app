import { NextRequest } from "next/server";
import {
  addParticipantToEvent,
  serializeEvent,
} from "~/lib/models/event";
import { farcasterUserSchema } from "~/lib/models/user";

type RouteParams = {
  eventId: string;
};

export async function POST(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  if (!process.env.MONGODB_URI) {
    return Response.json(
      { success: false, error: "MongoDB is not configured" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = farcasterUserSchema.safeParse(
    (body as { participant?: unknown })?.participant ?? body
  );
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const updatedEvent = await addParticipantToEvent(
      params.eventId,
      parsed.data
    );
    if (!updatedEvent) {
      return Response.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      event: serializeEvent(updatedEvent),
    });
  } catch (error) {
    console.error("Failed to register participant", error);
    return Response.json(
      { success: false, error: "Failed to register for event" },
      { status: 500 }
    );
  }
}
