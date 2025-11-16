import { NextRequest } from "next/server";
import { createEvent, eventInputSchema, listEvents } from "~/lib/models/event";

export async function GET(request: NextRequest) {
  if (!process.env.MONGODB_URI) {
    return Response.json(
      { success: false, error: "MongoDB is not configured" },
      { status: 500 }
    );
  }

  try {
    const url = new URL(request.url);
    const limitParam = Number(url.searchParams.get("limit")) || 20;
    const pageParam = Number(url.searchParams.get("page")) || 1;
    const creatorFidParam = url.searchParams.get("creatorFid");
    const participantFidParam = url.searchParams.get("participantFid");

    const limit = Math.min(Math.max(limitParam, 1), 100);
    const page = Math.max(pageParam, 1);
    const skip = (page - 1) * limit;
    const creatorFid = creatorFidParam ? Number(creatorFidParam) || undefined : undefined;
    const participantFid = participantFidParam ? Number(participantFidParam) || undefined : undefined;

    const events = await listEvents(limit + 1, skip, creatorFid, participantFid);
    const hasMore = events.length > limit;
    const trimmed = hasMore ? events.slice(0, limit) : events;

    return Response.json({
      success: true,
      page,
      limit,
      hasMore,
      events: trimmed.map((event) => ({
        ...event,
        _id: event._id.toString(),
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Failed to list events", error);
    return Response.json(
      { success: false, error: "Failed to list events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

  const parsed = eventInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const event = await createEvent(parsed.data);
    return Response.json({
      success: true,
      event: {
        ...event,
        _id: event._id.toString(),
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to create event", error);
    return Response.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}
