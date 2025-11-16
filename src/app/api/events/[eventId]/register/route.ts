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
    const updateResult = await addParticipantToEvent(eventId, parsed.data);
    if (!updateResult) {
      return Response.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }
    const updatedEvent =
      "event" in updateResult ? updateResult.event : updateResult;

    const creatorAndParticipants = new Map<number, { fid: number; label: string }>();
    creatorAndParticipants.set(updatedEvent.creator.fid, {
      fid: updatedEvent.creator.fid,
      label: `${updatedEvent.creator.displayName} (@${updatedEvent.creator.username})`,
    });
    for (const participant of updatedEvent.participants ?? []) {
      creatorAndParticipants.set(participant.fid, {
        fid: participant.fid,
        label: `${participant.displayName} (@${participant.username})`,
      });
    }

    const joinedDisplayName = `${parsed.data.displayName} (@${parsed.data.username})`;
    const notificationBody = `${joinedDisplayName} joined "${updatedEvent.title}"`;

    await Promise.all(
      Array.from(creatorAndParticipants.values()).map(async ({ fid }) => {
        const result = await sendMiniAppNotification({
          fid,
          title: updatedEvent.title,
          body: notificationBody,
        });
        if (result.state === "error") {
          console.error(`Failed to notify fid ${fid}`, result.error);
        }
      })
    );

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
