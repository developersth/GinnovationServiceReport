// src/app/admin/dashboard/layout.tsx
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {/* Optional: you can add extra layout here */}
      {children}
    </div>
  );
}
