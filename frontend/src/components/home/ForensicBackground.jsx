export default function ForensicBackground() {
  return (
    <div className="forensic-background" aria-hidden="true">
      <div className="forensic-background__ambient" />
      <div className="forensic-background__grid" />
      <svg
        className="forensic-background__diagram"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <g className="forensic-background__contours">
          <circle cx="1120" cy="430" r="250" />
          <circle cx="1120" cy="430" r="184" />
          <circle cx="1120" cy="430" r="112" />
          <path d="M860 430h520M1120 170v520" />
        </g>
        <g className="forensic-background__trace-lines">
          <path pathLength="1" d="M80 710 C310 632 550 760 775 590 S1080 350 1325 230" />
          <path pathLength="1" d="M245 220 C465 275 580 342 746 333 S1030 510 1295 680" />
          <path pathLength="1" d="M465 100 L630 270 L760 250" />
        </g>
        <g className="forensic-background__nodes">
          <circle cx="245" cy="220" r="4" />
          <circle cx="630" cy="270" r="5" />
          <circle cx="760" cy="250" r="4" />
          <circle cx="775" cy="590" r="5" />
          <circle cx="1120" cy="430" r="6" />
          <circle cx="1295" cy="680" r="4" />
        </g>
      </svg>
      <div className="forensic-background__scan" />
    </div>
  );
}
