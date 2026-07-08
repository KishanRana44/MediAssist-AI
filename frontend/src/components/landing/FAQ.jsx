import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQ() {
  const [open, setOpen] = useState(null);

  const faqs = [
    {
      question:
        "Can MediAssist AI replace doctors?",
      answer:
        "No. It assists healthcare professionals by providing AI-powered insights."
    },
    {
      question:
        "Does it support ECG analysis?",
      answer:
        "Yes. It provides intelligent ECG interpretation."
    },
    {
      question:
        "Is patient data secure?",
      answer:
        "Yes. All healthcare data is securely stored."
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">

        <h2 className="text-center text-5xl font-bold mb-16">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">

          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border rounded-2xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setOpen(
                    open === index ? null : index
                  )
                }
                className="w-full p-6 flex justify-between items-center"
              >
                <span className="font-semibold">
                  {faq.question}
                </span>

                <ChevronDown />
              </button>

              {open === index && (
                <div className="px-6 pb-6 text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}