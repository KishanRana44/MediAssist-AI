import {
  Activity,
  HeartPulse,
  FileText,
  Bot,
} from "lucide-react";

export default function AIModules() {
  const modules = [
    {
      icon: Activity,
      title: "ECG AI"
    },
    {
      icon: HeartPulse,
      title: "Heart Sound AI"
    },
    {
      icon: FileText,
      title: "Report AI"
    },
    {
      icon: Bot,
      title: "RAG Assistant"
    },
  ];

  return (
    <section className="py-24 bg-violet-50">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-center text-5xl font-bold mb-16">
          AI Modules
        </h2>

        <div className="grid md:grid-cols-4 gap-8">

          {modules.map((module, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-lg text-center"
            >
              <module.icon
                size={40}
                className="mx-auto text-violet-600"
              />

              <h3 className="mt-5 text-xl font-bold">
                {module.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}