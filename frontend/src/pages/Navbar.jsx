import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between">
      <div>
        <h2 className="text-xl font-semibold">
          Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-medium">
            {user?.name}
          </p>

          <p className="text-sm text-gray-500">
            {user?.role}
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 border rounded-lg hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </div>
  );
}