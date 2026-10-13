// LOCAL DEMO RECORDING ONLY — uncommitted. Seeds one fictional lead (Maya Chen,
// Northwind Freight) into the local demo.db produced by local-demo-autopilot.ts and
// hands the company to the local dev sign-in identity. Dry-run everywhere: no
// provider keys, no live outbound flag, nothing leaves this machine.
import Database from "better-sqlite3";

process.env.DB_DRIVER = "sqlite";
const path = process.env.SQLITE_PATH;
const email = process.env.DEMO_EMAIL;
if (!path || !email) throw new Error("set SQLITE_PATH and DEMO_EMAIL");

const { devUserId } = await import("../src/lib/studio-session/dev-sign-in");
const owner = `sb:${devUserId(email)}`;

// Re-own every row the autopilot run created for its throwaway owner.
const db = new Database(path);
const row = db.prepare("SELECT owner_id FROM companies LIMIT 1").get() as { owner_id: string } | undefined;
if (row && row.owner_id !== owner) {
  const old = row.owner_id;
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
  for (const { name } of tables) {
    const cols = db.prepare(`PRAGMA table_info("${name}")`).all() as { name: string; type: string }[];
    for (const c of cols) {
      try { db.prepare(`UPDATE "${name}" SET "${c.name}"=? WHERE "${c.name}"=?`).run(owner, old); } catch { /* typed or constrained column */ }
    }
  }
}
db.close();

const { getRepo } = await import("../src/lib/db/repo");
const S = await import("../src/lib/company/support/service");
const { runSupportSalesPass } = await import("../src/lib/company/support/sequence");
const { draftColdEmail } = await import("../src/lib/company/growth/email");
const { loadGrowthFacts } = await import("../src/lib/company/growth/facts");

const repo = await getRepo();
let co = (await repo.listCompaniesByOwner(owner))[0];
if (!co) throw new Error("no company for owner");
co = (await repo.updateCompany(co.id, { name: "Inbound Lead Desk" })) ?? co;
co = (await repo.updateOperatorSettings(co.id, (s) => ({
  ...s,
  briefingEmailOptIn: true,
  briefingEmailRecipient: email,
  physicalMailingAddress: "Inbound Lead Desk, 100 Clematis St, West Palm Beach, FL 33401",
}))) ?? co;

const existing = await repo.listCompanyTickets({ companyId: co.id, limit: 50 });
if (existing.length === 0) {
  const maya = await S.intakeInquiry(repo, co, {
    source: "inbound_email",
    fromEmail: "maya.chen@northwindfreight.co",
    fromName: "Maya Chen",
    subject: "Pricing for our 6-person sales team?",
    body: "Hi there. I run sales at Northwind Freight. We get about 200 inbound leads a month and the good ones slip while we're on calls. Your AI receptionist took my details this morning. What would a trial cost for a 6-person team, and can you score leads against our ICP before they hit HubSpot?",
  }, { env: {} });
  console.log("maya", maya.ticket?.id, maya.ticket?.status, maya.action?.status);
  if (maya.action?.approvalId) {
    await repo.decideOutboundApproval(maya.action.approvalId, "approved", "Founder approved");
    const sent = await S.sendSupportAction(repo, co, maya.action.id, { env: {} });
    console.log("maya reply", JSON.stringify(sent).slice(0, 300));
  }
  const pass = await runSupportSalesPass(repo, co, { env: {}, now: () => new Date(Date.now() + 4 * 864e5) });
  console.log("follow-ups", JSON.stringify(pass).slice(0, 300));
  const raj = await S.intakeInquiry(repo, co, {
    source: "site_form",
    fromEmail: "raj@lumenrevops.co",
    fromName: "Raj Patel",
    subject: "Demo for our RevOps team next week?",
    body: "Saw the lead desk on your site. Could we get a demo next week? We'd want it flagging stalled pipeline deals every Monday.",
  }, { env: {} });
  console.log("raj", raj.ticket?.status, raj.action?.status);

  const facts = await loadGrowthFacts(repo, co);
  for (const recipient of [
    { email: "maya.chen@northwindfreight.co", name: "Maya Chen", note: "your call and email about scoring inbound leads" },
    { email: "jordan@harborlanelogistics.co", name: "Jordan Lee", note: "your post about inbound leads slipping between reps" },
  ]) {
    const drafted = await draftColdEmail(repo, { company: co, facts, recipient });
    console.log("growth draft", recipient.name, drafted.ok);
  }
}
console.log("owner", owner, "company", co.id);
