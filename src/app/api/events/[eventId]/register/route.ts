import { NextRequest } from "next/server";
import {
  addParticipantToEvent,
  serializeEvent,
} from "~/lib/models/event";
import { farcasterUserSchema } from "~/lib/models/user";
import { sendMiniAppNotification } from "~/lib/notifs";

type RouteParams = {
  eventId: string;
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  const { eventId } = await context.params;

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
    const updatedEvent = await addParticipantToEvent(eventId, parsed.data);
    if (!updatedEvent) {
      return Response.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const creatorAndParticipants = new Map<number, { fid: number; label: string }>();
    creatorAndParticipants.set(updatedEvent.event.creator.fid, {
      fid: updatedEvent.event.creator.fid,
      label: `${updatedEvent.event.creator.displayName} (@${updatedEvent.event.creator.username})`,
    });
    for (const participant of updatedEvent.event.participants ?? []) {
      creatorAndParticipants.set(participant.fid, {
        fid: participant.fid,
        label: `${participant.displayName} (@${participant.username})`,
      });
    }

    const joinedDisplayName = `${parsed.data.displayName} (@${parsed.data.username})`;
    const notificationBody = `${joinedDisplayName} joined "${updatedEvent.event.title}"`;

    await Promise.all(
      Array.from(creatorAndParticipants.values()).map(async ({ fid }) => {
        const result = await sendMiniAppNotification({
          fid,
          title: updatedEvent.event.title,
          body: notificationBody,
        });
        if (result.state === "error") {
          console.error(`Failed to notify fid ${fid}`, result.error);
        }
      })
    );

    return Response.json({
      success: true,
      event: serializeEvent(updatedEvent.event ?? updatedEvent),
    });
  } catch (error) {
    console.error("Failed to register participant", error);
    return Response.json(
      { success: false, error: "Failed to register for event" },
      { status: 500 }
    );
  }
}
