"use client"

import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { motion } from "framer-motion"

const faqs = [
  {
    question: "Are your properties legally verified?",
    answer: "Yes, all our properties have clear titles and necessary approvals for a hassle-free purchase."
  },
  {
    question: "Do you assist with bank loans?",
    answer: "Yes, we provide comprehensive assistance with bank loans, helping you find the best rates and managing all paperwork for a smooth approval process."
  },
  {
    question: "Can I schedule a site visit?",
    answer: "Absolutely! We arrange convenient site visits at your preferred time. Our representatives will accompany you to show the property and answer all your questions."
  },
  {
    question: "What types of properties do you offer?",
    answer: "We offer a wide range of properties including residential plots, luxury villas, modern apartments, and agricultural farm lands in prime locations across Coimbatore."
  },
  {
    question: "How do I get in touch for more details?",
    answer: "You can reach us through our contact form, call us directly, or visit our office. Our team is available 7 days a week to assist you with your property needs."
  }
]

export default function FAQSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="faq">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-playfair text-text mb-6"
            >
              FAQs
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-text/70 mb-8"
            >
              Find quick answers to common queries about our properties, legal verification, 
              home loan assistance, and site visits. We ensure a smooth and transparent 
              buying process for you.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                className="bg-[#294666] hover:bg-[#294666]/90 text-white"
              >
                CONTACT
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1 + 0.5 // Staggered animation
                  }}
                >
                  <AccordionItem 
                    value={`item-${index}`}
                    className="border-t border-b-0 border-t-black px-6 pt-3"
                  >
                    <motion.div
                      whileHover={{ x: 10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    >
                      <AccordionTrigger className="text-lg font-semibold text-text hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                    </motion.div>
                    <AccordionContent className="text-text/70">
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {faq.answer}
                      </motion.div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
