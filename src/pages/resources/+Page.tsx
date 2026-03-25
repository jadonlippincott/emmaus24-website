import { useState, useEffect } from "react";
import PDFList from "../../components/PDFList";

const categories = [
  { key: "bulletins", label: "Bulletins" },
  { key: "calendars", label: "Church Calendar" },
  { key: "announcements", label: "Announcements" },
];

const categoryKeys = categories.map((c) => c.key);

function getInitialTab(): string {
  if (typeof window === "undefined") return "bulletins";
  const hash = window.location.hash.replace("#", "");
  return categoryKeys.includes(hash) ? hash : "bulletins";
}

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<string>(getInitialTab);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (categoryKeys.includes(hash)) setActiveTab(hash);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">
        Church Resources
      </h1>
      <p className="text-[var(--color-warm-gray)] mb-8">
        Download the latest bulletins, church calendars, and announcements.
      </p>

      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === cat.key
                ? "border-[var(--color-accent)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-warm-gray)] hover:text-[var(--color-primary)] hover:border-gray-300"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Active PDF list */}
      <PDFList category={activeTab} />
    </div>
  );
}
