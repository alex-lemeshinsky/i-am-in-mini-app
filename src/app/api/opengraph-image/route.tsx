import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getNeynarUser } from "~/lib/neynar";
import { getEventById } from "~/lib/models/event";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');
  const eventId = searchParams.get('eventId');

  const [user, event] = await Promise.all([
    fid ? getNeynarUser(Number(fid)) : Promise.resolve(null),
    eventId ? getEventById(eventId) : Promise.resolve(null),
  ]);

  if (event) {
    const creatorName =
      event.creator.displayName || `@${event.creator.username}`;
    const description =
      event.description.length > 220
        ? `${event.description.slice(0, 217)}…`
        : event.description;

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            width: "100%",
            padding: "64px",
            backgroundColor: "#0f0f1c",
            color: "#fff",
            backgroundImage:
              "radial-gradient(circle at top, rgba(108,99,255,0.4), transparent 55%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1), transparent 60%)",
          }}
        >
          <div
            style={{
              fontSize: 24,
              textTransform: "uppercase",
              letterSpacing: "0.6em",
              color: "#cbbfff",
            }}
          >
            I am in · Farcaster mini app
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <h1
              style={{
                fontSize: 88,
                lineHeight: 1.05,
                fontWeight: 700,
              }}
            >
              {event.title}
            </h1>
            <p
              style={{
                fontSize: 32,
                lineHeight: 1.5,
                color: "#d1d5db",
              }}
            >
              {description}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 28,
                color: "#d1d5db",
              }}
            >
              <span>Hosted by</span>
              <span style={{ color: "#fff", fontWeight: 600 }}>
                {creatorName}
              </span>
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                backgroundColor: "#7c3aed",
                color: "#fff",
                borderRadius: 999,
                padding: "18px 36px",
              }}
            >
              I am in
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 800,
      }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#4c1d95",
          color: "#fff",
        }}
      >
        {user?.pfp_url ? (
          <div
            style={{
              display: "flex",
              width: 384,
              height: 384,
              borderRadius: "50%",
              overflow: "hidden",
              marginBottom: 32,
              border: "16px solid white",
            }}
          >
            <img
              src={user.pfp_url}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : null}
        <h1 style={{ fontSize: 96, fontWeight: 600, textAlign: "center" }}>
          {user?.display_name
            ? `Hello from ${user.display_name ?? user.username}!`
            : "Hello!"}
        </h1>
        <p style={{ fontSize: 48, marginTop: 16, opacity: 0.85 }}>
          Powered by Neynar 🪐
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 800,
    }
  );
}
