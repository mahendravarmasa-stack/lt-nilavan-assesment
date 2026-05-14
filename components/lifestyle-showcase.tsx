"use client"

import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import Image from "next/image"
import { useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface LifestyleFeature {
  id: number
  title: string
  image: string
}

const features: LifestyleFeature[] = [
  {
    id: 1,
    title: "Natural Undulations Golf Course",
    image: "/images/lifestyle1.jpg",
  },
  {
    id: 2,
    title: "Stone Component Wall",
    image: "/images/lifestyle2.jpg",
  },
  {
    id: 3,
    title: "Mimic Trees or Grass",
    image: "/images/lifestyle3.jpg",
  },
  {
    id: 4,
    title: "Grill Designed",
    image: "/images/lifestyle4.jpg",
  },
  {
    id: 5,
    title: "Compound Enterance",
    image: "/images/lifestyle5.jpg",
  },
  {
    id: 6,
    title: "Walking Path",
    image: "/images/lifestyle6.jpg",
  },
]

export default function LifestyleShowcase() {
  const timer = useRef<NodeJS.Timeout | null>(null)

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      slides: {
        perView: 1.5, // Narrower for mobile
        spacing: 16,
        origin: "center",
      },
      breakpoints: {
        "(min-width: 768px)": {
          slides: { perView: 2, spacing: 20 },
        },
        "(min-width: 1024px)": {
          slides: { perView: 4, spacing: 24 },
        },
      },
      created: (slider) => {
        clearInterval(timer.current!)
        timer.current = setInterval(() => {
          slider.next()
        }, 2500)
      },
    },
    []
  )

  const handlePrev = () => {
    instanceRef.current?.prev()
  }

  const handleNext = () => {
    instanceRef.current?.next()
  }

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [])

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-0 md:px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold font-playfair mb-4 md:mb-8 px-10 md:px-4">
          See Life at<br className="md:hidden" /> The Links Preserve
        </h2>
        <p className="text-gray-600 max-w-4xl mx-auto mb-10 text-[17px] leading-relaxed px-10 md:px-4">
          Take a closer look at the natural beauty, peaceful surroundings, and scenic views around The Links Preserve.
          From lush coconut groves to views of the golf course, explore what makes this place special.
        </p>

        <div className="relative px-0 sm:px-6 lg:px-12">
          {/* Arrows - Only show on md and above */}
          <button
            onClick={handlePrev}
            className="hidden md:block absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 text-[#0D4082] "
            aria-label="Previous Slide"
          >
            <ChevronLeft size={36} />
          </button>

          <button
            onClick={handleNext}
            className="hidden md:block absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 text-[#0D4082] "
            aria-label="Next Slide"
          >
            <ChevronRight size={36} />
          </button>

          {/* Carousel */}
          <div ref={sliderRef} className="keen-slider">
            {features.map((feature) => (
              <div key={feature.id} className="keen-slider__slide">
                <div className="flex flex-col items-center p-2 w-full max-w-[280px] sm:max-w-none mx-auto">
                  <div className="relative w-full aspect-[4/5] overflow-hidden shadow-lg">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-4 text-base font-semibold text-[#141414] font-playfair text-center">
                    {feature.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
