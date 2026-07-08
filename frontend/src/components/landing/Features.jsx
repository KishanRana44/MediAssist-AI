import {
  Activity,
  HeartPulse,
  FileText,
  Bot,
  ShieldCheck,
  Brain,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "../../utils/animations";

export default function Features() {
  const features = [
    {
      title: "ECG Analysis",
      icon: Activity,
      desc: "Detect arrhythmias and cardiac abnormalities."
    },
    {
      title: "Heart Sound Analysis",
      icon: HeartPulse,
      desc: "Identify murmurs and valve disorders."
    },
    {
      title: "Report Analysis",
      icon: FileText,
      desc: "Extract meaningful medical insights."
    },
    {
      title: "AI Medical Chatbot",
      icon: Bot,
      desc: "Evidence-based healthcare assistant."
    },
    {
      title: "Clinical Support",
      icon: ShieldCheck,
      desc: "AI-powered decision recommendations."
    },
    {
      title: "Explainable AI",
      icon: Brain,
      desc: "Transparent and interpretable results."
    },
  ];

  return (
    <section
      id="features"
      className="py-24 bg-gray-50"
    >
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6"
      >

        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold">
            Powerful Features
          </h2>

          <p className="mt-4 text-gray-500">
            Everything needed for intelligent healthcare analysis.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <feature.icon
                size={40}
                className="text-violet-600"
              />

              <h3 className="text-2xl font-bold mt-5">
                {feature.title}
              </h3>

              <p className="text-gray-500 mt-3">
                {feature.desc}
              </p>
            </div>
          ))}

        </div>
      </motion.div>
    </section>
  );
}