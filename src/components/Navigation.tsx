import { useState, useRef, useEffect } from "react";

interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Staff", href: "/staff" },
  { label: "Sermons", href: "/sermons" },
  { label: "Catechesis", href: "/catechesis" },
  {
    label: "Resources",
    href: "/resources",
    children: [
      { label: "Bulletins", href: "/resources#bulletins" },
      { label: "Calendar", href: "/resources#calendars" },
      { label: "Announcements", href: "/resources#announcements" },
    ],
  },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

function isActive(href: string, currentPath: string): boolean {
  if (href === "/") return currentPath === "/";
  return currentPath.startsWith(href);
}

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  // Determine current path (works in both SSR and client)
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "/";

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDesktopDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <nav className="bg-primary text-white relative">
      <div className="max-w-6xl mx-auto px-4">
        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center justify-center space-x-1 py-0">
          {navLinks.map((link) =>
            link.children ? (
              <li key={link.label} className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDesktopDropdownOpen(!desktopDropdownOpen)}
                  className={`px-4 py-3 text-sm tracking-wide uppercase transition-colors duration-200 flex items-center gap-1 cursor-pointer ${
                    isActive(link.href, currentPath)
                      ? "bg-primary-dark text-accent"
                      : "hover:bg-primary-light"
                  }`}
                >
                  {link.label}
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${desktopDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {desktopDropdownOpen && (
                  <ul className="absolute top-full left-0 bg-primary-dark min-w-48 shadow-lg z-50">
                    {link.children.map((child) => (
                      <li key={child.label}>
                        <a
                          href={child.href}
                          className={`block px-4 py-2.5 text-sm tracking-wide transition-colors duration-200 ${
                            isActive(child.href, currentPath)
                              ? "text-accent bg-primary"
                              : "hover:bg-primary-light hover:text-accent-light"
                          }`}
                        >
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={`block px-4 py-3 text-sm tracking-wide uppercase transition-colors duration-200 ${
                    isActive(link.href, currentPath)
                      ? "bg-primary-dark text-accent"
                      : "hover:bg-primary-light"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            )
          )}
        </ul>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center justify-end py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />

          {/* Slide-out Panel */}
          <div className="absolute top-0 right-0 w-72 h-full bg-primary-dark shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-primary-light">
              <span className="text-accent font-semibold tracking-wide text-sm uppercase">
                Menu
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 cursor-pointer"
                aria-label="Close navigation menu"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <ul className="py-2">
              {navLinks.map((link) =>
                link.children ? (
                  <li key={link.label}>
                    <button
                      onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                      className={`w-full text-left px-6 py-3 text-sm tracking-wide uppercase flex items-center justify-between cursor-pointer ${
                        isActive(link.href, currentPath)
                          ? "text-accent"
                          : "text-white hover:text-accent-light"
                      }`}
                    >
                      {link.label}
                      <svg
                        className={`w-3 h-3 transition-transform duration-200 ${mobileDropdownOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {mobileDropdownOpen && (
                      <ul className="bg-black/20">
                        {link.children.map((child) => (
                          <li key={child.label}>
                            <a
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className={`block px-10 py-2.5 text-sm tracking-wide ${
                                isActive(child.href, currentPath)
                                  ? "text-accent"
                                  : "text-white/80 hover:text-accent-light"
                              }`}
                            >
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ) : (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-6 py-3 text-sm tracking-wide uppercase ${
                        isActive(link.href, currentPath)
                          ? "text-accent"
                          : "text-white hover:text-accent-light"
                      }`}
                    >
                      {link.label}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}
