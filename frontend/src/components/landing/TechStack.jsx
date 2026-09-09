import { motion } from "framer-motion";
import { fadeUp } from "../../utils/animations";
import { 
  Code2, 
  Layers, 
  Server, 
  Cpu, 
  Database, 
  Terminal, 
  BrainCircuit, 
  Network, 
  Link2, 
  FileJson, 
  Cloud, 
  Sparkles 
} from "lucide-react";

export default function TechStack() {
  const techs = [
    { name: "React", icon: Code2 },
    { name: "Tailwind CSS", icon: Layers },
    { name: "Node.js", icon: Server },
    { name: "Express.js", icon: Terminal },
    { name: "MongoDB", icon: Database },
    { name: "Python", icon: Cpu },
    { name: "TensorFlow", icon: BrainCircuit },
    { name: "PyTorch", icon: Network },
    { name: "LangChain", icon: Link2 },
    { name: "ChromaDB", icon: FileJson },
    { name: "Cloudinary", icon: Cloud },
    { name: "Gemini AI", icon: Sparkles },
  ];

  return (
    <section className="py-24 bg-violet-50">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6"
      >
        <h2 className="text-center text-5xl font-bold mb-16">
          Technology Stack
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {techs.map((tech, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center gap-4 font-semibold text-gray-800"
            >
              <tech.icon size={32} className="text-violet-600" />
              <span>{tech.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}