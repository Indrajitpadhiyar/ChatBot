import { motion } from "framer-motion";

// Golden starburst logo as inline SVG
const StarburstLogo = ({ size = 20 }) => {
  const spokes = 12;
  const cx = 50, cy = 50;
  const innerR = 18, outerR = 42;
  const dotR = 5, dotDist = 48;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {Array.from({ length: spokes }).map((_, i) => {
        const angle = (i * 360) / spokes - 90;
        const rad = (angle * Math.PI) / 180;
        return (
          <g key={i}>
            <line
              x1={cx + innerR * Math.cos(rad)} y1={cy + innerR * Math.sin(rad)}
              x2={cx + outerR * Math.cos(rad)} y2={cy + outerR * Math.sin(rad)}
              stroke="#C9922A" strokeWidth="5" strokeLinecap="round"
            />
            <circle
              cx={cx + dotDist * Math.cos(rad)}
              cy={cy + dotDist * Math.sin(rad)}
              r={dotR} fill="#C9922A"
            />
          </g>
        );
      })}
    </svg>
  );
};

// Three staggered bouncing dots
const DotsRow = () => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        style={{
          display: "inline-block",
          width: 3.5, height: 3.5,
          borderRadius: "50%",
          background: "#C9922A",
        }}
        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
        transition={{
          duration: 1.1,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.18,
        }}
      />
    ))}
  </span>
);

// ─────────────────────────────────────────
// TypingIndicator
// Compact — only as wide as its contents.
// Use: {isThinking && <TypingIndicator />}
// ─────────────────────────────────────────
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 4 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: 4 }}
    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    style={{
      /* KEY FIX: inline-flex so it shrinks to content width */
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 14px",
      borderRadius: 999,
      background: "#151929",
      border: "1px solid rgba(201,146,42,0.25)",
      boxShadow: "0 0 16px rgba(201,146,42,0.07)",
      position: "relative",
      /* Never stretch */
      width: "fit-content",
      flexShrink: 0,
    }}
  >
    {/* Glow behind logo */}
    <div
      style={{
        position: "absolute",
        left: 10, top: "50%", transform: "translateY(-50%)",
        width: 24, height: 24, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,146,42,0.25) 0%, transparent 70%)",
        filter: "blur(5px)",
        pointerEvents: "none",
      }}
    />

    {/* Rocking logo */}
    <motion.div
      animate={{ rotate: [0, 30, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      style={{ position: "relative", zIndex: 1, display: "flex", flexShrink: 0 }}
    >
      <StarburstLogo size={18} />
    </motion.div>

    {/* Bouncing dots */}
    <div style={{ position: "relative", zIndex: 1 }}>
      <DotsRow />
    </div>
  </motion.div>
);

export default TypingIndicator;