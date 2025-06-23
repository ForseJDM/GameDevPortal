import React from "react";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col items-center justify-center p-4">
      {children}
    </main>
  );
} 