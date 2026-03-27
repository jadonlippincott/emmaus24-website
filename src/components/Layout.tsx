import type { ReactNode } from "react";
import Navigation from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      {/* Header */}
      <header className="bg-primary-dark text-white">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <a href="/" className="inline-block">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-wide text-white">
              Emmaus Evangelical Lutheran Church
            </h1>
            <p className="mt-1 text-sm sm:text-base text-accent-light tracking-widest uppercase">
              An LCMS Church in South Bend, IN
            </p>
          </a>
        </div>
      </header>

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-primary-dark text-white/80">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div>
              <h3 className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
                Contact
              </h3>
              <address className="not-italic text-sm leading-relaxed space-y-1">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=929+Milton+Street+South+Bend+IN+46613"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-light transition-colors"
                >
                  <p>929 Milton Street</p>
                  <p>South Bend, Indiana 46613-2825</p>
                </a>
                <p className="mt-2">
                  <a
                    href="tel:+15742874151"
                    className="hover:text-accent-light transition-colors"
                  >
                    (574) 287-4151
                  </a>
                </p>
              </address>
            </div>

            {/* Service Times */}
            <div>
              <h3 className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
                Worship
              </h3>
              <div className="text-sm leading-relaxed space-y-1">
                <p className="font-medium text-white">Divine Service</p>
                <p>Sunday Mornings at 9:00 AM</p>
              </div>
              <div className="mt-4">
                <h3 className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
                  Connect
                </h3>
                <a
                  href="https://www.facebook.com/profile.php?id=100068225293797"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm hover:text-accent-light transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </a>
              </div>
            </div>

            {/* Affiliation */}
            <div>
              <h3 className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
                Affiliation
              </h3>
              <div className="text-sm leading-relaxed space-y-1">
                <p>
                  A member congregation of{" "}
                  <a
                    href="https://www.lcms.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-accent-light transition-colors underline"
                  >
                    The Lutheran Church&mdash;Missouri Synod
                  </a>
                </p>
              </div>
              <div className="mt-4 text-sm leading-relaxed space-y-1">
                <p className="font-medium text-white">Pastors</p>
                <p>Rev. Ronald Stephens</p>
                <p>Rev. Dr. Richard Stuckwisch</p>
              </div>
            </div>
          </div>

          {/* Copyright & Dedication */}
          <div className="mt-8 pt-6 border-t border-white/20 text-center text-xs text-white/50 space-y-2">
            <p>
              &copy; {currentYear} Emmaus Evangelical Lutheran Church. All
              rights reserved.
            </p>
            <p className="italic">Dedicated to the Memory of David S. Smith</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
