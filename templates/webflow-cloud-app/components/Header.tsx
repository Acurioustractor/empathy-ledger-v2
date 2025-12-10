import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-bold text-xl text-stone-900">act.place</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-stone-600 hover:text-stone-900 transition-colors"
            >
              Stories
            </Link>
            <Link
              href="/about"
              className="text-stone-600 hover:text-stone-900 transition-colors"
            >
              About
            </Link>
            <a
              href="https://empathyledger.com/join"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
            >
              Share Your Story
            </a>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
