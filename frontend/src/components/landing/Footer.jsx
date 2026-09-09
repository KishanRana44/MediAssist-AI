import { HeartPulse } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-14">

      <div className="max-w-7xl mx-auto px-6">

        <div className="flex flex-col md:flex-row justify-between items-center">

          <div className="flex items-center gap-3">
            <HeartPulse />

            <h2 className="text-2xl font-bold">
              MediAssist AI
            </h2>
          </div>

          <p className="text-gray-400 mt-4 md:mt-0">
            © 2026 MediAssist AI. All rights reserved.
          </p>

        </div>

      </div>
    </footer>
  );
}