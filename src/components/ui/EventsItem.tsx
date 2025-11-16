'use client'

import Image from "next/image"
import { useRouter } from "next/navigation";

interface EventsItemProps {
    id: string;
    title: string
    description: string
    username: string;
    displayName: string;
    pfpUrl: string
}

export default function EventsItem({ id, title, description, username, displayName, pfpUrl }: EventsItemProps) {
    const router = useRouter();

    const openEventDetails = async () => {
        const targetUrl = `/event/${id}`;
        router.push(targetUrl);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openEventDetails();
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={openEventDetails}
            onKeyDown={handleKeyDown}
            className="p-3 rounded-lg border border-zinc-700 text-left cursor-pointer hover:border-purple-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 transition"
        >
            <h2 className="text-lg font-semibold mb-1 text-left">{title}</h2>
            <p
                className="mb-3 text-sm text-zinc-600 text-left"
                style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                }}
                title={description}
            >
                {description}
            </p>
            {username && (
                <div className="flex items-center gap-2.5 pt-2 border-t border-zinc-700 text-left">
                    <Image
                        src={pfpUrl}
                        alt={displayName}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="leading-tight text-left">
                        <p className="text-sm font-medium">{displayName}</p>
                        <p className="text-xs text-zinc-400">@{username}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
