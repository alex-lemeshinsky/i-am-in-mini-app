"use client";

import Events from "../Events";

export function HomeTab() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)] px-6">
      <div className="text-center w-full max-w-md mx-auto">
        <Events />
      </div>
    </div>
  );
} 