"use client"
import { useCallback } from 'react'

export default function Footer() {
  const scrollToSection = useCallback((sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      const offset = 80 // Height of fixed header when scrolled
      const sectionTop = section.offsetTop - offset
      window.scrollTo({
        top: sectionTop,
        behavior: 'smooth'
      })
    }
  }, [])
  
  return (
    <footer className=" bg-brand-bgPrimary py-8 px-4 md:px-8">
      <div className="container mx-auto max-w-8xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex flex-col items-start">
              <div className="h-16 w-40 relative">
                <img src='/images/Nilavan-Realtors-Logo.png' alt=""  width="100px"/>
              </div>
            </div>
            <p className="text-gray-700 max-w-md">
              Nilavan Realtors helps you find the best plots, villas, apartments, and farmhouses in Coimbatore. We offer
              verified properties and a hassle-free buying experience.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:ml-auto">
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
            <li>
                <button 
                  onClick={() => scrollToSection('home')}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('about')}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  About Us
                </button>
              </li>
              {/* <li>
                <button 
                  onClick={() => scrollToSection('current-projects')}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Current Projects
                </button>
              </li> */}
             
              <li>
                <button 
                  onClick={() => scrollToSection('contact-form')}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div className='flex flex-col justify-items-end sm:ml-[40%]'>
            <h3 className="text-xl font-semibold mb-4">Address:</h3>
            <address className="not-italic text-gray-700">
              Nilavan Real Estate,
              <br />
              malumichampatti,
              <br />
              Coimbatore,
              <br />
              TN 641001
            </address>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 my-6"></div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <p>© 2025 leadtap.ai. All rights reserved.</p>
          <div className="flex items-center mt-2 md:mt-0">
            <span>Site by <a href="https://www.leadtap.ai/">leadtap.ai</a></span>
            <span className="ml-1 text-orange-500"><img src="/images/Laedtap Favicon.png" alt="" width="20px" /></span>
          </div>
        </div>
      </div>
    </footer>
  )
}

