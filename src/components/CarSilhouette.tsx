/**
 * Hand-drawn side profile of the VANTERA ONE — sleek, low, wide.
 *
 * Placeholder art: this component will later be swapped for a real
 * photographic asset, so it stays isolated here. Strokes inherit
 * `currentColor` from the parent, gold accents are explicit.
 */
export default function CarSilhouette({
  className,
}: {
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 1200 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Silhouette of the VANTERA ONE hypercar"
    >
      {/* pool of light under the car */}
      <ellipse
        cx="600"
        cy="308"
        rx="470"
        ry="9"
        fill="rgba(179,154,104,0.05)"
      />

      {/* main body — nose left, long tail right */}
      <path
        d="M72 268
           L86 258
           C120 240 170 230 218 226
           C250 196 300 186 352 196
           C392 204 424 212 452 218
           C500 208 546 184 596 160
           C640 140 700 136 742 142
           C800 152 830 162 852 172
           C878 178 906 182 934 192
           C1000 206 1060 214 1092 224
           L1108 232
           L1114 262
           L1092 272
           L992 276
           C988 185 836 185 832 276
           L410 276
           C414 190 246 190 250 276
           L150 272
           Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* canopy / glasshouse */}
      <path
        d="M560 170 C610 148 676 144 724 150 C762 156 790 166 808 176"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.7"
      />
      <path d="M724 150 L740 176" stroke="currentColor" strokeWidth="1" opacity="0.5" />

      {/* character line along the flank */}
      <path
        d="M140 248 C400 238 700 230 980 226"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.35"
      />

      {/* headlight blade — a whisper of gold */}
      <path
        d="M118 238 L178 230"
        stroke="rgba(179,154,104,0.9)"
        strokeWidth="1.5"
      />

      {/* rear wing */}
      <path d="M1016 198 L1098 188" stroke="currentColor" strokeWidth="2" />
      <path d="M1058 193 L1054 214" stroke="currentColor" strokeWidth="1" opacity="0.6" />

      {/* wheels */}
      {[
        { cx: 330, cy: 268 },
        { cx: 912, cy: 268 },
      ].map(({ cx, cy }) => (
        <g key={cx}>
          <circle
            cx={cx}
            cy={cy}
            r="54"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx={cx}
            cy={cy}
            r="34"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.6"
          />
          <circle cx={cx} cy={cy} r="5" fill="currentColor" opacity="0.6" />
          {[0, 72, 144, 216, 288].map((deg) => (
            <line
              key={deg}
              x1={cx}
              y1={cy - 10}
              x2={cx}
              y2={cy - 31}
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.55"
              transform={`rotate(${deg} ${cx} ${cy})`}
            />
          ))}
        </g>
      ))}
    </svg>
  )
}
