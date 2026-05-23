"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
interface Testimonial {
  id: number
  name: string
  location: string
  image: string
  rating: number
  testimonial: string
}

export default function TestimonialSection() {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Arun",
      location: "Coimbatore",
      image: '/images/testimonial.png',
      rating: 5,
      testimonial:
        "Nilavan Realtors made buying our dream villa seamless. The team guided us through every step, and we got the best deal!",
    },
    {
      id: 2,
      name: "Karthik S",
      location: "Investor",
      image:  '/images/testimonial.png',
      rating: 5,
      testimonial:
        "Highly professional and transparent. They helped me find the perfect plot with all legal clearances.",
    },
    {
      id: 3,
      name: "Divya R",
      location: "Homebuyer",
      image:  '/images/testimonial.png',
      rating: 5,
      testimonial: "The best real estate service in Coimbatore! Smooth process, great prices, and trustworthy advice.",
    },
    {
      id: 4,
      name: "Rajesh K",
      location: "Property Owner",
      image:  '/images/testimonial.png',
      rating: 5,
      testimonial: "Excellent service! They helped me sell my property at the best market value with minimal hassle.",
    },
    {
      id: 5,
      name: "Priya M",
      location: "First-time Buyer",
      image:  '/images/testimonial.png',
      rating: 5,
      testimonial:
        "As a first-time buyer, I was nervous about the process. Nilavan Realtors made it simple and stress-free!",
    },
  ]

  const [activeIndex, setActiveIndex] = useState(1)
  const [visibleTestimonials, setVisibleTestimonials] = useState<Testimonial[]>([])

  useEffect(() => {
    updateVisibleTestimonials()
  }, [activeIndex])

  const updateVisibleTestimonials = () => {
    const prevIndex = getPrevIndex(activeIndex)
    const nextIndex = getNextIndex(activeIndex)

    setVisibleTestimonials([testimonials[prevIndex], testimonials[activeIndex], testimonials[nextIndex]])
  }

  const getPrevIndex = (current: number) => {
    return current === 0 ? testimonials.length - 1 : current - 1
  }

  const getNextIndex = (current: number) => {
    return current === testimonials.length - 1 ? 0 : current + 1
  }

  const handlePrev = () => {
    setActiveIndex(getPrevIndex(activeIndex))
  }

  const handleNext = () => {
    setActiveIndex(getNextIndex(activeIndex))
  }

  const renderStars = (rating: number) => {
    return Array(rating)
      .fill(0)
      .map((_, i) => (
        <svg
          key={i}
          className="w-5 h-5 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      ))
  }

  return (
    <section className="py-16 ">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-playfair text-center mb-16">Client Review</h2>

        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 md:left-8"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 md:right-8"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Testimonials */}
          <div className="flex justify-center items-start gap-4 md:gap-8 overflow-hidden">
            {visibleTestimonials.map((testimonial, index) => {
              const isActive = index === 1

              return (
                <div
                  key={testimonial.id}
                  className={` flex flex-col items-center ${
                    isActive ? "w-full md:w-1/3 opacity-100 scale-100" : "w-0 md:w-1/4 opacity-50 scale-90"
                  }`}
                >
                  <div className={`flex flex-col items-center ${!isActive && "hidden md:flex"}`}>
                    <div className="relative w-24 h-24 mb-3 overflow-hidden rounded-full border-4 border-white shadow-md">
                     <img src={testimonial.image} alt="" />
                    </div>
                    <h3 className="text-xl font-semibold">{testimonial.name}</h3>
                    <p className="text-gray-600 mb-4">{testimonial.location}</p>

                    {isActive && (
                      <div className="bg-white p-6  shadow-md w-full max-w-md">
                        <div className="flex mb-3 justify-center">{renderStars(testimonial.rating)}</div>
                        <p className="text-center italic">"{testimonial.testimonial}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

