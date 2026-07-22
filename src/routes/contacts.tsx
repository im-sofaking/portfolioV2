import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Contacts — Photography Portfolio" },
      { name: "description", content: "Get in touch for prints, exhibitions, and commissions." },
      { property: "og:title", content: "Contacts — Photography Portfolio" },
      { property: "og:description", content: "Get in touch for prints, exhibitions, and commissions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contacts,
});

function Contacts() {
  return (
    <Layout>
      <section className="px-6 md:px-12 py-12 md:py-16 max-w-2xl">
        <h2 className="text-2xl font-medium mb-8">Contacts</h2>
        <div className="space-y-4 text-sm leading-relaxed text-neutral-700">
          <p>
            For prints, collaborations, exhibitions, or commissions, please reach out.
          </p>
          <p>
            Email: <a href="mailto:hello@example.com" className="underline underline-offset-4 hover:opacity-60">hello@example.com</a>
          </p>
        </div>
      </section>
    </Layout>
  );
}
