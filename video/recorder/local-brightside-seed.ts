// LOCAL DEMO RECORDING ONLY — uncommitted. Seeds a fictional dental practice,
// "Brightside Family Dental", for the agency-workspace walkthrough, in three
// phases run between recording segments:
//   prep   — the sample agency identity
//   audit  — after the client is created on camera: audit v1 (sample findings,
//            built by the real runClientAudit pipeline with stubbed crawl
//            runners because this sandbox cannot reach the web), the agency's
//            outreach draft, and the prospect's illustrative reply
//   client — after the client is marked active on camera: a sample call, client
//            leads, KPI baselines, this month's loop, and a client-view link
// Dry run throughout: nothing is crawled, sent, charged or called.
import { randomUUID } from "node:crypto";
import fs from "node:fs";

process.env.DB_DRIVER = "sqlite";
const phase = process.argv[2];
const email = process.env.DEMO_EMAIL;
if (!email || !process.env.SQLITE_PATH) throw new Error("set SQLITE_PATH and DEMO_EMAIL");

const { devUserId } = await import("../src/lib/studio-session/dev-sign-in");
const { getRepo } = await import("../src/lib/db/repo");
const ownerId = `sb:${devUserId(email)}`;
const repo = await getRepo();
const SLUG = "brightside-family-dental";
const SITE = "https://brightsidefamilydental.com";
const now = Date.now();
const iso = (msAgo: number): string => new Date(now - msAgo).toISOString();
const MIN = 60_000;
const DAY = 86_400_000;

async function client() {
  const c = await repo.getAgencyClientBySlug(ownerId, SLUG);
  if (!c) throw new Error(`no client ${SLUG} for ${ownerId}`);
  return c;
}

if (phase === "prep") {
  await repo.upsertAgencyProfile(ownerId, {
    name: "Northlight Growth",
    primaryColor: "#1f3a5f",
    accentColor: "#f2b632",
    contactEmail: "hello@northlightgrowth.co",
    tagline: "Local SEO and AI front-desk workflows (sample agency)",
  });
  console.log("agency profile ready for", ownerId);
}

if (phase === "audit") {
  const { runClientAudit } = await import("../src/lib/agency/run-client-audit");
  const { operatorFinding } = await import("../src/lib/agency/audit-findings");
  const { issueDescriptor } = await import("../src/lib/seo-audit/issues");
  const { buildInboxActivity, threadRef } = await import("../src/lib/agency/ops/activity");
  let c = await client();
  const offer = "Same-week cleanings and family check-ups, with evening and Saturday appointments";
  c = (await repo.updateAgencyClient(ownerId, c.id, c.revision, {
    record: {
      ...c.record,
      contacts: [{ name: "Dr. Elena Park", role: "Owner", email: "elena@brightsidefamilydental.com", phone: "(503) 555-0148" }],
      brand: {
        ...c.record.brand,
        tone: "Warm, plain-spoken and reassuring. Short sentences. No dental jargon.",
        audience: "Busy Portland families booking cleanings and check-ups for parents and kids",
        offer,
        approvedClaims: ["Evening and Saturday appointments", "Kids and adults seen at the same visit"],
      },
    },
  })) ?? c;

  const u = (p: string): string => `${SITE}${p}`;
  type IssueType = Parameters<typeof issueDescriptor>[0];
  const group = (type: IssueType, paths: string[]) => {
    const d = issueDescriptor(type);
    return {
      type, severity: d.severity, title: d.title, description: d.explanation, howToFix: d.howToFix,
      affectedCount: paths.length, affected: paths.map((p) => ({ url: u(p) })), truncated: false,
    };
  };
  const run = await runClientAudit({
    websiteUrl: c.websiteUrl,
    offer,
    searchConsoleConnected: false,
    operatorFindings: [operatorFinding("missed-enquiries", "Operator test calls on Oct 15, 2026: 2 of 3 calls placed after 5pm went to voicemail with no callback offered.")],
    runners: {
      siteAudit: async () => ({
        report: {
          url: c.websiteUrl, finalUrl: c.websiteUrl, origin: u(""),
          issues: [
            group("duplicate-title" as IssueType, ["/", "/services", "/contact"]),
            group("missing-meta-description" as IssueType, ["/about", "/new-patients"]),
            group("title-too-long" as IssueType, ["/insurance"]),
          ],
          summary: { pagesCrawled: 12, pagesDiscovered: 12, maxPages: 25, issueCount: 3, crawlComplete: true, stoppedReason: null, notes: [] },
        },
      }) as never,
      aiVisibility: async () => {
        throw Object.assign(new Error("Not run for this audit."), { name: "AiVisibilityUnavailableError" });
      },
    },
  });
  const audit = await repo.createClientAudit({
    ownerId, clientId: c.id, source: "technical",
    report: run.report, selection: run.selection, recommendations: run.recommendations,
  });
  await repo.createClientActivity({
    ownerId, clientId: c.id, kind: "audit",
    title: `Audit v${audit.version} run: score ${audit.score} out of 100`,
    detail: { auditVersion: audit.version }, clientVisible: false,
  });

  await repo.createClientDraft({
    ownerId, clientId: c.id, kind: "email",
    draft: {
      title: "First touch: Brightside audit",
      subject: "Three Brightside pages share one title in Google",
      body: [
        "Hi Dr. Park,",
        "",
        "We ran a quick audit of brightsidefamilydental.com. Your homepage, Services and Contact pages all use the same title, so Google shows three near-identical results and none of them says what each page offers.",
        "",
        "We'd rewrite those three titles at no cost, so you can see the change before deciding anything else. The full findings, with the pages and how we checked them, are in the attached packet.",
        "",
        "We also noticed that two of three test calls after 5pm reached voicemail. If evenings matter for new patients, an AI receptionist can answer those calls and book a callback for your front desk.",
        "",
        "Worth a 15-minute call this week?",
        "",
        "Sam Rivera",
        "Northlight Growth",
      ].join("\n"),
      source: "brand-fallback",
      note: "Sample outreach written by the agency for this demo. Approving it does not send it.",
    },
  });

  const reply = buildInboxActivity({
    ref: threadRef("northlight-sales", "brightside-intro"),
    mailbox: "northlight-sales",
    threadId: "brightside-intro",
    messageId: "brightside-intro-2",
    from: "Dr. Elena Park <elena@brightsidefamilydental.com>",
    subject: "Re: Three Brightside pages share one title in Google",
    preview: "Thanks, I hadn't noticed the titles. Evenings are our problem: the front desk leaves at 5 and new families call after work. Can you send a scope for the titles and the after-hours calls?",
    receivedAt: iso(26 * MIN),
    unread: true,
  });
  await repo.createClientActivity({
    ownerId, clientId: c.id, kind: "inbox", title: reply.title, clientVisible: false,
    detail: {
      ...reply.detail,
      nextAction: "Send the scope and book a 15-minute call",
      preparedReply: {
        state: "draft",
        text: [
          "Hi Dr. Park,",
          "",
          "Here's the scope we'd propose for the first month:",
          "1. Rewrite the titles on the homepage, Services and Contact pages (free).",
          "2. Add descriptions to the About and New Patients pages.",
          "3. Put an AI receptionist on your line after 5pm: it answers, captures the family's needs and a callback, and hands a summary to your front desk each morning.",
          "",
          "We'll measure booked appointments and after-hours calls answered against this month's baseline and review together in four weeks.",
          "",
          "Does Thursday at 10 work for a 15-minute call?",
          "",
          "Sam",
        ].join("\n"),
      },
    },
  });
  console.log(JSON.stringify({ clientId: c.id, auditVersion: audit.version, score: audit.score }));
}

if (phase === "client") {
  const { buildCallActivity, callRef } = await import("../src/lib/agency/ops/activity");
  const { signClientViewToken } = await import("../src/lib/agency/view-token");
  let c = await client();

  const call = buildCallActivity({
    ref: callRef("CA5a1b2c3d4e5f60718293a4b5c6d7e8f9"),
    callSid: "CA5a1b2c3d4e5f60718293a4b5c6d7e8f9",
    kind: "conversation",
    from: "+15035550192",
    caller: "Marisol Vega",
    callback: "(503) 555-0192",
    at: iso(2 * 60 * MIN),
    summary: "After-hours call at 7:12pm. New family of four: cleanings for two adults and check-ups for kids aged 6 and 9. Asked about Saturday appointments and whether they take Delta Dental. The voice agent confirmed Saturday hours from the approved answers and took a callback number.",
    outcome: "message",
    nextAction: "Front desk calls back at 8am to offer Saturday 9:00 for all four",
  });
  await repo.createClientActivity({
    ownerId, clientId: c.id, kind: "call", title: call.title, clientVisible: true,
    detail: { ...call.detail, clientNote: "A new family of four called after hours; the AI receptionist took their details for a Saturday booking." },
  });

  const lead = (name: string, contact: string, source: "call" | "inbox" | "manual", stage: "new" | "qualified" | "booked", nextStep: string, minsAgo: number) => ({
    id: randomUUID(), name, contact, source, stage, nextStep, createdAt: iso(minsAgo * MIN), updatedAt: iso(minsAgo * MIN),
  });
  c = (await repo.updateAgencyClient(ownerId, c.id, c.revision, {
    record: {
      ...c.record,
      leads: [
        lead("Marisol Vega (family of four)", "(503) 555-0192", "call", "qualified", "Call back 8am: offer Saturday 9:00 for all four", 120),
        lead("Jordan Ames", "jordan.ames@mailbox.co", "inbox", "new", "Reply with new-patient forms and Tuesday evening slots", 45),
      ],
    },
  })) ?? c;

  if ((await repo.listClientMetrics(ownerId, c.id)).length === 0) {
    const score = (await repo.getLatestClientAudit(ownerId, c.id))?.score ?? null;
    await repo.createClientMetric({ ownerId, clientId: c.id, name: "Audit score", unit: "/100", source: "audit-score", baseline: score, baselineAt: iso(0), current: score, currentAt: iso(0), clientVisible: true, points: score === null ? [] : [{ at: iso(0), value: score }] });
    await repo.createClientMetric({ ownerId, clientId: c.id, name: "Booked appointments", unit: "per month", source: "manual", baseline: 18, baselineAt: iso(0), current: null, currentAt: null, clientVisible: true, points: [{ at: iso(0), value: 18 }] });
    await repo.createClientMetric({ ownerId, clientId: c.id, name: "After-hours calls answered", unit: "of test calls", source: "manual", baseline: 1, baselineAt: iso(4 * DAY), current: null, currentAt: null, clientVisible: true, points: [{ at: iso(4 * DAY), value: 1 }] });
  }

  const done = (evidence: string) => ({ state: "done" as const, evidence, doneAt: iso(0) });
  const period = new Date(now).toISOString().slice(0, 7);
  await repo.upsertClientCycle({
    ownerId, clientId: c.id, period,
    steps: {
      reaudit: done("Audit v1 is the baseline: 74 out of 100."),
      prioritize: done("Chosen with Dr. Park: rewrite the three duplicate titles, then after-hours call handling. Next client review: Thu, Nov 19, 2026, 10:00am."),
    },
  });

  const s = await signClientViewToken({ ownerId, clientId: c.id, days: 30 });
  await repo.createClientViewGrant({
    id: s.grantId, ownerId, clientId: c.id, tokenHash: s.tokenHash,
    scopes: { activity: true, deliverables: true, kpis: true },
    expiresAt: new Date(s.expiresAt).toISOString(),
  });
  const out = process.env.CV_OUT;
  if (out) fs.writeFileSync(out, `/cv/${s.token}`);
  console.log(JSON.stringify({ clientId: c.id, cv: `/cv/${s.token.slice(0, 12)}…` }));
}
