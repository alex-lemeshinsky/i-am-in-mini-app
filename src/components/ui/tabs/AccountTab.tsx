"use client";

import { useEffect, useMemo, useState } from "react";
import { useMiniApp } from "@neynar/react";

type EventItem = {
  _id: string;
  title: string;
  description: string;
  creator: {
    username: string;
    displayName: string;
    pfpUrl: string;
    fid: number;
  };
};

export function AccountTab() {
  const { context } = useMiniApp();
  const userFromContext = context?.user;
  const fid = userFromContext?.fid;
  const profile = useMemo(() => ({
    username: userFromContext?.username ?? "Unknown",
    displayName: userFromContext?.displayName ?? "User",
    pfp: userFromContext?.pfpUrl,
  }), [userFromContext]);

  const [createdEvents, setCreatedEvents] = useState<EventItem[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fid) return;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const creatorUrl = `/api/events?creatorFid=${fid}&limit=20`;
        const participantUrl = `/api/events?participantFid=${fid}&limit=20`;

        const [createdRes, participatingRes] = await Promise.all([
          fetch(creatorUrl),
          fetch(participantUrl),
        ]);

        const createdData = await createdRes.json();
        const participatingData = await participatingRes.json();

        if (!createdData.success) throw new Error(createdData.error || "Failed to load created events");
        if (!participatingData.success) throw new Error(participatingData.error || "Failed to load participation");

        setCreatedEvents(createdData.events);
        setParticipatingEvents(participatingData.events);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [fid]);

  if (!fid) {
    return <p className="text-center text-zinc-400">Sign in to view your account.</p>;
  }

  return (
    <div className="space-y-4 px-4 overflow-y-auto" style={{maxHeight: '80vh'}}>
      <div className="flex items-center gap-3 border border-zinc-700 rounded-lg p-3">
        {profile.pfp ? (
          <img
            src={profile.pfp}
            alt={profile.displayName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-zinc-700" />
        )}
        <div className="leading-tight text-left">
          <p className="text-base font-semibold">{profile.displayName}</p>
          <p className="text-sm text-zinc-400">@{profile.username}</p>
          <p className="text-xs text-zinc-500">FID: {fid}</p>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {loading && <p className="text-center text-zinc-400">Loading…</p>}

      <Section title="My events" items={createdEvents} badge="Created by me" />
      <Section
        title="I am in"
        items={participatingEvents}
        badge="I am attending"
        emptyText="No events attended yet"
      />
    </div>
  );
}

function Section({
  title,
  items,
  emptyText = "No data",
  badge,
}: {
  title: string;
  items: EventItem[];
  emptyText?: string;
  badge?: string;
}) {
  return (
    <div className="border border-zinc-700 rounded-lg p-3">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-400">{emptyText}</p>
      ) : (
        <div className="grid gap-3">
          {items.map((event) => (
            <div key={event._id} className="p-3 rounded-lg border border-zinc-700 text-left">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-base font-semibold">{event.title}</h4>
                {badge && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/20 text-primary-dark border border-primary/40">
                    {badge}
                  </span>
                )}
              </div>
              <p
                className="mb-3 text-sm text-zinc-500"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {event.description}
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                {event.creator?.pfpUrl ? (
                  <img
                    src={event.creator.pfpUrl}
                    alt={event.creator.displayName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-700" />
                )}
                <div className="leading-tight">
                  <p className="text-sm font-medium">
                    {event.creator.displayName}
                  </p>
                  <p className="text-xs text-zinc-400">@{event.creator.username}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
