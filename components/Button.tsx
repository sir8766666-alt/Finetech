'use client';

import React from 'react';

export default function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center bg-black text-white rounded-xl px-4 py-2 transition-colors disabled:opacity-60 hover:bg-black/90 ${props.className ?? ''}`}
    >
      {children}
    </button>
  );
}
