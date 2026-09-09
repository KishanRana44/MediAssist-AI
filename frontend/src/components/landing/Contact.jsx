import { motion } from "framer-motion";
import { fadeUp } from "../../utils/animations";

export default function Contact() {
  return (
    <section
      id="contact"
      className="py-24 bg-gray-50"
    >
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-4xl mx-auto px-6"
      >

        <h2 className="text-center text-5xl font-bold mb-12">
          Contact Us
        </h2>

        <div className="bg-white p-10 rounded-3xl shadow-lg">

          <div className="grid md:grid-cols-2 gap-6">

            <input
              type="text"
              placeholder="Your Name"
              className="border rounded-xl p-4"
            />

            <input
              type="email"
              placeholder="Your Email"
              className="border rounded-xl p-4"
            />

          </div>

          <textarea
            rows="6"
            placeholder="Your Message"
            className="w-full border rounded-xl p-4 mt-6"
          />

          <button className="mt-6 bg-violet-600 text-white px-8 py-4 rounded-xl">
            Send Message
          </button>

        </div>

      </motion.div>
    </section>
  );
}