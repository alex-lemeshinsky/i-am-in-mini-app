import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { APP_NAME, APP_DESCRIPTION, APP_URL } from "~/lib/constants";
import { getEventById } from "~/lib/models/event";
import { getMiniAppEmbedMetadata } from "~/lib/utils";

type Params = Promise<{ eventId: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { eventId } = await params;
  const event = await getEventById(eventId);

  if (!event) {
    return {
      title: `${APP_NAME} | Event not found`,
      description: APP_DESCRIPTION,
    };
  }

  const launchUrl = `${APP_URL}?eventId=${eventId}`;
  const imageUrl = `${APP_URL}/api/opengraph-image?eventId=${eventId}`;
  const embedMetadata = getMiniAppEmbedMetadata({
    actionUrl: launchUrl,
    buttonTitle: "I am in",
    imageUrl,
  });

  return {
    title: `${event.title} | ${APP_NAME}`,
    description: event.description,
    openGraph: {
      title: `${event.title} | ${APP_NAME}`,
      description: event.description,
      images: [imageUrl],
    },
    other: {
      "fc:miniapp": JSON.stringify(embedMetadata),
      "fc:frame": JSON.stringify(embedMetadata),
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Params;
}) {
  const { eventId } = await params;
  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-300 hover:underline"
          >
            ← Back to events
          </Link>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Hosted on {APP_NAME}
          </span>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-indigo-500">
            {APP_NAME}
          </p>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
            {event.title}
          </h1>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
          {event.description}
        </p>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div className="font-medium text-gray-700 dark:text-gray-200">
            Created by {event.creator.displayName}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            @{event.creator.username} · FID {event.creator.fid}
          </div>
        </div>
      </div>
    </div>
  );
}
