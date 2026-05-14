"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { useState, FormEvent } from "react"

export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/sendgrid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      setSubmitStatus('success');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact-form" className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base font-medium mb-4"
            >
              Contact Us
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl md:text-4xl font-playfair text-black mb-6"
            >
              Get in Touch
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-gray-700 mb-2"
            >
              Have questions? We're here to help! Fill out the form below.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-gray-700"
            >
              Your dream home journey begins here!
            </motion.p>

            <div className="space-y-6 pt-10">
              {[
                { icon: "/images/mail.png", title: "Reach us anytime", text: "info@nilavanrealtors.com" },
                { icon: "/images/call.png", title: "Call us for assistance", text: "+91 96595 55555" },
                { icon: "/images/location.png", title: "Nilavan Real Estate, Malumichampatti, Coimbatore, TN 641001", text: "Get Directions" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 + (index * 0.2) }}
                  className="flex items-start"
                >
                  <img src={item.icon} alt="" width={30} />
                  <div className="pl-4">
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-gray-700 text-sm">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-primary text-white p-10 rounded-md max-w-xl"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              {[
                { id: "name", type: "text", placeholder: "Your Name" },
                { id: "email", type: "email", placeholder: "Your Email" },
                { id: "phone", type: "text", placeholder: "Your Phone Number" }
              ].map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                >
                  <Input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    required
                    placeholder={field.placeholder}
                    className="text-md font-normal bg-transparent border-white/50 text-white placeholder:text-white/80 h-14 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-transparent"
                  />
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Textarea
                  id="message"
                  name="message"
                  required
                  placeholder="Your Message"
                  rows={4}
                  className="text-md font-normal bg-transparent border-white/50 text-white placeholder:text-white/80 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-transparent"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit"
                  className="w-full bg-secondary text-white h-12 hover:bg-secondary" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'SUBMIT'}
                </Button>
              </motion.div>
              
              {submitStatus && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-sm ${
                    submitStatus === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {submitStatus === 'success' 
                    ? 'Message sent successfully!' 
                    : 'Failed to send message. Please try again.'}
                </motion.p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

