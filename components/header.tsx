"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState('hero')

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'hero') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
      setIsMenuOpen(false)
      setActiveSection('hero')
      return
    }

    const section = document.getElementById(sectionId)
    if (section) {
      const offset = 80 // Height of fixed header when scrolled
      const sectionTop = section.offsetTop - offset
      window.scrollTo({
        top: sectionTop,
        behavior: 'smooth'
      })
      setIsMenuOpen(false)
      setActiveSection(sectionId)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Handle scroll position for header styling
      if (Math.abs(currentScrollY - lastScrollY) > 5) {
        setIsScrolled(currentScrollY > 0)
        setLastScrollY(currentScrollY)
      }

      // Determine active section
      if (currentScrollY < 100) {
        setActiveSection('hero')
        return
      }

      // Check each section's position
      navigationItems.forEach(({ section }) => {
        if (section === 'hero') return
        
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          const offset = 100 // Adjust this value based on when you want the active state to trigger
          
          if (rect.top <= offset && rect.bottom > offset) {
            setActiveSection(section)
          }
        }
      })

      // Handle bottom of page
      if (currentScrollY + windowHeight >= documentHeight - 50) {
        setActiveSection('contact-form')
      }
    }

    // Use requestAnimationFrame for smooth scroll handling
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [lastScrollY])

  const navigationItems = [
    { name: 'Home', section: 'hero' },
    { name: 'About Us', section: 'about' },
    // { name: 'Current Projects', section: 'current-projects' },
    { name: 'Contact Us', section: 'contact-form' }
  ]

  return (
    <header 
      className={`fixed top-0 z-50 w-full transition-[height,background-color,box-shadow] duration-300 ease-in-out ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-sm shadow-sm' 
          : 'bg-white'
      }`}
      style={{
        height: isScrolled ? '80px' : '96px',
        transform: 'translateZ(0)', // Force GPU acceleration
      }}
    >
      <div className="container mx-auto flex items-center justify-between px-4 h-full">
        {/* Mobile Navigation Toggle */}
        <button 
          className="md:hidden transform-gpu"
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo - centered on mobile */}
        <div className={`flex items-center ${!isScrolled ? 'md:ml-0' : ''} ${isScrolled ? 'md:ml-0' : ''} flex-grow md:flex-grow-0 justify-center md:justify-start`}>
          <Link href="/" className="flex items-center">
            <div className="relative transition-transform duration-300 ease-in-out transform-gpu">
              <Image
                src="/images/Nilavan-Realtors-Logo.png"
                alt="Nilavan Realtors"
                width={100}
                height={40}
                className={`transition-transform duration-300 ease-in-out ${
                  isScrolled ? 'scale-80' : 'scale-100'
                }`}
                priority
                style={{ transform: 'translateZ(0)' }}
              />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation and Call Button */}
        <div className="hidden md:flex items-center space-x-8">
          {navigationItems.map((item) => (
            <button
              key={item.name}
              onClick={() => scrollToSection(item.section)}
              className={`font-normal text-gray-700 hover:text-gray-900 transition-all duration-300 ease-in-out px-2 py-2 relative ${
                activeSection === item.section ? 'text-gray-900' : ''
              }`}
            >
              {item.name}
              <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-all duration-300 ease-in-out ${
                activeSection === item.section ? 'opacity-100' : 'opacity-0'
              }`} />
            </button>
          ))}
          <Button 
            onClick={() => scrollToSection('contact-form')}
            className={`bg-primary transition-all duration-300 ease-in-out transform-gpu ml-6 ${
              isScrolled ? 'scale-95' : 'scale-100'
            }`}
          >
            <a href="tel:+91 9659555555 " className="flex Justify-center items-center gap-4">            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="#ffffff" strokeWidth="2"  className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> CALL US
            </a>
          </Button>
        </div>

        {/* Mobile Call Button */}
        <Button 
          onClick={() => scrollToSection('contact-form')}
          className={`md:hidden bg-primary transition-all duration-300 ease-in-out transform-gpu text-sm px-3 py-1.5 h-auto ${
            isScrolled ? 'scale-95' : 'scale-100'
          }`}
        >
          <a href="tel:+91 9659555555 " className="flex Justify-center items-center gap-4">     
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="#ffffff" strokeWidth="2" className="lucide lucide-phone mr-1"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> CALL US
          </a>
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/80 backdrop-blur-sm pb-4 px-4 transform-gpu">
          <nav className="flex flex-col space-y-4">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.section)}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 py-2 transform-gpu text-left"
              >
                {item.name}
              </button>
            ))}
            {/* <Button 
              onClick={() => scrollToSection('contact-form')}
              className="bg-primary hover:bg-blue-800 w-full transform-gpu"
            >
              Contact Now
            </Button> */}
          </nav>
        </div>
      )}
    </header>
  )
}

