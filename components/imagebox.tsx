"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapPin, Home, Building2, Trees } from "lucide-react"
import { motion } from "framer-motion"

export default function Imagebox() {
  const projects = [
    {
      id: 1,
     
      image: "/images/IMG1.png",
      features: [
        { icon: <img src='/images/icon1.png' width={30}></img>, text: "Strategically Positioned Security Cabin for Enhanced Road Visibility" },
       

      ],
    },
    {
      id: 2,
    
      image: "/images/IMG2.png",
      features: [
        { icon: <img src='/images/icon1.png' width={30}></img>, text: "Wall Height Limited to 5 Feet with Tree-Inspired Grill Above—Balancing Visibility and Security" },
       

      ],
    },
    {
      id: 3,
      image: "/images/IMG3.png",
      features: [
        { icon: <img src='/images/icon1.png' width={30}></img>, text: "Brick defines the path and perimeter — paving the roads and shaping the side walls." },
      

      ],
    },
  ]

  return (
    <section id="current-projects" className="py-16 bg-white">
      <div className="container mx-auto px-4">
       

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
                  alt=""
                  fill 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </motion.div>
              
              <div className="p-6">
                
                
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
                    ENQUIRE
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <img src='/images/imganimated.png' alt="" width="100%" className="m-auto max-w-[1400px] mt-10" />
    </section>
  )
}

