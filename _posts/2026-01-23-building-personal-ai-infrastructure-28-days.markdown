---
author: Sean
comments: true
date: 2026-01-23 12:00:00+00:00
layout: post
title: "Building a Personal AI Infrastructure in 28 Days"
header-img: "img/building-personal-ai-infrastructure.png"
meta-description: I built a personal AI infrastructure in 28 days using Daniel Miessler's PAI concept. Here's what I learned and why it matters for business.
categories:
- Blog
- AI
- Technology
---

Most people treat AI conversations as disposable. Ask a question, get an answer, close the tab, forget the context. I did that for two years and despite pruning ended up with 1,038 ChatGPT conversations - a graveyard of half-finished thinking, abandoned research, and strategic planning that existed only in a chat history I'd never revisit.

The problem isn't the AI. The problem is that every conversation starts from zero. Your AI has no memory of what you figured out last week. No access to the decisions you made last month. No understanding of the context you've spent years building. Each session, you're re-explaining your business, your preferences, your constraints, and then throwing away whatever you built together.

I decided to fix that. Over 28 days, I built a Personal AI Infrastructure (PAI) that actually remembers what I've learned.

## The Uncomfortable Truth

ChatGPT was first with memory, Claude was first with projects; their features have improved significantly, but custom instructions are still limited to 1,500 characters.

When OpenAI decided to change how Projects worked, users had to manually migrate their instructions or lose them (like I did). ChatGPT also had a catastrophic failure in February 2025 that lost users' conversation history, and Claude Projects has a known bug right now where it forgets uploaded file contents.

I realised that my carefully crafted context, refined over months, existed at the discretion of these vendors. It's all subject to change, and not truly portable.

Anyone who's worked with me knows I have trust issues around vendor dependency. I've seen too many teams tied to a terrible service provider, trapped when a platform changes pricing, changes a feature you relied on, gets acquired, or just disappears. I've watched organisations lose years of institutional knowledge because it lived in a tool they can no longer use.

Ask me about the time when working in WeWork, Soho, when I went for a quick coffee, bumped into a Shopify solutions architect, and ended up arguing this very point with him for over over an hour and a half.

Do you want your complete business knowledge architecture locked in a platform with that level of uncertainty? Or today's essential tool becomes tomorrow's ad-supported platform.

OpenAI recently announced they're exploring advertising because subscription revenue isn't enough. Their [financial position is precarious](https://www.youtube.com/watch?v=l0K4XPu3Qhg){:target="_blank"} - losses reportedly outpacing revenue three-to-one, with over a trillion dollars in planned infrastructure investment contingent on achieving Artificial General Intelligence (AGI).

## Introducing SAI

If Claude, OpenAI, or any other tool vanishes tomorrow, I wanted to be in a position where I only lose a tool, not years of accumulated thinking.

Over Christmas 2025, I built what I call SAI. SAI stands for Sean's AI (obviously).

SAI is my Personal AI Infrastructure, that actually remembers what I've learned and removes the dependency and vendor lock in that I so despise. I liked the double meaning of SAI: in Sanskrit, "sai" means divine or master; in Japanese (才), it means talent or ability.

Will SAI give me God-like talent? I'm working on it.

## The Core Idea: Filesystem as Brain

The principle is simple: all permanent knowledge lives in files, not chat histories.

Every AI conversation that produces something worth keeping gets captured in a markdown file. Every decision, every piece of research, every strategic plan goes into a folder structure I control, tracked by Git, and accessible to any AI tool I choose to use.

When I start a new conversation with Claude, ChatGPT or a local AI model (Mistral, LLama, DeepSeek) I can point it at the relevant files. The model reads my previous thinking, understands the context, and picks up where I left off. No re-explaining, context loss or starting from zero.

Git commits become a memory system - 204 commits over 28 days tracking how my thinking evolved, what decisions I made and why, what I tried that didn't work.

## What I Actually Built

The technical setup breaks down into a few key pieces:

**Multi-AI routing:** I use different AI tools for different jobs. [Claude Code](https://claude.ai/code){:target="_blank"} for architecture and multi-file work. [Gemini](https://github.com/google-gemini/gemini-cli){:target="_blank"} for research and current information. Codex for quick terminal queries. Ollama for anything involving sensitive data that shouldn't leave my network. The AIs can even delegate to each other - Claude can spin up a Gemini research task when it needs current information, then continue once the results come back.

**Context files:** Standardised markdown files that any AI can read. Project instructions, decision matrices, handoff protocols. Each project gets its own context file, so I can isolate context to only that project when needed. When I switch between tools or come back after a break, the context travels with me.

**Automation:** Shell scripts and aliases that reduce friction. A command to initialise a new session. A script to hand off work between AI tools. Integration with Todoist and Notion via MCP servers.

**Storage:** A ZFS dataset on my server, mounted to my AI workstation. ZFS gives me snapshots (I can roll back if something goes wrong), compression (saves space), and checksums (catches corruption before it causes problems).

Honestly, the MCP server setup was harder than expected. OAuth troubleshooting ate most of a day, and the [Todoist MCP server is still very buggy](https://github.com/Doist/todoist-ai/issues/273){:target="_blank"} - it works, but not perfectly. But once it worked, having my task manager and notes system directly accessible to SAI changed how I work.

## How I'm Using It

I'm using SAI for career planning and a project I'm calling Harbour. I won't go into the details here - it's the start of a ten-year plan to make some significant life changes - but the point is that this system works for strategic thinking, not just technical tasks.

SAI can access any source, and I can use the strengths of any model to access context across weeks of thinking; to have SAI remember what I was considering, what I ruled out and why, and what the constraints are.

I've used SAI to unify eleven years of health data from multiple wearables and apps - Jawbone, Garmin, Withings, Sleep as Android, Google Fit - into a single analytical layer. Over 2,500 weight records, 2,800 sleep records, and 3,300 daily step counts, all normalised and queryable.

What initially looked like bad data to the model turned out to accurately reflect my hybrid working patterns, followed by COVID-enforced lockdowns between 2018 and 2021. I also discovered that Garmin was over-reporting my sleep by several hours each night when compared with Sleep as Android data, and that my sleep quality had actually been declining since mid-2024 - something I hadn't spotted in any single app.

These patterns only emerged from analysis of unified, long-term data.

## Business Use Cases

A PAI isn't just a personal productivity hack. The same approach would scale for an organisation as an EAI (Enterprise AI Infrastructure):

**Marketing teams** Imagine a new marketing director who inherits years of campaign learnings, competitor analysis, and strategic decisions that are all searchable, and with all context intact. No more institutional knowledge walks out the door; no more "Sorry, the person who knew that left".

**Executive strategic planning** compounds over time. Each planning session builds on the last one as the EAI remembers what you tried, what worked, and what the constraints were.

**Cross-functional knowledge** including product decisions, customer research, and technical architecture are captured by the EAI in a format that survives staff turnover and tool migrations.

**Compliance and audit trails** become straightforward; every decision is documented with full context by the EAI and committed to Git so that when someone asks "Why did we do it that way?", the answer exists and is findable.

**Information Security** is in your control with a local model, as PII or privileged financial data stays within your EAI rather than being parsed by third-parties.

## You Don't Need Enterprise Infrastructure

I built this on Atlas, using my repurposed HP workstation which I use as a Proxmox server.

The same approach would work on:

- A Mac with Homebrew and a folder
- A Windows PC with WSL2 (or even just PowerShell)
- Even a Raspberry Pi, for the truly committed

The filesystem-as-brain principle works anywhere you can run Git and a text editor. The infrastructure I used made certain things easier, but the core idea is platform-agnostic by design.

I prefer open source where possible. [Ollama](https://ollama.ai/){:target="_blank"} for local models, [Fabric](https://github.com/danielmiessler/fabric){:target="_blank"} for prompt patterns, [ZFS](https://openzfs.org/){:target="_blank"} for storage, [Proxmox](https://www.proxmox.com/){:target="_blank"} for virtualisation. But I'm also realistic - Claude and OpenAI have vastly more compute power than my home server. The solution is to use cloud AI for heavy lifting, but keep all knowledge in files I own. Even if the internet goes down, I can still work with a local model.

## The Numbers

I need to be honest here, I invested time and money upfront to get SAI going using top-tier Claude MAX, which is £150/month.

<div class="well">
<strong>28 days from zero to production:</strong>
<ul>
<li><strong>204 commits</strong> tracking evolution of thinking</li>
<li><strong>1,038</strong> ChatGPT conversations migrated and organised</li>
<li><strong>2,595</strong> conversation files standardised to consistent naming</li>
<li><strong>4,469</strong> lines of AI context and instructions across the workspace</li>
<li><strong>233+</strong> AI prompt patterns available via Fabric</li>
<li><strong>3</strong> MCP servers connected (Todoist, Notion, n8n)</li>
<li><strong>£25-75/month</strong> ongoing cost (Claude subscription plus minimal API usage)</li>
</ul>
</div>

## Credit Where It's Due

This is where I owe a huge thank you to [Daniel Miessler](https://danielmiessler.com/){:target="_blank"}, whose PAI concept gave me the foundation for this entire project. What I've built is my implementation of his ideas, adapted to my specific needs and workflow.

If you want the richer, more detailed version his work, this is where to start:

<div class="video-container">
<iframe src="https://www.youtube.com/embed/iKwRWwabkEc" frameborder="0" allowfullscreen></iframe>
</div>

For a gentler introduction, [NetworkChuck's AI in Terminal video](https://www.youtube.com/watch?v=MsQACpcuTkU){:target="_blank"} gets you running in an afternoon - though you'll need coffee (don't worry, he'll remind you), because Chuck's energy level is... a lot. Daniel's approach is more powerful and comprehensive, but Chuck's is more accessible if you're not sure where to begin.

**Inspiration:**
- [Daniel Miessler](https://danielmiessler.com/){:target="_blank"} - PAI concept and Fabric
- [NetworkChuck](https://networkchuck.com/){:target="_blank"} - Accessible AI terminal intro

**Tools I used:**
- [Claude Code](https://claude.ai/code){:target="_blank"} - Primary AI interface
- [Gemini CLI](https://github.com/google-gemini/gemini-cli){:target="_blank"} - Research and web search
- [Fabric](https://github.com/danielmiessler/fabric){:target="_blank"} - AI prompt patterns
- [Ollama](https://ollama.ai/){:target="_blank"} - Local AI models
- [Proxmox](https://www.proxmox.com/){:target="_blank"} - Virtualisation platform
- [ZFS](https://openzfs.org/){:target="_blank"} - Storage filesystem

## What's Next

The system is working. The knowledge compounds. If any of these tools disappear tomorrow, my thinking stays with me in files I own, on storage I control, backed up in ways I chose.

But the current setup requires me to be at my desk, SSH'd into my AI workstation. That's fine for deep work, but limiting for quick queries on the move. Mobile SSH clients exist, but they're fiddly - connections drop, typing on a phone keyboard is painful, and complex commands become error-prone.

I'm building an integration with n8n and Slack to enable mobile access (thanks again to [NetworkChuck for the inspiration](https://youtu.be/E-1_J2S-2pQ){:target="_blank"}).

The goal is a Slack bot that can reach SAI, run queries, keep conversation threads organised, and move files back and forth. This would be more connection-robust and less typo-prone than my current mobile solution Termux, which disconnected three times while I was working through this post on the train.

## Would I Recommend PAI?

If you're happy with throwaway AI conversations and don't mind re-establishing context each session, the PAI approach is probably overkill. If you're not comfortable with command-line tools and Git, the learning curve might not be worth it.

But if you find yourself frustrated by context loss - if you've ever thought "I figured this out before, why am I explaining it again" - this approach is worth exploring.

For a organisation, the EAI approach could be transformational. Institutional knowledge that survives staff turnover. Strategic context that compounds instead of resetting. AI assistants that actually understand your history, constraints, and decisions. The infrastructure investment is modest; the returns compound indefinitely.

Start with Daniel Miessler's work. Watch the video. Read his writing on [fabric](https://github.com/danielmiessler/fabric){:target="_blank"}. You don't need to build exactly what I built. The principle - filesystem as brain, knowledge in files you control - is what matters.
