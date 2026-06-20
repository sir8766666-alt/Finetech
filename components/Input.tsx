'use client';

import React, { InputHTMLAttributes } from 'react';

type Props = {
  label?: string;
  error?: string | null;
} & React.HTMLAttributes<HTMLInputElement> & InputHTMLAttributes<HTMLInputElement>;

export default function Input({ label, error, className = '', ...props }: Props) {
  return (
    <label className="block">
      {label && <div className="text-sm font-medium mb-1">{label}</div>}
      <input
        {...props}
        className={`w-full border border-black/10 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-black/10 ${className}`}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </label>
  );
}
