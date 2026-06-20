'use client';

import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Minimal layout for auth pages: full screen, no container, no sidebar
  return (
    <div className="min-h-screen w-full bg-[linear-gradient(#EDE6D6,#FFF9F2)]">
      {children}
    </div>
  );
}
