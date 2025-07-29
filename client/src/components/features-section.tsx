import { motion } from "framer-motion";
import { 
  Zap, 
  Shield, 
  BarChart, 
  Users, 
  Kanban, 
  Lightbulb 
} from "lucide-react";

const features = [
  {
    title: "Lightning Fast Performance",
    description: "Experience unmatched speed with our optimized architecture designed for maximum efficiency.",
    icon: Zap
  },
  {
    title: "Enterprise-Grade Security",
    description: "Rest easy knowing your data is protected with our state-of-the-art security infrastructure.",
    icon: Shield
  },
  {
    title: "Advanced Analytics",
    description: "Gain actionable insights with comprehensive analytics and beautiful visualizations.",
    icon: BarChart
  },
  {
    title: "Seamless Collaboration",
    description: "Connect your entire team with real-time collaboration tools and smart notifications.",
    icon: Users
  },
  {
    title: "Customizable Workflows",
    description: "Tailor every aspect of your workflow to match your unique business requirements.",
    icon: Kanban
  },
  {
    title: "AI-Powered Automation",
    description: "Let our intelligent automation handle repetitive tasks while you focus on what matters.",
    icon: Lightbulb
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
            Powerful Features
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Discover how NovaFlow can revolutionize the way you work
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1
              }}
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
