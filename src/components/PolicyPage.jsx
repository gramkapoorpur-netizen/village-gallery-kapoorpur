import { policyPages } from "../data/content";

export default function PolicyPage({ slug }) {
  const page = policyPages[slug] || policyPages.privacy;
  return (
    <section className="legal-page">
      <span className="eyebrow">Community Page</span>
      <h1>{page.titleHi}</h1>
      <h2>{page.title}</h2>
      {page.body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </section>
  );
}
