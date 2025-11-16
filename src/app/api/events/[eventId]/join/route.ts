import { NextRequest } from "next/server";
import { addParticipantToEvent, serializeEvent } from "~/lib/models/event";

type Params = { eventId: string };

export async function POST(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { eventId } = await context.params;

  if (!process.env.MONGODB_URI) {
    return Response.json(
      { success: false, error: "MongoDB is not configured" },
      { status: 500 }
    );
  }

  let fid: number | undefined;
  try {
    const body = await request.json();
    fid = Number(body?.fid);
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!fid || Number.isNaN(fid)) {
    return Response.json(
      { success: false, error: "Valid fid is required" },
      { status: 400 }
    );
  }

  try {
    const updateResult = await addParticipantToEvent(eventId, {
      fid,
      username: "",
      displayName: "",
      pfpUrl: "",
    });

    if (!updateResult) {
      return Response.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }
    const result = "event" in updateResult ? updateResult.event : updateResult;

    return Response.json({
      success: true,
      event: serializeEvent(result),
    });
  } catch (error) {
    console.error("Failed to join event", error);
    return Response.json(
      { success: false, error: "Failed to join event" },
      { status: 500 }
    );
  }
}
