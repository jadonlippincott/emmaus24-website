import React from "react";

interface WheatBannerProps {
  /** Override the primary golden color */
  color?: string;
  /** Override the lighter highlight color */
  highlightColor?: string;
  /** Banner height in px — width is always 100% */
  height?: number;
  /** Overall opacity (0–1) for lighter/subtler placement */
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A decorative horizontal wheat-motif banner.
 * Mirrors the chevron-kernel pattern of a wheat head
 * along a central stalk, tapering to fine awns at each end.
 *
 * Drop it between sections as a divider:
 *   <WheatBanner />
 *   <WheatBanner color="#8B6914" height={80} />
 */
export const WheatBanner: React.FC<WheatBannerProps> = ({
  color = "#C8913A",
  highlightColor = "#F2D06B",
  height = 120,
  opacity = 1,
  className,
  style,
}) => {
  const mid = "#D4A33A";

  // ── kernel pair helper ──────────────────────────────────────
  // cx  = attachment point on the stalk (x coord, y is always 60)
  // dir = -1 (left-facing head) | 1 (right-facing head)
  // sw  = stroke-width (tapers toward tip)
  // dy  = vertical spread of the pair
  const kernelPair = (
    cx: number,
    dir: number,
    sw: number,
    dy: number,
    key: string,
  ) => {
    const ex = cx + dir * 18;
    return (
      <g key={key}>
        <path
          d={`M${cx},60 Q${cx + dir * 10},${60 - dy * 0.6} ${ex},${60 - dy}`}
          stroke={`url(#kGrad${dir < 0 ? "L" : "R"})`}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M${cx},60 Q${cx + dir * 10},${60 + dy * 0.6} ${ex},${60 + dy}`}
          stroke={`url(#kGrad${dir < 0 ? "L" : "R"})`}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="round"
        />
      </g>
    );
  };

  // ── build the two wheat heads ───────────────────────────────
  const headPairs = 9;
  const spacing = 22;
  const startOffset = 30; // distance from center diamond

  const makeHead = (dir: number) => {
    const pairs: React.ReactNode[] = [];
    for (let i = 0; i < headPairs; i++) {
      const cx = 600 + dir * (startOffset + i * spacing);
      const t = i / (headPairs - 1); // 0 = base, 1 = tip
      const sw = 7 - t * 4.5; // 7 → 2.5
      const dy = 18 - t * 5; // 18 → 13
      pairs.push(kernelPair(cx, dir, sw, dy, `${dir}_${i}`));
    }
    // tip awn
    const awnStart = 600 + dir * (startOffset + (headPairs - 1) * spacing + 10);
    const awnEnd = awnStart + dir * 40;
    pairs.push(
      <path
        key={`awn_${dir}`}
        d={`M${awnStart},60 Q${(awnStart + awnEnd) / 2},58 ${awnEnd},55`}
        stroke={color}
        strokeWidth={1.4}
        fill="none"
        strokeLinecap="round"
        opacity={0.5}
      />,
    );
    return pairs;
  };

  // ── faint accent cluster further out ────────────────────────
  const accentCluster = (cx: number, dir: number) => (
    <g opacity={0.3} key={`acc_${dir}`}>
      {[0, 1, 2].map((i) => {
        const x = cx + dir * i * 16;
        const sw = 3.5 - i * 0.5;
        const dy = 14 - i * 2;
        return kernelPair(x, dir, sw, dy, `acc_${dir}_${i}`);
      })}
      <path
        d={`M${cx + dir * 48},60 Q${cx + dir * 60},58 ${cx + dir * 72},56`}
        stroke={color}
        strokeWidth={1.2}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );

  return (
    <div
      className={className}
      style={{ width: "100%", lineHeight: 0, opacity, ...style }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        viewBox="0 0 1200 120"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block", height }}
      >
        <defs>
          <linearGradient id="stalkG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={0} />
            <stop offset="25%" stopColor={color} stopOpacity={1} />
            <stop offset="75%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="kGradL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={highlightColor} />
            <stop offset="50%" stopColor={mid} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <linearGradient id="kGradR" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={highlightColor} />
            <stop offset="50%" stopColor={mid} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>

        {/* Stalk line */}
        <line
          x1="0"
          y1="60"
          x2="1200"
          y2="60"
          stroke="url(#stalkG)"
          strokeWidth={2.2}
          strokeLinecap="round"
        />

        {/* Left wheat head */}
        {makeHead(-1)}

        {/* Right wheat head */}
        {makeHead(1)}

        {/* Center diamond */}
        <polygon
          points="600,50 608,60 600,70 592,60"
          fill={mid}
          opacity={0.85}
        />

        {/* Faint accent clusters at far edges */}
        {accentCluster(200, -1)}
        {accentCluster(1000, 1)}

        {/* Tiny texture dots */}
        {[290, 330, 370, 830, 870, 910].map((cx) => (
          <circle
            key={cx}
            cx={cx}
            cy={60}
            r={1.5}
            fill={color}
            opacity={0.35}
          />
        ))}
      </svg>
    </div>
  );
};

export default WheatBanner;
