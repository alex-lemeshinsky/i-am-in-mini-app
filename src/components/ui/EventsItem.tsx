'use client'

import Image from "next/image"

interface EventsItemProps {
    title: string
    description: string
    username: string;
    displayName: string;
    pfpUrl: string
}

export default function EventsItem({ title, description, username, displayName, pfpUrl }: EventsItemProps) {
    return (
        <div className="p-3 rounded-lg border border-zinc-700 text-left">
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
