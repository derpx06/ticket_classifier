import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  BrainCircuit,
  BadgeCheck,
  BellRing,
  Building2,
  CircleGauge,
  CheckCircle2,
  ClipboardList,
  ChartColumnBig,
  Clock3,
  Gauge,
  Layers3,
  Mail,
  MapPin,
  MessagesSquare,
  PhoneCall,
  ReceiptText,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const featureCards = [
  {
    title: 'Context-Aware Classification',
    body: 'Understand issue intent and product context from free-form ticket text without hardcoded keyword trees.',
    icon: ReceiptText,
  },
  {
    title: 'Dynamic Priority Scoring',
    body: 'Predict urgency and business impact so critical customer incidents rise above routine requests automatically.',
    icon: CircleGauge,
  },
  {
    title: 'Smart Team Assignment',
    body: 'Route each case to the right resolver group using issue category, severity, and team responsibility.',
    icon: ChartColumnBig,
  },
  {
    title: 'SLA Breach Prevention',
    body: 'Detect escalation risk early and trigger alerts before response and resolution targets are missed.',
    icon: BellRing,
  },
  {
    title: 'Agent Assist Summaries',
    body: 'Generate actionable ticket summaries so support agents resolve faster with complete context.',
    icon: ClipboardList,
  },
  {
    title: 'Audit-Ready Decisions',
    body: 'Every AI action includes reason tags and confidence signals for transparent triage governance.',
    icon: ShieldCheck,
  },
];

const quickStats = [
  { label: 'Classification Precision', value: '95.2%' },
  { label: 'Critical First Response', value: '9 min' },
  { label: 'Automated Triage', value: '87%' },
  { label: 'Ticket Reassignment Drop', value: '-46%' },
];

const impactStats = [
  { value: '3.4x', label: 'Faster initial triage', note: 'Compared to manual queue scanning.' },
  { value: '41%', label: 'Lower SLA breaches', note: 'Critical queue now gets immediate attention.' },
  { value: '29%', label: 'Higher CSAT trend', note: 'Fewer handoffs and clearer ownership.' },
];

const customerStrips = [
  'Fintech Support',
  'SaaS Helpdesk',
  'Enterprise IT',
  'Retail Ops',
  'Telecom Care',
  'HealthTech Service',
];

const workflow = [
  {
    title: 'Ingest & Understand',
    detail: 'Incoming email, chat, and portal tickets are normalized and interpreted by NLP for intent and domain context.',
    icon: ScanSearch,
  },
  {
    title: 'Score & Prioritize',
    detail: 'Urgency and impact are scored so high-risk issues move to the front while lower-severity requests stay organized.',
    icon: Clock3,
  },
  {
    title: 'Route & Assist',
    detail: 'Tickets are assigned to the best team and enriched with summaries, ownership signals, and SLA reminders.',
    icon: MessagesSquare,
  },
  {
    title: 'Learn & Improve',
    detail: 'Outcome feedback retrains routing confidence so the system gets sharper with every resolved case.',
    icon: BrainCircuit,
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
    <div className="landing-root relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#f0f9ff_38%,_#ffffff_80%)] text-slate-900">
      <div className="landing-noise pointer-events-none absolute inset-0 opacity-55" />
      <div className="landing-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="landing-orb landing-orb-a pointer-events-none absolute -left-24 top-20 h-56 w-56 rounded-full bg-sky-300/35 blur-3xl" />
      <div className="landing-orb landing-orb-b pointer-events-none absolute right-0 top-12 h-72 w-72 rounded-full bg-blue-300/25 blur-3xl" />
      <div className="landing-orb pointer-events-none absolute bottom-24 left-1/3 h-56 w-56 rounded-full bg-cyan-200/30 blur-3xl" />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 md:px-10">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
          <span className="landing-soft-glow inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">P</span>
          PVG Support Hub
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <a href="#features" className="hover:text-slate-900">Features</a>
          <a href="#proof" className="hover:text-slate-900">Proof</a>
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
        <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="landing-fade-up space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/95 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
              <Sparkles size={14} />
              AI Triage Control Center
            </div>

            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-bold leading-tight text-slate-900 md:text-6xl">
                Turn support queues into a fast, intelligent resolution engine.
              </h1>
              <p className="landing-copy max-w-xl text-lg text-slate-600 md:text-xl">
                PVG Support Hub classifies, prioritizes, and routes every incoming ticket with explainable AI so your team resolves critical issues first.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/auth/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary-dark"
              >
                Start Free Workspace
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                View Live Console
              </Link>
            </div>

            <div className="grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickStats.map((item) => (
                <article key={item.label} className="landing-card-hover rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                  <p className="text-xl font-bold text-slate-900">{item.value}</p>
                  <p className="landing-copy mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</p>
                </article>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              {customerStrips.map((strip) => (
                <span key={strip} className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5">
                  {strip}
                </span>
              ))}
            </div>
          </div>

          <aside className="landing-fade-up-delayed landing-glass rounded-3xl border border-cyan-100 bg-white/95 p-6 shadow-xl shadow-cyan-100/60 backdrop-blur md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Live Operations Pulse</p>
                <h2 className="mt-2 text-xl font-bold text-slate-800">AI Queue Snapshot</h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                <Gauge size={14} />
                Stable
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[0.44fr_0.56fr]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mx-auto h-20 w-20 rounded-full bg-[conic-gradient(#2563eb_0deg,#2563eb_300deg,#dbeafe_300deg,#dbeafe_360deg)] p-1">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-center">
                    <div>
                      <p className="text-xl font-bold text-slate-900">83%</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Auto Route</p>
                    </div>
                  </div>
                </div>
                <p className="landing-copy mt-3 text-center text-xs text-slate-500">
                  Tickets routed without manual reassignment.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-semibold text-slate-700">Ticket #PVG-2418</p>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">Critical</span>
                </div>
                <p className="landing-copy mt-2 text-sm text-slate-500">
                  Payment gateway outage reported by enterprise customer.
                </p>
                <div className="mt-3 h-2 rounded-full bg-slate-200">
                  <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-500">Urgency confidence 0.86</p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">
                <CheckCircle2 size={16} />
                Classified as incident in 1.2s
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-sky-700">
                <UsersRound size={16} />
                Routed to Payments Response Team
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-blue-700">
                <Clock3 size={16} />
                SLA risk alert pushed to on-call
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-indigo-700">
                <BadgeCheck size={16} />
                Resolution assistant generated
              </div>
            </div>
          </aside>
        </section>

        <section id="proof" className="landing-section-reveal mt-16">
          <div className="landing-glass rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg shadow-slate-200/60 md:p-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Performance Snapshot</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">Measured impact on support operations</h2>
              </div>
              <p className="landing-copy max-w-md text-sm text-slate-600">
                Teams using AI triage reduce backlog faster and spend less time reassigning tickets manually.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {impactStats.map((item) => (
                <article key={item.label} className="landing-card-hover rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-3xl font-bold text-slate-900">{item.value}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{item.label}</p>
                  <p className="landing-copy mt-2 text-xs text-slate-500">{item.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="landing-section-reveal mt-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Platform Highlights</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">Built for intelligent support operations</h2>
            </div>
            <p className="landing-copy max-w-md text-sm text-slate-600">
              Replace manual queue handling with explainable AI decisions your team can trust in production.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map(({ title, body, icon }) => (
              <article key={title} className="landing-card-hover landing-glass rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                  {React.createElement(icon, { size: 20 })}
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-800">{title}</h3>
                <p className="landing-copy mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="landing-section-reveal mt-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Execution Flow</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">Four-step AI triage cycle</h2>
            </div>
            <p className="landing-copy max-w-md text-sm text-slate-600">
              Keep every request moving with smart prioritization, clean ownership, and continuous feedback.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflow.map((step, index) => (
              <article key={step.title} className="landing-card-hover landing-glass rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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

        <section className="landing-section-reveal mt-20">
          <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-200/50 md:grid-cols-3 md:p-8">
            <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50 p-5">
              <Layers3 size={18} className="text-blue-700" />
              <h3 className="mt-3 text-lg font-bold text-slate-900">Multi-Channel Intake</h3>
              <p className="landing-copy mt-2 text-sm text-slate-600">Email, chat, and portal requests feed a unified triage pipeline.</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-cyan-50 p-5">
              <BrainCircuit size={18} className="text-cyan-700" />
              <h3 className="mt-3 text-lg font-bold text-slate-900">Continuous AI Learning</h3>
              <p className="landing-copy mt-2 text-sm text-slate-600">Closed ticket outcomes improve future routing and severity accuracy.</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-indigo-50 p-5">
              <ChartColumnBig size={18} className="text-indigo-700" />
              <h3 className="mt-3 text-lg font-bold text-slate-900">Ops-Level Reporting</h3>
              <p className="landing-copy mt-2 text-sm text-slate-600">Track queue health, SLA risk, and team workload from one dashboard.</p>
            </article>
          </div>
        </section>

        <section className="landing-section-reveal mt-20">
          <div className="landing-glass rounded-3xl border border-cyan-100 bg-[linear-gradient(135deg,_rgba(255,255,255,0.96)_0%,_rgba(240,249,255,0.92)_52%,_rgba(219,234,254,0.9)_100%)] p-8 shadow-xl shadow-cyan-100/60 md:p-10">
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

      <footer id="contact" className="relative mt-16 border-t border-slate-200/70 bg-white/85">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] md:px-10">
          <div>
            <p className="text-xl font-bold tracking-tight text-slate-900">PVG Support Hub</p>
            <p className="landing-copy mt-3 max-w-sm text-sm text-slate-600">
              AI-first support operations platform for classifying, prioritizing, and routing customer tickets at scale.
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
