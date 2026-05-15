export default function HomePage() {
  const tools = [
    {
      title: "Squad IQ",
      description:
        "Analyze your squad, discover weak points, and identify transfer priorities instantly.",
    },
    {
      title: "Regen Lab",
      description:
        "Generate elite regen wonderkids with realistic potential and archetypes.",
    },
    {
      title: "Career Ideas",
      description:
        "Get unique career mode save concepts, challenge rules, and long-term rebuild ideas.",
    },
  ];

  return (
    <main className="page landing-page">
      {/* HERO */}
      <section className="landing-hero card">
        <div className="landing-topbar">
          <div>
            <p className="kicker">Career Mode Universe</p>
          </div>

          <div className="landing-nav">
            <a href="/pricing" className="landing-link">
              Pricing
            </a>

            <a href="/auth" className="landing-button secondary">
              Sign In
            </a>
          </div>
        </div>

        <div className="landing-content">
          <div>
            <h1>
              THE ULTIMATE
              <br />
              CAREER MODE APP.
            </h1>

            <p className="sub">
              Build smarter squads, discover elite regens, and create legendary
              career saves with Career Mode tools built for serious managers.
            </p>

            <div className="landing-actions">
              <a href="/auth" className="landing-button primary">
                Get Started
              </a>

              <a href="/pricing" className="landing-button ghost">
                View Pricing
              </a>
            </div>
          </div>

          <div className="landing-preview card">
            <div className="preview-stat">
              <span>Use Squad IQ</span>
              <strong>MANAGE YOUR SQUAD LIKE NEVER BEFORE</strong>
            </div>

            <div className="preview-stat">
              <span>Find New Career Mode Ideas</span>
              <strong>TAKE OVER AND WIN</strong>
            </div>

            <div className="preview-stat">
              <span>Use Regen Lab</span>
              <strong>FIND LEGENDARY REGENS</strong>
            </div>
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section className="landing-tools">
  {tools.map((tool) => (
    <a
      href="/auth"
      key={tool.title}
      className="tool-card card active-tool"
    >
      <div>
        <p className="tool-kicker">Career Mode Tools</p>

        <strong>{tool.title}</strong>
      </div>

      <span>{tool.description}</span>
    </a>
  ))}
</section>

      {/* PRICING PREVIEW */}
      <section className="pricing-preview card">
        <div>
          <p className="kicker">Plans</p>

          <h2>Start free. Upgrade anytime.</h2>

          <p className="sub">
            Unlock more generations, premium analysis, and unlimited access
            to every tool.
          </p>
        </div>

        <a href="/pricing" className="landing-button primary">
          Explore Plans
        </a>
      </section>
      <footer className="landing-footer">
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/refund">Refund Policy</a>
      </footer>
    </main>
  );
}