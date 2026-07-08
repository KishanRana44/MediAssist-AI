// src/components/DashboardLayout.jsx

import Sidebar from "./Sidebar";


export default function DashboardLayout({
  children,
}) {
  return (
    <div className="flex h-screen bg-slate-50">

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>

    </div>
  );
}