"use client"

import { useState } from "react"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingStats } from "@/components/landing/landing-stats"
import { LandingFeatures } from "@/components/landing/landing-features"
import { LandingCourses } from "@/components/landing/landing-courses"
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works"
import { LandingTestimonials } from "@/components/landing/landing-testimonials"
import { LandingCta } from "@/components/landing/landing-cta"
import { LandingFooter } from "@/components/landing/landing-footer"
import { PaperGrid } from "@/components/utils/paper-grid"

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen overflow-x-hidden text-foreground">
      <PaperGrid />
      <LandingNavbar
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen(!menuOpen)}
      />
      <LandingHero />
      <LandingStats />
      <LandingFeatures />
      <LandingCourses />
      <LandingHowItWorks />
      <LandingTestimonials />
      <LandingCta />
      <LandingFooter />
    </div>
  )
}
