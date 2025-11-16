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
        <div className="p-4 rounded-xl border border-zinc-700">
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="mb-4">{description}</p>
            {username && (
                <div className="flex items-center gap-3 pt-3 border-t border-zinc-700">
                    <Image
                        src={pfpUrl}
                        alt={displayName}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <p className="font-medium">{displayName}</p>
                        <p className="text-sm text-zinc-400">@{username}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
