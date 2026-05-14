"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

const features = [
  {
    icon: <img src='/images/whychooseus1.png' alt="" width="80px" />,
    title: "Your Trusted Partner in Coimbatore's Real Estate Market",
    description: "We are dedicated to providing you with the best real estate experience.",
    buttonText: "LEARN MORE",
  },
  {
    icon: <img src='/images/whychooseus2.png' alt="" width="80px" />,
    title: "All Our Properties Are 100% Verified for Your Peace of Mind",
    description: "Rest assured, every property comes with clear titles and approvals.",
    buttonText: "DISCOVER NOW",
  },
  {
    icon: <img src='/images/whychooseus3.png' alt="" width="80px" />,
    title: "Experience a Hassle-Free Buying Process with Our Expert Guidance",
    description: "We simplify the buying journey, making it smooth and stress-free.",
    buttonText: "START NOW",
  },
  {
    icon: <img src='/images/whychooseus4.png' alt="" width="80px" />,
    title: "Get the Best Deals & Price Guarantee on Every Property",
    description: "We offer competitive prices and exclusive deals to ensure you get the best value for your investment.",
    buttonText: "EXPLORE NOW",
  },
]

export default function WhyChooseSection() {
  return (
    <section className="py-20 ">
      <div className="container mx-auto  px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-4xl font-medium font-playfair text-center text-text mb-16 px-3"
        >
          Why Choose Nilavan Realtors for Your <br className="md:block hidden" />Real Estate Needs
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.2,
                ease: "easeOut"
              }}
            >
              <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 md:h-[400px]">
                <CardContent className="p-8 flex flex-col items-center text-center max-w-lg m-auto">
                  <div className="mb-6 transition-transform duration-300 hover:scale-105">
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-xl font-playfair font-semibold text-text mb-4 sm:!leading-[33px] sm:tracking-wide">
                    {feature.title}
                  </h3>
                  
                  <p className="text-text/70 mb-6 text-lg">
                    {feature.description}
                  </p>
                  
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button 
                      variant="default" 
                      className="bg-primary hover:bg-[#294666]/90 text-white transition-colors duration-300"
                    >
                      {feature.buttonText}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
