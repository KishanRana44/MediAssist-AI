import { motion } from "framer-motion";
import { fadeUp } from "../../utils/animations";

export default function Benefits() {
  return (
    <section className="py-24">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6"
      >

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div>
            <h2 className="text-5xl font-bold">
              Why Choose MediAssist AI?
            </h2>

            <ul className="space-y-5 mt-10 text-lg">
              <li>✔ Faster Diagnosis</li>
              <li>✔ Explainable AI Results</li>
              <li>✔ Secure Patient Records</li>
              <li>✔ Clinical Decision Support</li>
              <li>✔ Evidence-Based Insights</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-violet-500 to-blue-500 rounded-3xl h-[400px]">
          </div>

        </div>
      </motion.div>
    </section>
  );
}