'use client';

import { motion } from "framer-motion";
import Image from "next/image";

function Map() {
    const fadeInVariants = {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { duration: 0.8 }
      }
    }
      return (
            <div className="bg-background pt-10">
             <motion.h2
             variants={fadeInVariants}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             className="text-3xl md:text-4xl font-medium font-playfair text-center text-text md:mb-7 mb-12"
           >
             Location
           </motion.h2>
           <div className="container mx-auto px-4 pb-14 sm:px-6 lg:px-8">
             <div className="relative w-full md:h-[520px] h-[480px] overflow-hidden">
              <div className="mapouter h-full w-full">
                <div className="gmap_canvas h-full w-full">
                  <iframe
                    width="100%"
                    height="100%"
                    id="gmap_canvas"
                    src="https://maps.google.com/maps?q=10%C2%B054%2730.3%22N+77%C2%B001%2709.6%22E&t=&z=14&ie=UTF8&iwloc=&output=embed"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    frameBorder="0"
                    scrolling="no"
                  />
                </div>
              </div>
             </div>
           </div>
         </div>
      )}
  
      export default Map;
  