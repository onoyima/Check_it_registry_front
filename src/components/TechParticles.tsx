import { ParticlesProvider, useParticlesProvider, Particles } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

function ParticlesContent() {
  const { loaded } = useParticlesProvider();
  if (!loaded) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
      <Particles
        id="tsparticles"
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: { enable: true, mode: "grab" },
            },
            modes: {
              grab: { distance: 140, links: { opacity: 0.5 } },
            },
          },
          particles: {
            color: { value: "#10b981" },
            links: {
              color: "#6366f1",
              distance: 150,
              enable: true,
              opacity: 0.2,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: { default: "bounce" },
              random: true,
              speed: 0.8,
              straight: false,
            },
            number: {
              density: { enable: true },
              value: 60,
            },
            opacity: { value: 0.3 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
}

export default function TechParticles() {
  return (
    <ParticlesProvider init={loadSlim}>
      <ParticlesContent />
    </ParticlesProvider>
  );
}
