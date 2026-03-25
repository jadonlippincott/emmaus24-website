import { useState, useEffect } from "react";

interface SermonFile {
  name: string;
  url: string;
  date: string;
}

interface GroupedSermons {
  dateLabel: string;
  sortKey: string;
  sermons: SermonFile[];
}

function parseDateFromFilename(filename: string): {
  dateLabel: string;
  sortKey: string;
} {
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return { dateLabel: "Unknown Date", sortKey: "0000-00-00" };
  }

  const [, year, month, day] = match;
  const sortKey = `${year}-${month}-${day}`;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return { dateLabel, sortKey };
}

function titleFromFilename(filename: string): string {
  const withoutExt = filename.replace(/\.(mp3|m4a|ogg|wav|webm)$/i, "");
  const withoutDate = withoutExt.replace(/^\d{4}-\d{2}-\d{2}-?/, "");
  if (!withoutDate) return "Sermon";
  return withoutDate
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function groupByDate(sermons: SermonFile[]): GroupedSermons[] {
  const groups = new Map<string, GroupedSermons>();

  for (const sermon of sermons) {
    const { dateLabel, sortKey } = parseDateFromFilename(sermon.name);
    const existing = groups.get(sortKey);
    if (existing) {
      existing.sermons.push(sermon);
    } else {
      groups.set(sortKey, { dateLabel, sortKey, sermons: [sermon] });
    }
  }

  return Array.from(groups.values()).sort((a, b) =>
    b.sortKey.localeCompare(a.sortKey)
  );
}

export default function SermonPlayer() {
  const [sermons, setSermons] = useState<SermonFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSermons() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/files?category=sermons");
        if (!response.ok) {
          throw new Error("Failed to load sermons");
        }

        const data: { files?: SermonFile[] } | SermonFile[] = await response.json();

        if (!cancelled) {
          const items = Array.isArray(data) ? data : data.files ?? [];
          setSermons(items);
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

    fetchSermons();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-warm-gray text-sm">Loading sermons...</p>
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

  if (sermons.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-warm-gray italic">
          No sermons available at this time.
        </p>
      </div>
    );
  }

  const grouped = groupByDate(sermons);

  return (
    <div className="space-y-8">
      {grouped.map((group) => (
        <div key={group.sortKey}>
          <h3 className="text-lg font-semibold text-primary border-b border-gray-200 pb-2 mb-4">
            {group.dateLabel}
          </h3>
          <div className="space-y-4">
            {group.sermons.map((sermon) => (
              <div
                key={sermon.name}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                <h4 className="font-medium text-primary-dark mb-3">
                  {titleFromFilename(sermon.name)}
                </h4>
                <audio controls preload="none" className="w-full">
                  <source src={sermon.url} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
