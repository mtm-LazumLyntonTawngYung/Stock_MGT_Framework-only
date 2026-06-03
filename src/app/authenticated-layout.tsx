'use client';

import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar onCollapsedChange={setCollapsed} />
      <main className={`overflow-y-auto bg-gray-100 min-h-screen transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  );
}