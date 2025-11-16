import { NextRequest } from "next/server";
import { createEvent, eventInputSchema } from "~/lib/models/event";

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
