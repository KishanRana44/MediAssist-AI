import { motion } from "framer-motion";
import { fadeUp } from "../../utils/animations";

export default function About() {
  return (
    <section
      id="about"
      className="py-24 bg-white"
    >
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-6"
      >
        <h2 className="text-center text-5xl font-bold">
          About MediAssist AI
        </h2>

        <p className="mt-10 text-xl text-center text-gray-600 leading-relaxed">
          MediAssist AI is a Multimodal Healthcare RAG Assistant
          designed for intelligent cardiac disease analysis,
          ECG interpretation, heart sound classification,
          medical report understanding and evidence-based
          clinical decision support.
        </p>
      </motion.div>
    </section>
  );
}