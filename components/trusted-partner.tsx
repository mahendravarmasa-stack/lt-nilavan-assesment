"use client"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export default function TrustedPartner() {
  return (
    <section id="about" className="pt-12 md:pt-24 pb-24 bg-white">
      <div className="px-6 max-w-[1400px] m-auto">
        <div className="flex flex-col md:flex-col lg:flex-row items-center justify-center md:justify-between max-w-6xla gap-12">
          {/* Left: Image with Animation */}
          <div className="w-full lg:w-1/2 flex justify-center sm:left-[5%] relative">
            <motion.img
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              src='/images/trusted-partner-color.png'
              alt="Elegant interior staircase"
              className="w-full max-w-[600px] h-[490px] md:h-[800px] object-cover"
            />
          </div>

          {/* Right: Blue Background Container */}
          <div className="md:w-full w-[85%] lg:w-[45%] bg-primary sm:mt-0 sm:-left-[5%] lg:-left-[12%] relative sm:-mr-8 md:mt-10 -mt-[200px] ml-8 sm:ml-0">
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-8 md:p-12 shadow-lg mt-4 md:mt-8 -ml-8 -mb-8 mr-4 md:mr-8"
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-playfair font-medium text-black mb-6">
              The Links Preserve – A<br />Private Retreat
              </h2>

              <p className="text-sm md:text-lg text-gray-700 mb-8 sm:!leading-[33px] sm:tracking-wide">
                Welcome to The Links Preserve - an exclusive plot community surrounded by coconut trees and right across from the Coimbatore Golf Club. It's the perfect spot for a quiet farmhouse, weekend retreat, or even your everyday home. Located just outside Coimbatore, this peaceful property offers privacy, greenery, and easy access to the golf course. Whether you love golf or simply want to live closer to nature, this is an ideal place to relax and unwind. Build your dream home in a calm, green setting - where luxury meets nature.
              </p>

              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#available-plots"
                className="inline-flex items-center gap-2 bg-primary py-2 md:py-3 sm:tracking-wide text-white group transition-all duration-300 hover:bg-primary/90 px-6 md:px-9 text-sm md:text-base"
                onClick={(e) => {
                  e.preventDefault();
                  const section = document.getElementById('available-plots');
                  if (section) {
                    const offset = 80; // Height of fixed header when scrolled
                    const sectionTop = section.offsetTop - offset;
                    window.scrollTo({
                      top: sectionTop,
                      behavior: 'smooth'
                    });
                  }
                }}
              >
                <span className="font-light">LEARN MORE</span>
                {/* <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" /> */}
              </motion.a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
