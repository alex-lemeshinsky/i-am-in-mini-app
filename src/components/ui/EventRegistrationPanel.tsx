"use client";

import { useState, useMemo } from "react";
import { useMiniApp } from "@neynar/react";
import { Button } from "./Button";
import { APP_URL } from "~/lib/constants";

type Participant = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
};

interface EventRegistrationPanelProps {
  eventId: string;
  initialParticipants: Participant[];
}

export function EventRegistrationPanel({
  eventId,
  initialParticipants,
}: EventRegistrationPanelProps) {
  const { context, actions } = useMiniApp();
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const user = context?.user as Record<string, any> | undefined;

  const participantProfile = useMemo(() => {
    if (!user) {
      return null;
    }
    return {
      fid: user.fid,
      username: user.username || `user-${user.fid}`,
      displayName:
        user.displayName ||
        user.display_name ||
        user.fullName ||
        user.name ||
        user.username ||
        `User ${user.fid}`,
      pfpUrl:
        user.pfpUrl ||
        user.pfp_url ||
        user.photoUrl ||
        user.photo_url ||
        "https://i.imgur.com/1Q9Z1Zt.png",
    };
  }, [user]);

  const isAlreadyIn =
    participantProfile &&
    participants.some((entry) => entry.fid === participantProfile.fid);

  const buttonLabel = !participantProfile
    ? "Sign in to join"
    : isAlreadyIn
    ? "You're already in"
    : "I am in";

  const disabled = !participantProfile || Boolean(isAlreadyIn) || isSubmitting;

  const handleRegister = async () => {
    if (!participantProfile || isAlreadyIn) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participant: participantProfile }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.success === false) {
        throw new Error(result?.error || "Failed to register");
      }

      setParticipants(result.event.participants ?? []);

      try {
        const eventUrl = `${APP_URL}/event/${eventId}`;
        const shareText = `I've just registered for the "${result.event.title}" event. Join me using the "I am in" button below.`;
        await actions.composeCast({
          text: shareText,
          embeds: [eventUrl],
        });
      } catch (shareError) {
        console.error("Failed to open composer for registration share:", shareError);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to register"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleRegister}
        disabled={disabled}
        isLoading={isSubmitting}
        className="w-full"
      >
        {buttonLabel}
      </Button>
      {errorMessage && (
        <p className="text-sm text-red-500 dark:text-red-300">{errorMessage}</p>
      )}
      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {participants.length > 0
            ? `${participants.length} ${
                participants.length === 1 ? "person is" : "people are"
              } in for this event.`
            : "Be the first to join this event."}
        </p>
        {participants.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {participants.slice(0, 6).map((participant) => (
              <div
                key={participant.fid}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded-full"
              >
                <img
                  src={participant.pfpUrl}
                  alt={participant.displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-xs leading-tight">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {participant.displayName}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    @{participant.username}
                  </p>
                </div>
              </div>
            ))}
            {participants.length > 6 && (
              <div className="flex items-center justify-center px-4 py-2 rounded-full border border-dashed border-gray-300 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-300">
                +{participants.length - 6} more
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
