/**
 * Looping motion-graphic backdrop for the Care Plans hero — an animated
 * "refrigerant circuit": flowing pipe runs, a turning fan rotor and pulsing
 * junction nodes. Pure SVG + CSS (see globals.css), so it needs no video
 * asset and stops automatically under prefers-reduced-motion.
 */
export default function PlansHeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 ags-cinematic-bg" />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 640"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >

        {/* blueprint grid */}
        <g stroke="#6ab9ff" strokeOpacity="0.07">
          <path d="M0 160H1440M0 320H1440M0 480H1440" />
          <path d="M240 0V640M480 0V640M720 0V640M960 0V640M1200 0V640" />
        </g>


        {/* pipe runs with flowing dashes */}
        <g stroke="#6ab9ff" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round">
          <path className="ags-flow" d="M-40 210 H360 q40 0 40 40 V430 q0 40 40 40 H1480" />
          <path className="ags-flow-slow" d="M-40 470 H220 q40 0 40 -40 V210 q0 -40 40 -40 H1480" />
          <path className="ags-flow-rev" d="M-40 320 H1480" />
        </g>

        {/* junction nodes */}
        <g fill="#ff5a50">
          <circle className="ags-twinkle" cx="360" cy="250" r="6" />
          <circle className="ags-twinkle" cx="400" cy="470" r="6" style={{ animationDelay: "-1.2s" }} />
          <circle className="ags-twinkle" cx="260" cy="170" r="6" style={{ animationDelay: "-2.4s" }} />
          <circle className="ags-twinkle" cx="1040" cy="320" r="6" style={{ animationDelay: "-0.6s" }} />
        </g>

        {/* fan rotor */}
        <g transform="translate(1080 320)">
          <circle r="86" stroke="#6ab9ff" strokeOpacity="0.35" strokeWidth="2" />
          <g className="ags-spin">
            {[0, 1, 2, 3, 4].map((i) => (
              <ellipse
                key={i}
                cx="0"
                cy="-46"
                rx="16"
                ry="40"
                fill="#0090f8"
                fillOpacity="0.55"
                transform={`rotate(${i * 72})`}
              />
            ))}
            <circle r="14" fill="#d2eaff" />
          </g>
        </g>

        {/* condenser unit outline */}
        <g transform="translate(300 320)" stroke="#6ab9ff" strokeOpacity="0.4" strokeWidth="2">
          <rect x="-90" y="-70" width="180" height="140" rx="10" />
          <circle cx="0" cy="0" r="48" />
          <path d="M-70 -46 H70 M-70 46 H70" strokeOpacity="0.2" />
        </g>
      </svg>

      {/* fade into the page below */}
    </div>
  );
}
