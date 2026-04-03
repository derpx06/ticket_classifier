import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChartColumnBig,
  Clock3,
  Mail,
  MapPin,
  PhoneCall,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const featureCards = [
  {
    title: 'NLP Ticket Understanding',
    body: 'Analyze ticket text to detect intent, category, and urgency without relying on rigid keyword rules.',
    icon: ReceiptText,
  },
  {
    title: 'AI Priority Prediction',
    body: 'Automatically score tickets as Low, Medium, High, or Critical based on business impact and language signals.',
    icon: ShieldCheck,
  },
  {
    title: 'Smart Team Routing',
    body: 'Route each ticket to the right support queue using issue type, urgency, and team expertise.',
    icon: ChartColumnBig,
  },
  {
    title: 'SLA Risk Visibility',
    body: 'Spot delay risks early and keep critical tickets moving before service targets are breached.',
    icon: UsersRound,
  },
];

const quickStats = [
  { label: 'Classification Accuracy', value: '94.8%' },
  { label: 'Critical First Response', value: '< 12 min' },
  { label: 'Automated Triage Coverage', value: '82%' },
];

const workflow = [
  {
    title: 'Classify',
    detail: 'Incoming ticket text is interpreted by NLP to identify issue type and domain context.',
    icon: ReceiptText,
  },
  {
    title: 'Prioritize',
    detail: 'AI assigns urgency so critical incidents are surfaced first and routine requests are queued efficiently.',
    icon: Clock3,
  },
  {
    title: 'Route',
    detail: 'Tickets are distributed to the most relevant team to reduce handoffs and speed up resolution.',
    icon: CheckCircle2,
  },
];

const footerGroups = [
  {
    title: 'Platform',
    items: ['AI Triage', 'Priority Queue', 'Routing Rules', 'Audit Trail'],
  },
  {
    title: 'Company',
    items: ['About', 'Use Cases', 'Support', 'Documentation'],
  },
  {
    title: 'Contact',
    items: ['support@pvgsupporthub.com', '+1 (800) 555-0174', 'Pune, India'],
  },
];

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const currentYear = new Date().getFullYear();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_#ecfeff_0%,_#f8fafc_38%,_#ffffff_78%)] text-slate-900">
      <div className="landing-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="landing-orb landing-orb-a pointer-events-none absolute -left-24 top-24 h-52 w-52 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="landing-orb landing-orb-b pointer-events-none absolute right-0 top-16 h-64 w-64 rounded-full bg-blue-300/25 blur-3xl" />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 md:px-10">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
          <span className="landing-soft-glow inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">P</span>
          PVG Support Hub
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <a href="#features" className="hover:text-slate-900">Features</a>
          <a href="#workflow" className="hover:text-slate-900">Workflow</a>
          <a href="#contact" className="hover:text-slate-900">Contact</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/auth/login"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-white sm:px-4"
          >
            Login
          </Link>
          <Link
            to="/auth/signup"
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark sm:px-4"
          >
            Register
          </Link>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-6xl px-6 pb-14 pt-4 md:px-10 md:pb-20">
        <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="landing-fade-up space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
              <Sparkles size={14} />
              AI Ticket Triage System
            </div>

            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-bold leading-tight text-slate-900 md:text-6xl">
                Classify, prioritize, and route support tickets with AI.
              </h1>
              <p className="landing-copy max-w-xl text-lg text-slate-600 md:text-xl">
                PVG Support Hub helps teams reduce manual triaging, respond faster to critical issues, and distribute workload intelligently across support teams.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/auth/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary-dark"
              >
                Start Triage Automation
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Open Dashboard
              </Link>
            </div>

            <div className="grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickStats.map((item) => (
                <article key={item.label} className="rounded-xl border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur">
                  <p className="text-xl font-bold text-slate-900">{item.value}</p>
                  <p className="landing-copy mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="landing-fade-up-delayed landing-glass rounded-3xl border border-cyan-100 bg-white/90 p-6 shadow-xl shadow-cyan-100/50 backdrop-blur md:p-7">
            <h2 className="text-xl font-bold text-slate-800">AI Queue Snapshot</h2>
            <p className="landing-copy mt-2 text-sm text-slate-600">
              Tickets are continuously scored for urgency and routed to the right team in real time.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-semibold text-slate-700">Ticket #PVG-2418</p>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">Critical</span>
                </div>
                <p className="landing-copy mt-2 text-sm text-slate-500">Payment gateway outage reported by enterprise customer</p>
              </div>

              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">
                  <BadgeCheck size={16} />
                  Classified as Incident in 1.3 seconds
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-sky-700">
                  <UsersRound size={16} />
                  Routed to Payments Response Team
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-blue-700">
                  <Clock3 size={16} />
                  SLA risk alert triggered for immediate action
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section id="features" className="mt-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Built for intelligent support operations</h2>
            <p className="landing-copy max-w-md text-sm text-slate-600">
              Replace manual ticket triaging with fast, explainable AI decisions your team can trust.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map(({ title, body, icon }) => (
              <article key={title} className="landing-glass rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                <span className="inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                  {React.createElement(icon, { size: 20 })}
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-800">{title}</h3>
                <p className="landing-copy mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="mt-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Three-step AI triage flow</h2>
            <p className="landing-copy max-w-md text-sm text-slate-600">
              Keep every support request moving with smart prioritization and clean handoffs.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {workflow.map((step, index) => (
              <article key={step.title} className="landing-glass rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="inline-flex rounded-lg bg-cyan-50 p-2 text-cyan-700">
                    {React.createElement(step.icon, { size: 18 })}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{step.title}</h3>
                <p className="landing-copy mt-2 text-sm leading-relaxed text-slate-600">{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="landing-glass rounded-3xl border border-cyan-100 bg-[linear-gradient(130deg,_rgba(255,255,255,0.95)_0%,_rgba(236,254,255,0.9)_52%,_rgba(219,234,254,0.88)_100%)] p-8 shadow-xl shadow-cyan-100/60 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
                  <Building2 size={14} />
                  For High-Volume Support Teams
                </p>
                <h3 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">
                  Ready to build faster and smarter ticket resolution?
                </h3>
                <p className="landing-copy mt-2 text-sm text-slate-600 md:text-base">
                  Deploy AI-based classification, prioritization, and routing to protect SLAs and improve customer satisfaction.
                </p>
              </div>

              <Link
                to="/auth/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
              >
                Create Workspace
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="relative mt-16 border-t border-slate-200/70 bg-white/80">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] md:px-10">
          <div>
            <p className="text-xl font-bold tracking-tight text-slate-900">PVG Support Hub</p>
            <p className="landing-copy mt-3 max-w-sm text-sm text-slate-600">
              AI-driven support operations platform for classifying, prioritizing, and routing customer tickets at scale.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">{group.title}</p>
              <ul className="landing-copy mt-3 space-y-2 text-sm text-slate-600">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 border-t border-slate-200/70 px-6 py-4 text-xs text-slate-500 md:flex-row md:items-center md:px-10">
          <p>Copyright {currentYear} PVG Support Hub. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5"><Mail size={13} />support@pvgsupporthub.com</span>
            <span className="inline-flex items-center gap-1.5"><PhoneCall size={13} />+1 (800) 555-0174</span>
            <span className="inline-flex items-center gap-1.5"><MapPin size={13} />Pune</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
