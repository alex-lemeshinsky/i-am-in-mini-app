"use client";

import { useEffect, useState } from "react";
import EventsItem from "./EventsItem";

export interface EventResponse {
    _id: string;
    title: string;
    description: string;
    creator: {
        username: string;
        displayName: string;
        pfpUrl: string;
    };
    participants: {
        fid: number;
        username: string;
        displayName: string;
        pfpUrl: string;
    }[];
    createdAt: string;
}

export default function Events() {
    const [events, setEvents] = useState<EventResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadEvents() {
            try {
                const res = await fetch("/api/events");
                const data = await res.json();

                if (!data.success) {
                    throw new Error(data.error || "Failed to load events");
                }

                setEvents(data.events);
            } catch (err) {
                console.error(err);
                setError("Failed to load events");
            } finally {
                setLoading(false);
            }
        }

        loadEvents();
    }, []);

    if (loading) {
        return <p className="text-center text-zinc-400">Loading events...</p>;
    }

    if (error) {
        return <p className="text-center text-red-400">{error}</p>;
    }

    return (
        <div className="overflow-y-auto pr-1 mb-5">
            {events.length === 0 ? (
                <p className="text-center text-zinc-400">No events found.</p>
            ) : (
                <div className="grid gap-3" style={{ maxHeight: "80vh" }}>
                    {events.map((event) => (
                        <EventsItem
                            key={event._id}
                            id={event._id}
                            title={event.title}
                            description={event.description}
                            username={event.creator.username}
                            displayName={event.creator.displayName}
                            pfpUrl={event.creator.pfpUrl}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
