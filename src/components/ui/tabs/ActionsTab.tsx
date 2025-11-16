'use client';

import { FormEvent, useState } from 'react';
import { useMiniApp } from '@neynar/react';
import { Button } from '../Button';
import { APP_URL } from '~/lib/constants';

interface FormState {
  title: string;
  description: string;
}

/**
 * Create-tab UI that allows authors to publish events by providing a title and
 * description. Submissions are persisted to MongoDB via the `/api/events`
 * endpoint.
 */
export function ActionsTab() {
  const { context, actions } = useMiniApp();
  const [formState, setFormState] = useState<FormState>({
    title: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);

    const creatorUser = context?.user as Record<string, any> | undefined;

    if (!creatorUser?.fid || !creatorUser?.username) {
      setStatusMessage({
        type: 'error',
        text: 'Sign in with Farcaster to publish events.',
      });
      return;
    }

    if (!formState.title.trim() || !formState.description.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Both title and description are required.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formState.title.trim(),
          description: formState.description.trim(),
          creator: {
            fid: creatorUser.fid,
            username: creatorUser.username,
            displayName:
              creatorUser.displayName ||
              creatorUser.display_name ||
              creatorUser.fullName ||
              creatorUser.name ||
              creatorUser.username,
            pfpUrl:
              creatorUser.pfpUrl ||
              creatorUser.pfp_url ||
              creatorUser.photoUrl ||
              creatorUser.photo_url ||
              'https://i.imgur.com/1Q9Z1Zt.png',
          },
          participants: [],
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.success === false || !result?.event?._id) {
        throw new Error(result?.error || 'Failed to create event');
      }

      const eventId = result.event._id as string;
      const eventPath = `/event/${eventId}`;
      const eventShareUrl = `${APP_URL}${eventPath}`;
      const shareText = `I just created "${formState.title.trim()}"\n\n${formState.description.trim()}\n\nJoin the event using the mini app preview below.`;

      setStatusMessage({
        type: 'success',
        text: 'Event created successfully.',
      });
      setFormState({ title: '', description: '' });

      try {
        // Share the event URL so Farcaster can fetch the fc:miniapp metadata
        // and render the "I am in" mini app preview per the sharing guide.
        await actions.composeCast({
          text: shareText,
          embeds: [eventShareUrl],
        });
      } catch (composeError) {
        console.error('Failed to open Farcaster composer:', composeError);
      }
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unexpected error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-6 w-full max-w-md mx-auto space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Create event</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Publish a new event by providing the essentials below.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`text-sm rounded-md px-3 py-2 ${
            statusMessage.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
      >
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Creator Farcaster FID
          </div>
          <div className="text-sm text-gray-900 dark:text-gray-100 font-mono">
            {context?.user?.fid ?? 'Not signed in'}
          </div>
          {!context?.user?.fid && (
            <p className="text-xs text-red-600 dark:text-red-400">
              Sign in within the Actions tab to submit events.
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="event-title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Title
          </label>
          <input
            id="event-title"
            name="title"
            type="text"
            value={formState.title}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Community meetup"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="event-description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>
          <textarea
            id="event-description"
            name="description"
            value={formState.description}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Share agenda, speakers, or other highlights..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !context?.user?.fid}
          isLoading={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Publish event'}
        </Button>
      </form>
    </div>
  );
}
