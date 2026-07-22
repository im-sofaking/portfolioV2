import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Slideshow } from "@/components/Slideshow";
import { darkroomPhotos } from "@/lib/photos";

export const Route = createFileRoute("/darkroom-printing")({
  head: () => ({
    meta: [
      { title: "Darkroom Printing — Andrea Zanacco" },
      { name: "description", content: "Hand-crafted silver gelatin darkroom prints by Andrea Zanacco." },
      { property: "og:title", content: "Darkroom Printing — Andrea Zanacco" },
      { property: "og:description", content: "Hand-crafted silver gelatin darkroom prints by Andrea Zanacco." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DarkroomPrinting,
});

function DarkroomPrinting() {
  const [backgroundPhase, setBackgroundPhase] = useState<"white" | "dark" | "white-delay" | "white-play">("white");

  useEffect(() => {
    const darkTimer = window.setTimeout(() => setBackgroundPhase("dark"), 2000);
    const whiteTimer = window.setTimeout(() => setBackgroundPhase("white"), 4000);
    const whiteDelayTimer = window.setTimeout(() => setBackgroundPhase("white-delay"), 4000);
    const whitePlayTimer = window.setTimeout(() => setBackgroundPhase("white-play"), 6000);

    return () => {
      window.clearTimeout(darkTimer);
      window.clearTimeout(whiteTimer);
      window.clearTimeout(whiteDelayTimer);
      window.clearTimeout(whitePlayTimer);
    };
  }, []);

  const backgroundStyle =
    backgroundPhase === "dark"
      ? {
          backgroundColor: "#000000",
          boxShadow: "inset 0 0 80px rgba(255,255,255,0.08)",
          transition: "background-color 1.2s ease",
        }
      : {
          backgroundColor: "#ffffff",
          transition: "background-color 0s linear",
        };

  return (
    <Layout
      variant={backgroundPhase === 'dark' ? 'darkroom' : 'light'}
      backgroundStyle={backgroundStyle}
    >
      <Slideshow
        images={darkroomPhotos}
        playEnabled={backgroundPhase === 'white-play'}
        emptyHint="Drop your print scans in src/assets/darkroom/ and they'll appear here automatically."
      />
    </Layout>
  );
}
