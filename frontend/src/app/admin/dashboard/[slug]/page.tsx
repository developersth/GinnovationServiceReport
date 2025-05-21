// src/app/admin/dashboard/[slug]/page.tsx
'use client'; // <-- นี่คือ Client Component

import { use } from 'react';

interface SlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function SlugPage({ params }: SlugPageProps) {
  const { slug } = use(params); // ใช้ use() hook

  return (
    <div>
      <h1>Dashboard for: {slug}</h1>
      {/* ดึงข้อมูลที่เกี่ยวข้องกับ slug มาแสดง */}
    </div>
  );
}