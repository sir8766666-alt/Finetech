import React from 'react';
import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
