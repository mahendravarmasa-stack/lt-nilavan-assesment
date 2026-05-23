"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapPin, Home, Building2, Trees } from "lucide-react"
import { motion } from "framer-motion"

export default function CurrentProjects() {
  const projects = [
    {
      id: 1,
      title: "Green View Residency – Premium Plots",
      subtitle: "Premium Plots",
      image: "/images/our-project-1.png",
      features: [
        { icon: <img src='/images/icon1.png' width={30}></img>, text: "Saravanampatti, Coimbatore" },
        { icon: <img src='/images/icon2.png' width={30}></img>, text: "1200 – 2400 Sq. Ft" },
        { icon: <img src='/images/icon3.png' width={30}></img>, text: "5 mins to IT Park, 10 mins to Airport" },
        { icon: <img src='/images/icon4.png' width={30}></img>, text: "Gated Community, 24/7 Security, Landscaped Gardens" },

      ],
    },
    {
      id: 2,
      title: "Residency – Premium Residential Plots Vadavalli",
      subtitle: "Luxury Villas in Vadavalli",
      image: "/images/our-project-2.png",
      features: [
        { icon: <img src='/images/icon1.png' width={30}></img>, text: "Vadavalli, Coimbatore" },
        { icon: <img src='/images/icon2.png' width={30}></img>, text: "1800 – 3000 Sq. Ft" },
        { icon: <img src='/images/icon3.png' width={30}></img>, text: "10 mins to Marudhamalai Temple" },
        { icon: <img src='/images/icon4.png' width={30}></img>, text: "Private Garden, Covered Parking, Clubhouse" },

      ],
    },
    {
      id: 3,
      title: "Farm Bliss – Scenic Farmhouse Plots in Pollachi",
      subtitle: "Scenic Farmhouse Plots in Pollachi",
      image: "/images/our-project-3.png",
      features: [
        { icon: <img src='/images/icon1.png' width={30}></img>, text: "Pollachi, Tamil Nadu" },
        { icon: <img src='/images/icon2.png' width={30}></img>, text: "½ Acre – 2 Acres" },
        { icon: <img src='/images/icon3.png' width={30}></img>, text: "20 mins to Aliyar Dam, 30 mins to Coimbatore City" },
        { icon: <img src='/images/icon4.png' width={30}></img>, text: "Organic Farming Spaces, Private Cottages, Water Supply" },

      ],
    },
  ]

  return (
    <section id="current-projects" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-playfair font-medium text-black mb-6">
              Our Other Projects
          </h2>
          <p className="text-gray-700 mb-8 text-lg sm:!leading-[33px] sm:tracking-wid">
              Discover our latest real estate projects in Coimbatore, offering premium plots, villas, farmhouses, and apartments in prime locations. Secure your dream property with clear titles and hassle-free transactions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white overflow-hidden shadow-md"
            >
              <motion.div 
                className="relative h-60 overflow-hidden"
                whileHover={{ scale: 1 }}
              >
                <Image 
                  src={project.image || "/placeholder.svg"} 
                  alt={project.title} 
                  fill 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </motion.div>
              
              <div className="p-6">
                <h3 className="text-2xl font-playfair font-medium text-black pb-4">
                  {project.title}
                </h3>
                
                <ul className="space-y-3 mb-6 mt-4">
                  {project.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center text-sm"
                    >
                      <span className="text-amber-600 mr-2">{feature.icon}</span>
                      {feature.text}
                    </li>
                  ))}
                </ul>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline" 
                    className="border-secondary text-black"
                  >
                    ENQUIRE NOW
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

