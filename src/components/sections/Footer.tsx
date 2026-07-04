export default function Footer() {
  return (
    <footer
      className="border-t hairline px-6 py-12 md:px-[8vw]"
      aria-label="Footer"
    >
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <p className="font-display text-2xl font-light tracking-[0.3em] text-ivory">
          VANTERA
        </p>
        <nav
          aria-label="Sections"
          className="flex flex-wrap gap-x-10 gap-y-4 text-[0.62rem] uppercase tracking-[0.3em] text-ivory/55"
        >
          <a href="#assembly" className="transition-colors duration-500 hover:text-gold">
            Assembly
          </a>
          <a href="#design" className="transition-colors duration-500 hover:text-gold">
            Design
          </a>
          <a href="#performance" className="transition-colors duration-500 hover:text-gold">
            Performance
          </a>
          <a href="#gallery" className="transition-colors duration-500 hover:text-gold">
            Gallery
          </a>
          <a href="#viewing" className="transition-colors duration-500 hover:text-gold">
            Viewing
          </a>
        </nav>
      </div>
      <div className="mt-10 border-t hairline pt-6">
        <p className="max-w-2xl text-[0.68rem] font-light leading-6 tracking-wide text-ivory/50">
          VANTERA is a fictional brand created as a design and engineering
          portfolio piece. The VANTERA ONE does not exist; no vehicles are
          offered for sale. All specifications are imaginary.
        </p>
        <p className="mt-3 text-[0.62rem] uppercase tracking-[0.3em] text-ivory/50">
          © {new Date().getFullYear()} Vantera Motors — a fiction, faithfully engineered.
        </p>
      </div>
    </footer>
  )
}
