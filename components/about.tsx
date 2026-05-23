"use client"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export default function About() {
  return (
    <section id="about" className="bg-white ">
      <div className="max-w-[1400px] m-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-between  gap-12 pt-5 pb-5">
          {/* Left: Image with Animation */}
         
          <div className=" sm:mt-0  relative sm:-mr-8 mt-10">
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-primary p-5  flex justify-center flex-col" 
            >
              <h2 className="text-3xl md:text-4xl font-playfair font-medium text-white mb-6">
             
              </h2>

              <p className="text-white mb-8 text-lg sm:!leading-[33px] sm:tracking-wide text-justify pl-10 pr-10">
              A serene, exclusive real estate enclave set amid coconut groves and across from the golf course—offering a lifestyle deeply connected to nature and the timeless game of golf.
              Seize the rare opportunity to own a peaceful farmhouse retreat just outside Coimbatore, directly across from the prestigious Coimbatore Golf Club. Nestled within a serene coconut farm, this property offers privacy, natural beauty, and easy access to the golf course. The location is secluded yet easily accessible, providing a perfect escape from the city hustle. Whether you're seeking a weekend getaway, a farmhouse, or a full-time residence, this property offers the ideal setting. It's a golfer's dream, with the Golf Club just steps away. Surrounded by nature, the atmosphere here is peaceful and calming, creating the perfect environment to unwind. Build your perfect escape where luxury meets nature, right by the greens.
              </p>

              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/projects"
                className="inline-flex items-center gap-2 bg-primary py-3 sm:tracking-wide text-white group transition-all duration-300 hover:bg-primary/90 px-9 justify-center"
              >
                <span className="font-light font-playfair text-center "> A refined Retreat not just a property </span>
                {/* <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" /> */}
              </motion.a>
            </motion.div>
          </div>

          {/* Right: Blue Background Container */}
          <div className="flex justify-center  relative">
            <motion.img
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              src='/images/about.png'
              alt="Elegant interior staircase"
              className=""
            />
          </div>
        </div>
      </div>
    </section>
  )
}
