import { useEffect } from 'react'
import { initSmoothScroll } from './lib/smoothScroll'
import Hero from './components/Hero'
import AssemblySection from './components/AssemblySection'
import DesignSection from './components/sections/DesignSection'
import PerformanceSection from './components/sections/PerformanceSection'
import GallerySection from './components/sections/GallerySection'
import BookViewingSection from './components/sections/BookViewingSection'
import Footer from './components/sections/Footer'

export default function App() {
  useEffect(() => initSmoothScroll(), [])

  return (
    <div className="bg-bg text-ivory">
      <a href="#content" className="skip-link">
        Skip to content
      </a>
      <Hero />
      <main id="content" tabIndex={-1}>
        <AssemblySection />
        <DesignSection />
        <PerformanceSection />
        <GallerySection />
        <BookViewingSection />
      </main>
      <Footer />
    </div>
  )
}
