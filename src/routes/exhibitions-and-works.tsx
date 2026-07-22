import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/exhibitions-and-works")({
  head: () => ({
    meta: [
      { title: "Exhibitions and Works — Photography Portfolio" },
      { name: "description", content: "Past exhibitions, published works, and ongoing projects." },
      { property: "og:title", content: "Exhibitions and Works — Photography Portfolio" },
      { property: "og:description", content: "Past exhibitions, published works, and ongoing projects." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExhibitionsAndWorks,
});

function ExhibitionsAndWorks() {
  return (
    <Layout>
      <section className="px-6 md:px-12 py-12 md:py-16 max-w-2xl">
        <h2 className="text-2xl font-medium mb-8">Exhibitions and Works</h2>
        <div className="space-y-4 text-sm leading-relaxed text-neutral-700">
          <p>A list of exhibitions, publications, and ongoing bodies of work.</p>
        </div>
      </section>
    </Layout>
  );
}
