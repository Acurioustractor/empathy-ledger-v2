export function Footer() {
  return (
    <footer className="bg-stone-50 border-t border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌿</span>
              <span className="font-bold text-xl text-stone-900">act.place</span>
            </div>
            <p className="text-stone-600 text-sm">
              Real stories from real people, shared with consent and respect.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-stone-900 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-stone-600 hover:text-stone-900">Stories</a>
              </li>
              <li>
                <a href="/about" className="text-stone-600 hover:text-stone-900">About</a>
              </li>
              <li>
                <a
                  href="https://empathyledger.com/join"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-600 hover:text-stone-900"
                >
                  Share Your Story
                </a>
              </li>
            </ul>
          </div>

          {/* Powered by */}
          <div>
            <h4 className="font-semibold text-stone-900 mb-4">Storytelling Platform</h4>
            <p className="text-stone-600 text-sm mb-4">
              Stories are managed and controlled by storytellers via Empathy Ledger.
            </p>
            <a
              href="https://empathyledger.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sage-600 hover:text-sage-700 text-sm font-medium"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Powered by Empathy Ledger
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-200 text-center text-sm text-stone-500">
          <p>
            All stories remain the property of their storytellers.
            Shared with consent via{' '}
            <a
              href="https://empathyledger.com"
              className="text-sage-600 hover:underline"
            >
              Empathy Ledger
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
