// src/app/page.tsx (App Router example)

import { redirect } from "next/navigation";

export default function Home() {
  // Perform some server-side logic here if needed, e.g., checking authentication
  const userIsAuthenticated = true; // Replace with your actual authentication check

  if (userIsAuthenticated) {
    redirect("/admin/dashboard"); // Redirects to /dashboard on the server
  }

  // If not authenticated, render the original content
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* ... (rest of your original content) ... */}
    </div>
  );
}