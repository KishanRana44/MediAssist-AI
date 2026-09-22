import { motion } from "framer-motion";
import { fadeUp } from "../../utils/animations";

export default function About() {
  return (
    <section
      id="about"
      className="py-5 bg-grey font-serif"
    >
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-6"
      >
        <h2 className="text-center text-5xl font-bold">
          About CardiacSaarthi
          <span className="text-red-600">
                {" "} AI
              </span>
        </h2>

        <p className="mt-5 text-xl text-center text-gray-600 leading-relaxed">
          CardiacSaarthi is a Multimodal Healthcare RAG Assistant
          designed for intelligent cardiac disease analysis,
          ECG interpretation, heart sound classification,
          medical report understanding and evidence-based
          clinical decision support
        </p>
      </motion.div>
    </section>
  );
}