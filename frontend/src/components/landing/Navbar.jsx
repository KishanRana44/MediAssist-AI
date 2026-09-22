import { HeartPulse } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b font-serif">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-20 flex justify-between items-center">

          <div className="hidden md:flex gap-8 text-black-600">
            <button onClick={() => scrollTo("home")}>Home</button>
            <button onClick={() => scrollTo("features")}>Features</button>
            <button onClick={() => scrollTo("about")}>About</button>
            <button onClick={() => scrollTo("contact")}>Contact</button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/login")}
              className="border px-5 py-2 rounded-xl"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="bg-red-600 text-white px-5 py-2 rounded-xl"
            >
              Register
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}