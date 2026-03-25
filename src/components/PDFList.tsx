import { useState, useEffect } from "react";

interface PDFFile {
  name: string;
  url: string;
  date: string;
}

interface PDFListProps {
  category: string;
}

function formatDateFromFilename(filename: string): string {
  // Extract date from filenames like "2026-03-23-bulletin.pdf"
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return filename.replace(/\.pdf$/i, "");

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function labelFromFilename(filename: string): string {
  // Remove date prefix and extension, then format remaining text
  const withoutExt = filename.replace(/\.pdf$/i, "");
  const withoutDate = withoutExt.replace(/^\d{4}-\d{2}-\d{2}-?/, "");
  if (!withoutDate) return "Document";
  return withoutDate
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function PDFList({ category }: PDFListProps) {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchFiles() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/files?category=${encodeURIComponent(category)}`
        );
        if (!response.ok) {
          throw new Error(`Failed to load ${category}`);
        }

        const data: { files?: PDFFile[] } | PDFFile[] = await response.json();

        if (!cancelled) {
          const items = Array.isArray(data) ? data : data.files ?? [];
          setFiles(items);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "An error occurred"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchFiles();
    return () => {
      cancelled = true;
    };
  }, [category]);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-warm-gray text-sm">Loading {category}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-warm-gray italic">
          No {category} available at this time.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {files.map((file) => (
        <li key={file.name} className="py-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-primary">
              {labelFromFilename(file.name)}
            </p>
            <p className="text-sm text-warm-gray mt-0.5">
              {formatDateFromFilename(file.name)}
            </p>
          </div>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors duration-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download
          </a>
        </li>
      ))}
    </ul>
  );
}
