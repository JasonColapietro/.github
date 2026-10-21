"""Renders video/social/POSTING.md: per-platform captions for the 60-second
social cut, with character counts checked against each platform's limit.

usage: python3 -I captions.py video/social/POSTING.md
"""
import re
import sys

SITE = "https://agents.suedeai.ai/"
CALL = "https://calendar.app.google/8FyvYAspZaQFFP5eA"


def link(source, content):
    return f"{SITE}?utm_source={source}&utm_medium=social&utm_campaign=agency-walkthrough&utm_content={content}"


def x_len(text):
    """X counts every URL as 23 characters."""
    return len(re.sub(r"https?://\S+", "x" * 23, text))


FIELDS = []  # (section, label, text, limit, counter)


def field(section, label, text, limit, counter=len):
    n = counter(text)
    if n > limit:
        raise SystemExit(f"{section} / {label}: {n} > {limit}")
    FIELDS.append((section, label, text, limit, counter))


# ── TikTok (vertical) ──────────────────────────────────────────────────────
field("TikTok", "Caption", """Turn audits into clients. Keep them on autopilot.

One prospect, start to finish, in Suede AI Agent Studio: add the website, audit it before the first call, send a packet with your brand and theirs, win the account, then keep it with an AI receptionist, KPIs and a monthly loop.

Start building free: link in bio.
Demo: fictional dental practice, sample data.

#AIagents #MarketingAgency #SEO #AIautomation #AgencyOwner""", 4000)

# ── Instagram Reels (vertical) ─────────────────────────────────────────────
field("Instagram Reels", "Caption", """Turn audits into clients. Keep them on autopilot.

One prospect, start to finish, in Suede AI Agent Studio:

1. Add the prospect's website
2. Audit it before the first call. Every finding comes with evidence and a prepared fix
3. Pick what to share and send a packet with your brand and theirs
4. Approve the first email, read the reply, mark them won
5. Keep them: an AI receptionist answers after hours, KPIs track from the baseline, and a monthly loop keeps the work on schedule

Start building free at agents.suedeai.ai (link in bio).
Demo: fictional dental practice, sample data.

#aiagents #marketingagency #seo #aiautomation #agencyowner""", 2200)

# ── YouTube Shorts (vertical) ──────────────────────────────────────────────
field("YouTube Shorts", "Title", "Audit a prospect, win the client, keep them on autopilot | Suede AI Agent Studio", 100)
field("YouTube Shorts", "Description", f"""Turn audits into clients. Keep them on autopilot.

One prospect, start to finish, in Suede AI Agent Studio: add the website, audit it before the first call, send a packet with your brand and theirs, win the account, then keep it with an AI receptionist, KPIs and a monthly loop.

Start building free: {link("youtube", "60s-vertical")}
Book a 30-minute call: {CALL}

Demo: fictional dental practice, sample data. Narration is an AI voice.

#Shorts #AIagents #MarketingAgency""", 5000)

# ── LinkedIn (16:9) ────────────────────────────────────────────────────────
field("LinkedIn: Suede AI company page", "Post", f"""Turn audits into clients. Keep them on autopilot.

This is the whole agency loop in Suede AI Agent Studio, on one account record:

→ Add the prospect's website.
→ Audit it before the first call. Every finding carries its evidence and a prepared fix, and any check that wasn't run is marked as not run.
→ Pick what to share and publish a packet with your brand and theirs.
→ Approve the first-touch email. When the reply comes in, the scope is already in the thread.
→ Mark them won, then keep them: an AI receptionist answers after hours, KPIs start from a baseline, a monthly loop re-audits and measures, and the client gets a read-only view with both brands on it.

Every draft waits for your review.

Start building free: {link("linkedin", "60s-16x9")}
Rather have us set it up? Book a 30-minute call: {CALL}

The demo uses a fictional dental practice and sample data.

#AIagents #MarketingAgency #SEO #Automation #AgencyGrowth""", 3000)
field("LinkedIn: Jason Colapietro (repost)", "Repost text", """I built this so an agency can run the whole client loop in one place: audit the prospect before the call, send the packet, win the account, then keep it with voice, inbox and SEO workflows.

60 seconds, real product screens, sample data.""", 3000)

# ── X (16:9) ───────────────────────────────────────────────────────────────
field("X: @AISUEDE", "Post", f"""Turn audits into clients. Keep them on autopilot.

Audit a prospect before the call, send a packet with both brands, win the account, then keep it with an AI receptionist, KPIs and a monthly loop. All in Suede AI Agent Studio.

Start free: {link("x", "60s-16x9")}""", 280, x_len)
field("X: @Johnnysuede (quote post)", "Post", """Built so an agency runs the whole client loop in one place: audit, packet, outreach, won, then voice, KPIs and a monthly re-audit.

60 seconds of the real product, sample data.""", 280, x_len)

# ── Facebook (16:9 feed post, or the vertical cut as a Reel) ──────────────
field("Facebook: Suede AI page", "Post", f"""Turn audits into clients. Keep them on autopilot.

Watch one prospect go from first audit to active client in Suede AI Agent Studio: an audit with evidence for every finding, a packet with your brand and theirs, the first email, the reply, the win, and then an AI receptionist, KPIs and a monthly loop that keep the account.

Start building free: {link("facebook", "60s-16x9")}
Book a 30-minute call: {CALL}

Demo: fictional dental practice, sample data.""", 63206)


SETTINGS = {
    "TikTok": "File: `suede-social-60s-vertical.mp4`. Turn on **AI-generated content**, because the narration is an AI voice. Cover: the first frame (\"How an agency wins a client\").",
    "Instagram Reels": "File: `suede-social-60s-vertical.mp4`. Share to the feed as well. Under Advanced settings, turn on **AI info**, because the narration is an AI voice. Cover: the first frame. The first 125 characters show before \"more\", so the caption opens with the headline.",
    "YouTube Shorts": "File: `suede-social-60s-vertical.mp4`. Category **Science & Technology**, **Public**, language **English**. For **Altered or synthetic content**, choose **Yes**, because the narration is an AI voice. Add to the playlist **Suede AI Agent Studio in Motion**.",
    "LinkedIn: Suede AI company page": "File: `suede-social-60s-16x9.mp4`. Upload the video natively; don't post a link to it. LinkedIn shows about 210 characters before \"see more\", so the headline and first line come first. To keep reach on the video, move the two links into the first comment and end the post with \"Links in the first comment.\"",
    "LinkedIn: Jason Colapietro (repost)": "Repost the company post with these thoughts.",
    "X: @AISUEDE": "File: `suede-social-60s-16x9.mp4`. Attach it to the post. Pin it if it should lead the profile.",
    "X: @Johnnysuede (quote post)": "Quote-post the @AISUEDE post.",
    "Facebook: Suede AI page": "File: `suede-social-60s-16x9.mp4` for the feed, or `suede-social-60s-vertical.mp4` as a Reel with the same text. Meta asks for an **AI info** label on realistic AI audio, so add it.",
}

out = sys.argv[1]
lines = [
    "# Social posting kit: the 60-second agency cut",
    "",
    "These are paste-ready captions for the two 60-second cuts in this folder. Each field shows its character count, checked against the platform's limit.",
    "",
    "Rules that apply to every post:",
    "",
    "- **Line:** lead with the current homepage line, \"Turn audits into clients. Keep them on autopilot.\" It replaced \"Reports win clients. Workflows keep them.\" on the homepage on 2026-10-19.",
    "- **Name:** write **Suede AI Agent Studio** in full.",
    "- **Claims:** make no claims about rankings, citations or client results. Describe what the product does.",
    "- **Sample data:** say the demo uses a fictional practice and sample data. The video labels it on screen too.",
    "- **Links:** link to agents.suedeai.ai with the UTM tags given. Never link seo.suedeai.ai, which moved to suedeai.ai on 2026-10-19.",
    "- **AI voice:** the narration is an AI voice (Kokoro). Each platform's AI label setting is listed with its caption.",
    "",
]
section = None
for sec, label, text, limit, counter in FIELDS:
    if sec != section:
        lines += ["---", "", f"## {sec}", "", SETTINGS.get(sec, ""), ""]
        section = sec
    note = " (each link counts as 23)" if counter is x_len else ""
    lines += [f"**{label}** ({counter(text)}/{limit}{note})", "", "```", text, "```", ""]
with open(out, "w") as f:
    f.write("\n".join(lines).rstrip() + "\n")
for sec, label, text, limit, counter in FIELDS:
    print(f"{counter(text):5d}/{limit:<5d} {sec} / {label}")
