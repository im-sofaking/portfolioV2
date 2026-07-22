import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Slideshow } from "@/components/Slideshow";
import { photos } from "@/lib/photos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Andrea Zanacco — Photography" },
      { name: "description", content: "Photography portfolio by Andrea Zanacco." },
      { property: "og:title", content: "Andrea Zanacco — Photography" },
      { property: "og:description", content: "Photography portfolio by Andrea Zanacco." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <Layout>
      <Slideshow images={photos} />
    </Layout>
  );
}
