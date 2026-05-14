"use client"

import { FC } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Plot {
  plotNo: string;
  size: string;
}

const AvailablePlots: FC = () => {
    const plotsData: Plot[] = [
      { plotNo: "1", size: "25 cents" },
      { plotNo: "2", size: "21 cents" },
      { plotNo: "3", size: "21 cents" },
      { plotNo: "4", size: "22 cents" },
      { plotNo: "5", size: "18 cents" },
      { plotNo: "6", size: "18 cents" },
      { plotNo: "7", size: "22 cents" },
      { plotNo: "7A", size: "24 cents" },
      { plotNo: "9", size: "21 cents" },
      { plotNo: "10", size: "22 cents" },
      { plotNo: "11", size: "25 cents" },
      { plotNo: "12", size: "4 cents" },
      { plotNo: "12A", size: "22 cents" },
      { plotNo: "14", size: "21 cents" },
      { plotNo: "15", size: "21 cents" },
      { plotNo: "16", size: "21 cents" },
    ];
    
    // Split the data into two columns
    const midPoint = Math.ceil(plotsData.length / 2);
    const leftColumn = plotsData.slice(0, midPoint);
    const rightColumn = plotsData.slice(midPoint);
    
    return (
      <section className="py-16 bg-gray-100" id="available-plots">
        <div className="container mx-auto px-6 md:px-4">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-4xl font-semibold md:font-medium font-playfair text-center text-text mb-2 md:mb-16 px-3"
        >
           Plots for Sale at The Links Preserve
        </motion.h2>
          {/* <h2 className="text-2xl md:text-3xl font-playfair font-semibold text-center mb-12">Available Plots at The Links Preserve</h2> */}
          <div className="bg-white shadow-sm overflow-hidden">
            <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 h-[550px]">
              {/* Plot Table */}
              <div className="p-8 h-full overflow-y-auto">
                <div className="flex h-full">
                  {/* First Pair */}
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4 mb-6 md:pt-6">
                      <div className="font-bold font-playfair text-lg text-gray-800">Plot No</div>
                      <div className="font-bold font-playfair text-lg text-gray-800">Plot Size</div>
                    </div>
                    <div className="space-y-4">
                      {leftColumn.map((plot, index) => (
                        <div key={index} className="grid grid-cols-2 gap-4 py-1">
                          <div className="text-[#141414] text-lg">{plot.plotNo}</div>
                          <div className="text-[#141414] text-lg">{plot.size}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Vertical Line */}
                  <div className="mx-8 w-[2px] bg-gray-300"></div>
                  
                  {/* Second Pair */}
                  <div className="flex-1 md:pl-10">
                    <div className="grid grid-cols-2 gap-4 mb-6 md:pt-6">
                      <div className="font-bold font-playfair text-lg text-gray-800">Plot No</div>
                      <div className="font-bold font-playfair text-lg text-gray-800">Plot Size</div>
                    </div>
                    <div className="space-y-4">
                      {rightColumn.map((plot, index) => (
                        <div key={index} className="grid grid-cols-2 gap-4 py-1">
                          <div className="text-[#141414] text-lg">{plot.plotNo}</div>
                          <div className="text-[#141414] text-lg">{plot.size}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Plot Image */}
              <div className="relative h-full p-8 flex items-center justify-center">
                <div className="relative w-full h-[485px]">
                  <Image
                    src="/images/available-plot-image.png"
                    alt="The Links Preserve Plot Layout"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Mobile responsive table */}
          <div className="lg:hidden mt-8">
            <div className="bg-white p-6 shadow-sm">
              {/* Plot Image for mobile */}
              <div className="relative w-full h-[270px] mb-12">
                <Image
                  src="/images/available-plot-image.png"
                  alt="The Links Preserve Plot Layout"
                  fill
                  className="object-contain object-top"
                  priority
                />
              </div>
              {/* <h3 className="font-semibold mb-4 text-center">Plot Details</h3> */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="font-bold text-gray-800 text-center font-playfair text-xl">Plot No</div>
                <div className="font-bold text-gray-800 text-center font-playfair text-xl">Plot Size</div>
              </div>
              <div className="space-y-2 mt-4">
                {plotsData.map((plot, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 py-2">
                    <div className="text-center text-[#141414] text-lg">{plot.plotNo}</div>
                    <div className="text-center text-[#141414] text-lg">{plot.size}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
}

export default AvailablePlots;