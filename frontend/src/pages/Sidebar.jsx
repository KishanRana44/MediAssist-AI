import { Link, useLocation } from "react-router-dom";
import {
  FaHeartbeat,
  FaStethoscope,
  FaFileMedical,
  FaComments,
  FaHistory,
  FaUserMd,
  FaHome,
} from "react-icons/fa";

export default function Sidebar() {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: <FaHome /> },
    { name: "ECG Analysis", path: "/ecg", icon: <FaHeartbeat /> },
    { name: "Heart Sound", path: "/heart-sound", icon: <FaStethoscope /> },
    { name: "Reports", path: "/report", icon: <FaFileMedical /> },
    { name: "AI Assistant", path: "/chat", icon: <FaComments /> },
    { name: "History", path: "/history", icon: <FaHistory /> },
    { name: "Doctor", path: "/doctor", icon: <FaUserMd /> },
  ];

  return (
    <div className="w-72 bg-white border-r border-gray-200 h-screen">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-semibold text-blue-700">
          MediAssist AI
        </h1>

        <p className="text-sm text-gray-500">
          Healthcare Intelligence
        </p>
      </div>

      <div className="p-3">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
              location.pathname === item.path
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}