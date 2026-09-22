import { motion } from "framer-motion";
import { fadeUp } from "../../utils/animations";

export default function Contact() {
  return (
    <section id="contact" className="py-10 bg-red-50 font-serif">
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
            <div className="border rounded-xl p-5">
              <p className="text-sm text-black-500 mb-1">Name</p>
              <p className="text-lg font-semibold text-gray-800">
                Kishan Rana
              </p>
            </div>

            <div className="border rounded-xl p-5">
              <p className="text-sm text-black-500 mb-1">Location</p>
              <p className="text-lg font-semibold text-gray-800">
                Surat, Gujarat
              </p>
            </div>

            <div className="border rounded-xl p-5">
              <p className="text-sm text-balck-500 mb-1">Email</p>
              <a
                href="mailto:kishanrana6505@gmail.com"
                className="text-lg font-semibold text-black-600 hover:underline"
              >
                kishanrana6505@gmail.com
              </a>
            </div>

            <div className="border rounded-xl p-5">
              <p className="text-sm text-black-500 mb-1">Mobile</p>
              <a
                href="tel:+919726125651"
                className="text-lg font-semibold text-black-600 hover:underline"
              >
                +91 9726125651
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
