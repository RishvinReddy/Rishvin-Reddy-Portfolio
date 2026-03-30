/**
 * DevOS Premium Particle Network Background
 * Ultra-premium multi-layer floating nodes with aurora color shifting,
 * mouse-reactive repulse burst, and depth-of-field size variance.
 */

const isMobile = window.innerWidth < 768;

tsParticles.load("network-background", {
  fullScreen: { enable: false },
  fpsLimit: 60,

  // ── Background: transparent so CSS gradient shows through ──────────────
  background: {
    color: { value: "transparent" }
  },

  // ── Particle Layer ────────────────────────────────────────────────────
  particles: {
    number: {
      value: isMobile ? 40 : 90,
      density: { enable: true, area: 900 }
    },

    // Elegant multi-tone palette — slate/indigo/rose tinted dots
    color: {
      value: ["#94a3b8", "#c7d2fe", "#fda4af", "#bfdbfe", "#ddd6fe"]
    },

    // Varied sizes to simulate depth of field
    size: {
      value: { min: 1, max: 4 },
      animation: {
        enable: true,
        speed: 1.5,
        minimumValue: 0.5,
        sync: false
      }
    },

    // Opacity breathing animation — premium micro-pulse
    opacity: {
      value: { min: 0.08, max: 0.45 },
      animation: {
        enable: true,
        speed: 0.8,
        minimumValue: 0.05,
        sync: false
      }
    },

    // Silky interactive connection lines
    links: {
      enable: true,
      distance: isMobile ? 120 : 160,
      color: "#94a3b8",
      opacity: 0.18,
      width: 0.8,
      triangles: {
        enable: false
      }
    },

    // Slow, organic drift
    move: {
      enable: true,
      speed: isMobile ? 0.4 : 0.7,
      direction: "none",
      random: true,
      straight: false,
      outModes: "out",
      attract: {
        enable: true,
        rotateX: 600,
        rotateY: 1200
      }
    },

    // Premium shape: circle + subtle star mix
    shape: {
      type: ["circle"]
    }
  },

  // ── Interactive: grab + repulse burst on click ────────────────────────
  interactivity: {
    detectsOn: "window",
    events: {
      onHover: {
        enable: true,
        mode: ["grab", "bubble"]
      },
      onClick: {
        enable: true,
        mode: "repulse"
      },
      resize: true
    },
    modes: {
      grab: {
        distance: 180,
        links: { opacity: 0.5, color: "#f20d46" }
      },
      bubble: {
        distance: 120,
        size: 6,
        duration: 0.4,
        opacity: 0.6
      },
      repulse: {
        distance: 160,
        duration: 0.5,
        speed: 1
      }
    }
  },

  // ── Smooth startup ────────────────────────────────────────────────────
  detectRetina: true
});
