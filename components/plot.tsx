"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function Plot() {
    // 16 list with 4 li in each row
    const list = [
        {
            id: 1,
            name: "Plot 1 – 25cents",
        },
        {
            id: 2,
            name: "Plot 2 – 25cents",
        },
        {
            id: 3,
            name: "Plot 3 – 25cents",
        },
        {
            id: 4,
            name: "Plot 4 – 25cents",
        },
        {
            id: 5,
            name: "Plot 5 – 25cents",
        },
        {
            id: 6,
            name: "Plot 6 – 25cents ",
        },
        {
            id: 7,
            name: "Plot 7 – 25cents",
        },
        {
            id: 8,
            name: "Plot 8 – 25cents",
        },
        {
            id: 9,
            name: "Plot 9 – 25cents",
        },
        {
            id: 10,
            name: "Plot 10 – 25cents",
        },
        {
            id: 11,
            name: "Plot 11 – 25cents",
        },
        {
            id: 12,
            name: "Plot 12 – 25cents",
        },
        {
            id: 13,
            name: "Plot 13 – 25cents",
        },
        {
            id: 14,
            name: "Plot 14 – 25cents",
        },
        {
            id: 15,
            name: "Plot 15 – 25cents",
        },
        {
            id: 16,
            name: "Plot 16 – 25cents",
        },
    ]   
  return (
    <section className="py-20 ">
      <div className="max-w-[1400px] mx-auto sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start justify-center align-top">
        <img src='/images/plot1.png' alt="" className="m-auto mb-10 w-[600px]" />
      
        <div>
            <div>
            <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-sm  font-light font-playfair text-center text-text mb-5"
          >
            Stone Compound Wall Designed to Mimic the Natural Undulations of a Golf Course
          </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">
            <div className="transition-transform duration-300 hover:scale-105 m-auto">
              <img src='/images/plot 2.png' alt="" width="380px" />
            </div>
            
            <div className="transition-transform duration-300 hover:scale-105 m-auto">
              <img src='/images/plot3.png' alt="" width="380px" />
           
            </div>
            </div>
           
            </div>
            <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-sm  font-light font-playfair text-center text-text m-2"
          >
            Stone Compound Wall Designed to Mimic the Natural Undulations of a Golf Course
          </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">
            <div className="transition-transform duration-300 hover:scale-105 m-auto">
              <img src='/images/plot4.png' alt="" width="380px" />
            </div>
            
            <div className="transition-transform duration-300 hover:scale-105 m-auto">
              <img src='/images/plot5.png' alt="" width="380px" />
            </div>
          </div>
          
         
        </div>
      </div>
        {/* create a list contain 16 li with 4 li in each row with dynamic content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-center justify-center max-w-[1400px] mx-auto">
        {list.map((item) => (
          <li key={item.id} className="text-sm font-light font-poppins text-center text-text">
            {item.name}
          </li>
        ))}
      </div> 
      {/* image with width 100% */}
      <img src='/images/plot6.png' alt="" width="100%" className="m-auto max-w-[1400px] mt-10" />
      
    </section>
  )
}