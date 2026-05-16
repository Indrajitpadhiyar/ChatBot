import { motion } from "framer-motion";

// ─────────────────────────────────────────────
// StarburstLogo
// Recreates the golden radial logo as inline SVG
// so no external image file is needed.
// ─────────────────────────────────────────────
const StarburstLogo = ({ size = 20 }) => {
  const spokes = 12;
  const cx = 50, cy = 50;
  const innerR = 18, outerR = 42; // spoke start / end radius
  const dotR = 5, dotDist = 48; // end-cap dot size / distance

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {Array.from({ length: spokes }).map((_, i) => {
        const angle = (i * 360) / spokes - 90; // start from top
        const rad = (angle * Math.PI) / 180;
        return (
          <g key={i}>
            {/* Radial spoke line */}
            <line
              x1={cx + innerR * Math.cos(rad)}
              y1={cy + innerR * Math.sin(rad)}
              x2={cx + outerR * Math.cos(rad)}
              y2={cy + outerR * Math.sin(rad)}
              stroke="#C9922A"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Dot at the tip of each spoke */}
            <circle
              cx={cx + dotDist * Math.cos(rad)}
              cy={cy + dotDist * Math.sin(rad)}
              r={dotR}
              fill="#C9922A"
            />
          </g>
        );
      })}
    </svg>
  );
};

// ─────────────────────────────────────────────
// DotsRow
// Three dots that bounce up/down one after another
// mimicking Claude's native typing indicator rhythm.
// ─────────────────────────────────────────────
const DotsRow = () => (
  <span className="flex items-center gap-[3px]">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        style={{
          display: "inline-block",
          width: 3.5,
          height: 3.5,
          borderRadius: "50%",
          background: "#C9922A",
        }}
        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
        transition={{
          duration: 1.1,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.18, // stagger each dot
        }}
      />
    ))}
  </span>
);

// ─────────────────────────────────────────────
// TypingIndicator  ← the component you embed
//
// Drop this wherever the AI response would appear
// in your chat list, e.g.:
//
//   {isThinking && <TypingIndicator />}
//
// It has NO wrapper that fills the screen —
// it only takes the space it needs.
// ─────────────────────────────────────────────
const TypingIndicator = () => (
  // Align to the left, same as AI message bubbles in your UI
  <div className="flex items-center">

    {/* Pill bubble — fades + scales in when mounted */}
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 4 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="relative inline-flex items-center gap-2"
      style={{
        padding: "9px 14px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(201,146,42,0.2)",
        boxShadow: "0 0 20px rgba(201,146,42,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Soft radial glow sitting behind the logo */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 8,
          top: "50%",
          transform: "translateY(-50%)",
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,146,42,0.3) 0%, transparent 70%)",
          filter: "blur(6px)",
        }}
      />

      {/* Logo rocks gently left → right → left */}
      <motion.div
        animate={{ rotate: [0, 30, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 flex"
      >
        <StarburstLogo size={20} />
      </motion.div>

      {/* Bouncing dots */}
      <div className="relative z-10">
        <DotsRow />
      </div>
    </motion.div>

  </div>
);

// ─────────────────────────────────────────────
// Preview wrapper (remove this in production)
// Shows the indicator inside a mock chat layout
// so you can see how it looks in context.
// ─────────────────────────────────────────────
const Preview = () => (
  <div
    className="flex flex-col gap-3 p-6"
    style={{ background: "#111318", minHeight: "100vh" }}
  >
    {/* Simulated AI message bubble */}
    <div
      className="self-start max-w-xs px-4 py-3 rounded-2xl text-sm text-gray-200"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      Hello! How can I help you today?
    </div>

    {/* Simulated user bubble */}
    <div
      className="self-end px-4 py-2 rounded-2xl text-sm text-white"
      style={{ background: "#22c55e" }}
    >
      heey
    </div>

    {/* ← The typing indicator lives right here in the flow */}
    <TypingIndicator />
  </div>
);

export default Preview;
