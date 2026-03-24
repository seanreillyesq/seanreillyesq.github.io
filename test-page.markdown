---
layout: page
title: "Theme Formatting Test Page"
description: "Complete reference for all available styling and components"
header-img: "img/home-bg.jpg"
header_overlay: true
meta-description: "Test page for Jekyll theme formatting options - not indexed"
robots: "noindex, nofollow"
hidden: true
sitemap: false
permalink: /test-page/
---

This page is a living reference for every formatting option and component available on this site. It is excluded from search engines via the robots meta tag.

## Front Matter Options

| Option | Effect |
|--------|--------|
| `layout: post` | Blog post with date, author, prev/next nav, related cards |
| `layout: page` | Static page (this page) |
| `header-img: "img/photo.jpg"` | Hero banner image |
| `header_overlay: true` | Dark gradient over light header images (used on this page) |
| `hidden: true` | Excluded from navigation and blog roll |
| `robots: "noindex, nofollow"` | Prevents search engine indexing |
| `sitemap: false` | Excluded from sitemap |
| `redirect_from: /old-url/` | 301 redirect from old URL |

---

## Design System

### Colour Tokens

The theme uses CSS custom properties throughout. Reference these in inline styles or custom HTML:

<div class="row g-3 mb-3">
<div class="col-6 col-md-4 col-lg-3"><div style="background-color: var(--color-accent); color: #fff; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.875rem;"><code style="color: #fff;">--color-accent</code><br>#4A7BA7</div></div>
<div class="col-6 col-md-4 col-lg-3"><div style="background-color: var(--color-accent-hover); color: #fff; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.875rem;"><code style="color: #fff;">--color-accent-hover</code><br>#3A6389</div></div>
<div class="col-6 col-md-4 col-lg-3"><div style="background-color: var(--color-text); color: #fff; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.875rem;"><code style="color: #fff;">--color-text</code><br>#2D2D2D</div></div>
<div class="col-6 col-md-4 col-lg-3"><div style="background-color: var(--color-text-muted); color: #fff; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.875rem;"><code style="color: #fff;">--color-text-muted</code><br>#6B7280</div></div>
<div class="col-6 col-md-4 col-lg-3"><div style="background-color: var(--color-surface); padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--color-border); font-size: 0.875rem;"><code>--color-surface</code><br>#FAFAF9</div></div>
<div class="col-6 col-md-4 col-lg-3"><div style="background-color: var(--color-surface-dark); color: #fff; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.875rem;"><code style="color: #fff;">--color-surface-dark</code><br>#1A1A2E</div></div>
<div class="col-6 col-md-4 col-lg-3"><div style="background-color: #fff; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--color-border); font-size: 0.875rem;"><code>--color-border</code><br>#E5E7EB</div></div>
</div>

### Font Stack

| Role | Family | Usage |
|------|--------|-------|
| Headings & UI | Inter (800) | `h1`-`h6`, navbar, buttons, labels |
| Body text | Lora (serif) | Paragraphs, blockquotes |
| Code & labels | JetBrains Mono | `code`, `.font-mono` utility |

<p class="font-mono">This text uses the <code>.font-mono</code> utility class - JetBrains Mono, useful for dates, labels, and technical identifiers.</p>

---

## Typography

### Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

### Text Styles

Regular paragraph text in Lora serif font at 1.125rem.

**Bold text** and *italic text* and ***bold italic text***.

<p class="lead">Lead paragraph - larger intro text for opening statements. Uses .lead class to draw attention to key opening lines.</p>

<p class="text-muted">Muted text - greyed out for secondary information using .text-muted.</p>

<p class="text-center">Centred text using the .text-center Bootstrap utility.</p>

<h2 class="section-heading">Section Heading</h2>

The `.section-heading` class gives a larger, bolder treatment (2rem) with extra top margin. Use for major sections on custom pages.

---

## Alert Boxes

<div class="alert alert-info">
<strong>Info:</strong> Light blue background for general information and tips. Use <code>.alert-info</code>.
</div>

<div class="alert alert-success">
<strong>Success:</strong> Green background for positive outcomes or completed steps. Use <code>.alert-success</code>.
</div>

<div class="alert alert-warning">
<strong>Warning:</strong> Yellow/orange background for cautions and caveats. Use <code>.alert-warning</code>.
</div>

<div class="alert alert-danger">
<strong>Important:</strong> Red background for critical information or errors. Use <code>.alert-danger</code>.
</div>

---

## Blockquotes

> This is a standard blockquote. Styled with a left border in `--color-border` and italic text in `--color-text-muted`.
>
> Multiple paragraphs work within blockquotes.

---

## Code

Inline code: `const greeting = "Hello World";`

Code block with syntax highlighting (Rouge):

```javascript
function calculateTotal(items) {
    return items
        .filter(item => item.active)
        .reduce((sum, item) => sum + item.price, 0);
}
```

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

```bash
# Shell commands
cd /mnt/sai/personal/blog/site
bundle exec jekyll serve
```

Code blocks use `--color-surface` background with `--color-border` outline and `0.5rem` border-radius. Font is JetBrains Mono at 0.875em.

---

## Lists

### Unordered List

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered List

1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

---

## Buttons

### Theme Buttons

<a href="#" class="btn btn-accent">Accent Button</a>
<a href="#" class="btn btn-outline-accent">Outline Accent</a>

### Bootstrap Buttons

<a href="#" class="btn btn-primary">Primary</a>
<a href="#" class="btn btn-success">Success</a>
<a href="#" class="btn btn-info">Info</a>
<a href="#" class="btn btn-warning">Warning</a>
<a href="#" class="btn btn-danger">Danger</a>

### Sizes

<p style="margin-top: 20px;">
<a href="#" class="btn btn-accent btn-lg">Large Button</a>
<a href="#" class="btn btn-accent btn-sm">Small Button</a>
</p>

<a href="#" class="btn btn-primary d-block w-100">Full Width Block Button</a>

All buttons use Inter font, weight 700, with a subtle `scale(1.03)` on hover. The accent colour (`--color-accent`) is the primary brand button.

---

## Cards & Containers

### Card (Bootstrap)

<div class="card card-body">
Standard Bootstrap card body - light background, border, rounded corners. Useful for highlighting content sections within posts.
</div>

<br>

<div class="card card-body p-2">
Compact card with less padding using <code>.p-2</code>.
</div>

### Bio Card

<div class="bio-card">
<p class="font-mono text-uppercase small mb-2" style="letter-spacing: 1.5px; color: var(--color-accent); font-size: 0.6875rem;">Speaker Bio</p>
<p class="mb-0">The <code>.bio-card</code> uses <code>--color-surface</code> background with border and generous padding. Used on the About page for the speaker bio block.</p>
</div>

### Contact Card

<div class="contact-card">
<p class="mb-0">The <code>.contact-card</code> is a white card with a subtle box-shadow. Used to wrap forms or highlighted content that needs to feel elevated.</p>
</div>

### Venture Card

<div class="row g-4 mb-3">
<div class="col-md-6">
<div class="venture-card">
<h3><a href="#">Example Venture</a></h3>
<p class="venture-role">Founder & Director</p>
<p>The <code>.venture-card</code> has border, rounded corners, and lifts on hover (-3px translateY with shadow). The <code>.venture-role</code> label uses JetBrains Mono in accent colour.</p>
</div>
</div>
<div class="col-md-6">
<div class="venture-card">
<h3><a href="#">Second Venture</a></h3>
<p class="venture-role">Advisor</p>
<p>Cards are best used in a grid layout with <code>.row g-4</code> and <code>.col-md-6</code> for a two-column arrangement on desktop.</p>
</div>
</div>
</div>

---

## Timeline

<div class="timeline mb-4">
<div class="timeline-item">
<div class="timeline-year">2024</div>
<ul>
<li>First achievement or milestone</li>
<li>Second achievement with more detail</li>
</ul>
</div>
<div class="timeline-item">
<div class="timeline-year">2023</div>
<ul>
<li>Earlier milestone</li>
</ul>
</div>
<div class="timeline-item">
<div class="timeline-year">2022</div>
<ul>
<li>Starting point</li>
</ul>
</div>
</div>

The timeline uses a vertical line on the left with accent-coloured dots at each year marker. Classes: `.timeline`, `.timeline-item`, `.timeline-year`.

---

## Images

Standard image:

![Example header image](/img/home-bg.jpg)

<p class="caption">Image caption using the .caption class - centred, italicised, and muted. Use for credits or descriptions.</p>

Images within articles are automatically set to `max-width: 100%`. Links wrapping images get a `cursor: zoom-in` on hover.

---

## Video Embed

<div class="video-embed">
<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>
</div>

The `.video-embed` wrapper creates a responsive 16:9 container. The iframe fills it regardless of screen width. Always use this wrapper for YouTube, Vimeo, or any embedded video.

---

## Tables

| Feature | Status | Framework |
|---------|--------|-----------|
| Alert boxes | Available | Bootstrap 5 |
| Buttons | Available | Theme + Bootstrap 5 |
| Code highlighting | Available | Rouge highlighter |
| Cards | Available | Bootstrap 5 + theme variants |
| Timeline | Available | Custom CSS |
| Video embed | Available | Custom CSS |
| Scroll reveal | Available | Custom CSS + JS |

---

## Icons (Font Awesome 6)

The site loads Font Awesome 6.5.2. Use `fa-solid`, `fa-regular`, or `fa-brands` prefixes:

<p>
<i class="fa-solid fa-check" style="color: var(--color-accent);"></i> Solid check
&nbsp;&nbsp;
<i class="fa-solid fa-circle-info" style="color: var(--color-accent);"></i> Info circle
&nbsp;&nbsp;
<i class="fa-solid fa-triangle-exclamation" style="color: var(--color-accent);"></i> Warning
&nbsp;&nbsp;
<i class="fa-solid fa-arrow-right" style="color: var(--color-accent);"></i> Arrow
&nbsp;&nbsp;
<i class="fa-brands fa-github" style="color: var(--color-accent);"></i> GitHub
&nbsp;&nbsp;
<i class="fa-brands fa-linkedin" style="color: var(--color-accent);"></i> LinkedIn
</p>

The footer uses `fa-stack` for circular social icons. For inline use in posts, simple `<i>` tags work fine.

---

## Links

Internal link: [Home page](/)

External link (opens in new tab): <a href="https://github.com" target="_blank">GitHub</a>

Links within article content are automatically underlined. Links outside articles use colour transition on hover. Non-button, non-nav links get a subtle `translateY(-1px)` lift on hover.

---

## Scroll Reveal

<div class="reveal">
<div class="alert alert-info mb-0">
This box uses the <code>.reveal</code> class. It fades in and slides up when it enters the viewport. Opacity 0 to 1, translateY 20px to 0, over 0.6s ease.
</div>
</div>

For staggered reveals (multiple items appearing in sequence), wrap items in `.reveal-stagger` and give each child `.reveal`:

<div class="reveal-stagger">
<div class="reveal">
<div class="card card-body mb-2">First item (0s delay)</div>
</div>
<div class="reveal">
<div class="card card-body mb-2">Second item (0.08s delay)</div>
</div>
<div class="reveal">
<div class="card card-body mb-2">Third item (0.16s delay)</div>
</div>
</div>

Note: Reveal requires the IntersectionObserver JavaScript from the homepage. On standard post/page layouts, the `.reveal` class will apply initial styles but may not animate without the JS. Best used on custom pages that include the observer script.

---

## Form Controls

<div class="contact-card">
<div class="mb-3">
<label class="form-label fw-bold" style="font-family: 'Inter', sans-serif; font-size: 0.875rem;">Text Input</label>
<input type="text" class="form-control" placeholder="Focus to see accent border">
</div>
<div class="mb-3">
<label class="form-label fw-bold" style="font-family: 'Inter', sans-serif; font-size: 0.875rem;">Textarea</label>
<textarea class="form-control" rows="3" placeholder="Resizable textarea with accent focus ring"></textarea>
</div>
<a href="#" class="btn btn-accent">Submit</a>
</div>

Form inputs use the standard Bootstrap `.form-control` class. On focus, they show `--color-accent` border with a subtle blue glow (`rgba(74, 123, 167, 0.25)`).

---

## Grid Layout

<div class="row g-3">
<div class="col-md-6">
<div class="alert alert-info mb-0">Left column (50% on md+)</div>
</div>
<div class="col-md-6">
<div class="alert alert-success mb-0">Right column (50% on md+)</div>
</div>
</div>

<br>

<div class="row g-3">
<div class="col-md-4">
<div class="alert alert-info mb-0">One third</div>
</div>
<div class="col-md-4">
<div class="alert alert-warning mb-0">One third</div>
</div>
<div class="col-md-4">
<div class="alert alert-success mb-0">One third</div>
</div>
</div>

Bootstrap 5 grid with `.row`, `.col-md-*`, and `.g-3` (gap) classes. Columns stack on mobile.

---

## Horizontal Rules

Three different ways to create them:

---

***

___

---

## Badges

<span class="badge bg-secondary">42</span> Badge for counts

<span class="badge bg-secondary">Default</span>
<span class="badge bg-primary">Primary</span>
<span class="badge bg-success">Success</span>
<span class="badge bg-info">Info</span>
<span class="badge bg-warning text-dark">Warning</span>
<span class="badge bg-danger">Danger</span>

---

## Background Highlights

<div class="bg-primary text-white" style="padding: 15px; margin-bottom: 10px; border-radius: 0.5rem;">
Primary background
</div>

<div class="bg-success text-white" style="padding: 15px; margin-bottom: 10px; border-radius: 0.5rem;">
Success background
</div>

<div class="bg-info" style="padding: 15px; margin-bottom: 10px; border-radius: 0.5rem;">
Info background
</div>

<div class="bg-warning" style="padding: 15px; margin-bottom: 10px; border-radius: 0.5rem;">
Warning background
</div>

<div class="bg-danger text-white" style="padding: 15px; margin-bottom: 10px; border-radius: 0.5rem;">
Danger background
</div>

---

## Summary

This theme is built on **Bootstrap 5.3** with a custom design system defined in `theme.css`. The colour palette uses 7 CSS custom properties, typography pairs Inter (headings/UI) with Lora (body), and JetBrains Mono handles code and labels. Custom components include venture cards, bio cards, contact cards, timelines, scroll reveal animations, and responsive video embeds. Icons are Font Awesome 6.
