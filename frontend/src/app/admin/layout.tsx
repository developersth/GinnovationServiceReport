// src/app/admin/layout.tsx
import { ReactNode } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-4 space-y-4">
        <h2 className="text-xl font-bold mb-6">Ginnovation</h2>
        <nav className="space-y-2">
          <Link href="/admin/dashboard" className="block hover:text-blue-400">🏠 Dashboard</Link>
          <Link href="/admin/reports" className="block hover:text-blue-400">📑 Reports</Link>
          <Link href="/admin/users" className="block hover:text-blue-400">👥 Users</Link>
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Topbar */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <input type="text" placeholder="Search..." className="bg-gray-700 text-sm px-3 py-1 rounded" />
        </header>

        {children}
      </div>
    </div>
  );
}

