"use client"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      const offset = 80 // Height of fixed header when scrolled
      const sectionTop = section.offsetTop - offset
      window.scrollTo({
        top: sectionTop,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section id="home" className="relative h-[700px] md:h-[800px] w-full">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/hero-module.jpg')",
          backgroundPosition: "center",
        }}
      />
      
      <div className="relative container mx-auto px-4 md:px-12 pt-20 h-full flex flex-col justify-center">
        <div className="max-w-3xl flex flex-col items-center md:items-start md:pl-[50px] bg-[#141414]/60 p-4 md:p-8 mx-auto md:mx-0 px-10">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              delay: 0.4
            }}
            className="text-white text-lg md:text-2xl mb-4 md:mb-6 font-normal text-center md:text-left mt-4 md:mt-6 max-w-3xl"
          >
            Our Featured Development
          </motion.p>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              delay: 0.2
            }}
            className="text-5xl md:text-6xl lg:text-[80px] font-playfair font-extrabold text-[#D7BD5C] mb-3 md:mb-4 text-center md:text-left sm:!leading-[84px] sm:tracking-wide"
          >
            The Links Preserve
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              delay: 0.4
            }}
            className="text-white text-sm md:text-lg mb-6 md:mb-8 font-light text-center md:text-left mt-4 md:mt-6 max-w-3xl !leading-[28px] md:!leading-[35px]"
          >
            Looking for a beautiful & comfortable place to call home? The Links Preserve offers well-designed flats with modern features, in a calm and green environment. Enjoy the perfect mix of nature and city life - close to everything you need, yet away from the noise.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              delay: 0.6
            }}
            className="w-full flex justify-center md:justify-start"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => scrollToSection('contact-form')}
                className="bg-primary text-white mt-2 md:mt-4"
              >
                GET IN TOUCH
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

