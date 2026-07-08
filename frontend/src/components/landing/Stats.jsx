import { Users, FileText, ShieldCheck, Clock3 } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "../../utils/animations";

export default function Stats() {
  const stats = [
    {
      icon: Users,
      value: "10K+",
      label: "Patients Served",
    },
    {
      icon: FileText,
      value: "20K+",
      label: "Analyses Completed",
    },
    {
      icon: ShieldCheck,
      value: "95%",
      label: "Accuracy Rate",
    },
    {
      icon: Clock3,
      value: "24/7",
      label: "AI Support",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6"
      >
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8 }}
              className="bg-white border rounded-3xl p-8 shadow-lg"
            >
              <item.icon
                size={40}
                className="text-violet-600 mb-4"
              />

              <h3 className="text-4xl font-bold">
                {item.value}
              </h3>

              <p className="text-gray-500 mt-2">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}