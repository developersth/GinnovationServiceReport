// src/app/admin/dashboard/page.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const barData = [
  { name: 'Jan', views: 8000 },
  { name: 'Feb', views: 9600 },
  { name: 'Mar', views: 7200 },
  { name: 'Apr', views: 13200 },
  { name: 'May', views: 14500 },
  { name: 'Jun', views: 9800 },
];

export default function DashboardPage() {
  return (
    <div>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-400">Users</p>
          <p className="text-2xl font-bold">14k</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-400">Conversions</p>
          <p className="text-2xl font-bold">325</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-400">Event Count</p>
          <p className="text-2xl font-bold">200k</p>
        </div>
      </section>

      <section className="bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Page Views and Downloads</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Bar dataKey="views" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
