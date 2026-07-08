import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section
      id="home"
      className="bg-gradient-to-br from-white via-violet-50 to-blue-50 py-20"
    >
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-20 items-center">

          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-6xl lg:text-7xl font-extrabold leading-tight">
              Intelligent
              <span className="text-violet-600">
                {" "}Cardiac AI
              </span>
            </h1>

            <p className="mt-8 text-xl text-gray-600">
              ECG Analysis, Heart Sound Intelligence,
              Medical Report Understanding and
              Clinical Decision Support.
            </p>

            <div className="mt-10 flex gap-4">
              <button
                onClick={() => navigate("/register")}
                className="bg-violet-600 text-white px-8 py-4 rounded-xl"
              >
                Get Started
              </button>

              <button className="border px-8 py-4 rounded-xl">
                Learn More
              </button>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 4,
            }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8"
          >
            <div className="flex justify-between">
              <h3 className="font-bold">
                AI Dashboard
              </h3>

              <Activity className="text-violet-600" />
            </div>

            <div className="mt-8">
<svg viewBox="0 0 400 100">
  <motion.path
    d="M0 50 L40 50 L60 10 L80 90 L100 50
       L140 50 L160 20 L180 80 L200 50
       L400 50"
    stroke="#22c55e"
    strokeWidth="4"
    fill="none"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "linear",
    }}
  />
</svg>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-green-50 p-4 rounded-xl">
                ECG: Normal
              </div>

              <div className="bg-violet-50 p-4 rounded-xl">
                Risk: Low
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}