import Image from "next/image";

const CURRENT_YEAR = new Date().getFullYear();

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-black dark:to-neutral-900">
      <header className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-emerald-400 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">FC</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold">FinFlow</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">AI Credit & Recovery</p>
            </div>
          </div>
          <nav className="hidden items-center gap-4 sm:flex">
            <a href="#features" className="text-sm text-zinc-600 hover:text-zinc-900">Features</a>
            <a href="#how" className="text-sm text-zinc-600 hover:text-zinc-900">How it works</a>
            <a href="#contact" className="text-sm text-zinc-600 hover:text-zinc-900">Contact</a>
            <a href="/login" className="text-sm text-zinc-600 hover:text-zinc-900">Log in</a>
            <a href="/signup" className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-600">Sign up</a>
            <a href="#demo" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:brightness-95">Request Demo</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
              Intelligent Credit Risk Assessment
              <br /> & Loan Recovery Automation
            </h1>
            <p className="mt-6 max-w-xl text-lg text-zinc-600 dark:text-zinc-300">
              FinFlow combines alternative data, explainable ML, and automated recovery orchestration to
              reduce defaults and improve recoveries — all in real time.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#demo" className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-600">Get a demo</a>
              <a href="#features" className="inline-flex items-center justify-center rounded-md border border-zinc-200 px-6 py-3 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300">See features</a>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-zinc-500">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-white/60 px-2.5 py-2.5 shadow flex items-center justify-center">📈</div>
                <div>
                  <div className="font-medium text-zinc-800 dark:text-zinc-200">20% lift in approvals</div>
                  <div className="text-xs">without increasing default risk</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-white/60 px-2.5 py-2.5 shadow flex items-center justify-center">⚡</div>
                <div>
                  <div className="font-medium text-zinc-800 dark:text-zinc-200">Real-time scoring</div>
                  <div className="text-xs">sub-second decisions</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -right-10 top-6 hidden h-[420px] w-[420px] rounded-3xl bg-gradient-to-br from-indigo-100 to-emerald-100 opacity-60 blur-3xl md:block" />
            <div className="relative z-10 mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-zinc-500">Risk Score</div>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">72</span>
                    <span className="text-sm text-zinc-500">(Low-Medium)</span>
                  </div>
                </div>
                <div className="text-right text-xs text-zinc-400">Model v1.3 • explainable</div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-600">Income stability</div>
                  <div className="font-medium text-zinc-800 dark:text-zinc-200">High</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-600">Transaction activity</div>
                  <div className="font-medium text-zinc-800 dark:text-zinc-200">Consistent</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-600">Document verification</div>
                  <div className="font-medium text-zinc-800 dark:text-zinc-200">Passed</div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white">View report</button>
                <button className="text-sm text-zinc-600 hover:underline">Share</button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Alternative Scoring', desc: 'Leverage transaction, behavioral and digital signals.' },
            { title: 'Explainable AI', desc: 'Transparent decisions for compliance.' },
            { title: 'Recovery Orchestration', desc: 'Multi-channel, personalized workflows.' },
            { title: 'Fraud Detection', desc: 'Real-time anomalies & document checks.' },
            { title: 'Event-driven', desc: 'Real-time pipelines and reliable queues.' },
            { title: 'Observability', desc: 'Metrics, logs and tracing for SLAs.' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">{f.title.split(' ')[0][0]}</div>
                <div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">{f.title}</div>
                  <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{f.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section id="demo" className="mt-20 rounded-2xl bg-gradient-to-r from-indigo-50 to-emerald-50 p-8 dark:from-zinc-900 dark:to-zinc-800">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Ready to reduce defaults and improve recoveries?</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Schedule a walkthrough and see FinFlow in action.</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <a href="#contact" className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Schedule demo</a>
            </div>
          </div>
        </section>

        <footer id="contact" className="mt-14 border-t border-zinc-100 pt-8 dark:border-zinc-800">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
            <div>
              <div className="font-medium">FinFlow</div>
              <div className="mt-1 text-sm text-zinc-500">AI Credit Risk & Loan Recovery Platform</div>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div className="text-sm text-zinc-600">Contact us: hello@finflow.example</div>
              <div className="text-sm text-zinc-600">© {CURRENT_YEAR} FinFlow</div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
