export default function HowItWorks() {
  const steps = [
    {
      title: "Upload Data",
      desc: "Upload ECGs, reports or heart sounds."
    },
    {
      title: "AI Processing",
      desc: "Advanced AI models analyze data."
    },
    {
      title: "Get Insights",
      desc: "Receive detailed clinical recommendations."
    },
  ];

  return (
    <section
      id="howitworks"
      className="py-24"
    >
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-center text-5xl font-bold mb-20">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-10">

          {steps.map((step, index) => (
            <div
              key={index}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto bg-violet-100 rounded-full flex items-center justify-center text-3xl font-bold text-violet-600">
                {index + 1}
              </div>

              <h3 className="text-2xl font-bold mt-6">
                {step.title}
              </h3>

              <p className="mt-3 text-gray-500">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}