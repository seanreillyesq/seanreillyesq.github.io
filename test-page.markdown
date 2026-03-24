---
layout: page
title: "Theme Test Page"
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

> This is a standard markdown blockquote. Styled with a left border in `--color-border` and italic text in `--color-text-muted`.
>
> Multiple paragraphs work within blockquotes.

Bootstrap 5's `.blockquote` with `.blockquote-footer` adds proper attribution:

<figure>
<blockquote class="blockquote">
<p>The best time to plant a tree was 20 years ago. The second best time is now.</p>
</blockquote>
<figcaption class="blockquote-footer">Chinese proverb, as cited in <cite>every LinkedIn post ever</cite></figcaption>
</figure>

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

Inline image with `img-fluid`:

<img src="/img/sean-reilly-sq.jpg" alt="Example image" class="img-fluid" style="max-height: 300px;">

<p class="caption">Image caption using the theme's .caption class - centred, italicised, and muted.</p>

### Figure (Bootstrap 5)

The semantic `<figure>` element with `.figure-caption` is the proper BS5 way to pair images with captions:

<figure class="figure">
<img src="/img/sean-reilly-sq.jpg" alt="Example figure" class="figure-img img-fluid rounded shadow-sm" style="max-height: 250px;">
<figcaption class="figure-caption text-center">Bootstrap 5 figure with <code>.rounded</code> and <code>.shadow-sm</code> utilities.</figcaption>
</figure>

Standard markdown image syntax also works but renders full-width, which can be overwhelming for large header images. For inline images in posts, prefer `<img>` with `img-fluid` and an explicit `max-height`.

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
| Accordion | Available | Bootstrap 5 JS |
| Tabs & pills | Available | Bootstrap 5 JS |
| Modal | Available | Bootstrap 5 JS |
| Tooltips | Available | Bootstrap 5 JS + Popper |
| Offcanvas | Available | Bootstrap 5 JS |
| Progress bars | Available | Bootstrap 5 |
| Spinners | Available | Bootstrap 5 |
| Toasts | Available | Bootstrap 5 JS |
| Carousel | Available | Bootstrap 5 JS |
| Dropdowns | Available | Bootstrap 5 JS + Popper |
| Popovers | Available | Bootstrap 5 JS + Popper |

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

Scroll down to see these elements fade in. The `.reveal` class starts elements at opacity 0 with a 20px downward offset, then animates to visible when they enter the viewport.

<div class="reveal">
<div class="alert alert-info mb-0">
This box uses the <code>.reveal</code> class. It fades in and slides up (opacity 0 to 1, translateY 20px to 0, over 0.6s ease).
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

Note: Reveal requires an IntersectionObserver script. The homepage includes this automatically. For other pages, add the script below or include it in your layout.

<script>
document.addEventListener('DOMContentLoaded', function() {
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(function(el) {
        observer.observe(el);
    });
});
</script>

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

## Border Accent Callouts

A lighter alternative to full alert boxes. Combine `border-start`, `border-4`, and a colour class with left padding:

<div class="border-start border-4 border-primary ps-3 mb-3">
<strong>Pro tip:</strong> This pattern works well for editorial asides and tips without the heavy background colour of an alert.
</div>

<div class="border-start border-4 border-warning ps-3 mb-3">
<strong>Note:</strong> Warning-coloured variant for caveats that don't need the full alert treatment.
</div>

<div class="border-start border-4 border-success ps-3 mb-3">
<strong>Result:</strong> Success variant for positive outcomes or recommendations.
</div>

---

## List Group

Use `.list-group` for structured lists like key takeaways or checklists. `.list-group-flush` removes outer borders:

<ul class="list-group list-group-flush mb-3">
<li class="list-group-item"><i class="fa-solid fa-check" style="color: var(--color-accent);"></i>&nbsp; First key takeaway from this post</li>
<li class="list-group-item"><i class="fa-solid fa-check" style="color: var(--color-accent);"></i>&nbsp; Second point to remember</li>
<li class="list-group-item"><i class="fa-solid fa-check" style="color: var(--color-accent);"></i>&nbsp; Third and final takeaway</li>
</ul>

With colour variants:

<ul class="list-group mb-3">
<li class="list-group-item list-group-item-success">Success item</li>
<li class="list-group-item list-group-item-info">Info item</li>
<li class="list-group-item list-group-item-warning">Warning item</li>
<li class="list-group-item list-group-item-danger">Danger item</li>
</ul>

---

## List Utilities

### Unstyled List

<ul class="list-unstyled">
<li>No bullets on this list</li>
<li>Clean and minimal</li>
<li>Use <code>.list-unstyled</code></li>
</ul>

### Inline List

<ul class="list-inline">
<li class="list-inline-item"><span class="badge bg-secondary">SEO</span></li>
<li class="list-inline-item"><span class="badge bg-secondary">PPC</span></li>
<li class="list-inline-item"><span class="badge bg-secondary">Analytics</span></li>
<li class="list-inline-item"><span class="badge bg-secondary">CRO</span></li>
<li class="list-inline-item"><span class="badge bg-secondary">Email</span></li>
</ul>

Use `.list-inline` with `.list-inline-item` for horizontal tag lists, skill badges, or category labels.

---

## Flexbox Utilities

### Icon + Label Pairs

<div class="d-flex align-items-center gap-3 mb-3">
<div class="d-flex align-items-center gap-2"><i class="fa-solid fa-clock" style="color: var(--color-accent);"></i> <span>5 min read</span></div>
<div class="d-flex align-items-center gap-2"><i class="fa-solid fa-calendar" style="color: var(--color-accent);"></i> <span>24 Mar 2026</span></div>
<div class="d-flex align-items-center gap-2"><i class="fa-solid fa-tag" style="color: var(--color-accent);"></i> <span>Technical SEO</span></div>
</div>

Use `.d-flex`, `.align-items-center`, and `.gap-*` for inline metadata rows and icon+text pairs.

### Stat Row

<div class="d-flex justify-content-around text-center py-3 mb-3" style="background-color: var(--color-surface); border-radius: 0.5rem;">
<div><div class="fw-bold fs-3">18+</div><small class="text-muted">Years experience</small></div>
<div><div class="fw-bold fs-3">9</div><small class="text-muted">Brands</small></div>
<div><div class="fw-bold fs-3">5</div><small class="text-muted">TLDs</small></div>
</div>

---

## Responsive Visibility

Use `.d-none` and `.d-{breakpoint}-block` to show/hide content by screen size:

<div class="d-none d-md-block">
<div class="alert alert-info mb-0">This is only visible on <strong>medium screens and above</strong> (768px+). Hidden on mobile.</div>
</div>

<div class="d-md-none">
<div class="alert alert-warning mb-0">This is only visible on <strong>mobile</strong> (below 768px). Hidden on desktop.</div>
</div>

Useful for showing simplified content on mobile and detailed tables or diagrams on desktop.

---

## Text Utilities

<p class="text-truncate" style="max-width: 300px;">This is a very long URL or text that will be truncated with an ellipsis when it overflows its container: https://www.seanreilly.net/some-very-long-slug-that-goes-on-forever-20260324</p>

Use `.text-truncate` with a max-width constraint to prevent long URLs or text from breaking layouts.

<p><small class="text-muted">The <code>&lt;small&gt;</code> tag with <code>.text-muted</code> for fine print, disclaimers, or secondary notes.</small></p>

---

## Ratio (Native BS5 Embed)

Bootstrap 5's `.ratio` class provides responsive aspect ratio containers. The theme's `.video-embed` does the same thing for videos, but `.ratio` works for any embedded content:

<div class="ratio ratio-16x9 mb-3" style="max-width: 400px; background-color: var(--color-surface); border: 1px solid var(--color-border); border-radius: 0.5rem;">
<div class="d-flex align-items-center justify-content-center text-muted">
16:9 ratio container
</div>
</div>

Available ratios: `.ratio-1x1`, `.ratio-4x3`, `.ratio-16x9`, `.ratio-21x9`.

---

## Shadows

<div class="row g-3 mb-3">
<div class="col-md-4">
<div class="p-3 bg-white rounded shadow-sm text-center"><code>.shadow-sm</code><br>Subtle</div>
</div>
<div class="col-md-4">
<div class="p-3 bg-white rounded shadow text-center"><code>.shadow</code><br>Regular</div>
</div>
<div class="col-md-4">
<div class="p-3 bg-white rounded shadow-lg text-center"><code>.shadow-lg</code><br>Large</div>
</div>
</div>

Use `.shadow-sm` on images and cards to lift them off the page. Avoid `.shadow-lg` in most cases - it's heavy.

---

## Accordion

Collapsible content panels - useful for FAQs, step-by-step instructions, or hiding supplementary detail. Use `.accordion-flush` to remove the outer borders:

<div class="accordion accordion-flush mb-3" id="accordionExample">
<div class="accordion-item">
<h2 class="accordion-header">
<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">First section (open by default)</button>
</h2>
<div id="collapseOne" class="accordion-collapse collapse show" data-bs-parent="#accordionExample">
<div class="accordion-body">This panel is open by default because of the <code>.show</code> class. Only one panel opens at a time when using <code>data-bs-parent</code>.</div>
</div>
</div>
<div class="accordion-item">
<h2 class="accordion-header">
<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">Second section</button>
</h2>
<div id="collapseTwo" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
<div class="accordion-body">Each item needs a unique <code>id</code> on the collapse div and a matching <code>data-bs-target</code> on the button. The <code>data-bs-parent</code> attribute ensures only one stays open.</div>
</div>
</div>
<div class="accordion-item">
<h2 class="accordion-header">
<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">Third section</button>
</h2>
<div id="collapseThree" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
<div class="accordion-body">Remove <code>data-bs-parent</code> if you want multiple panels open simultaneously. Add <code>.accordion-flush</code> to the wrapper to remove the outer border and rounded corners.</div>
</div>
</div>
</div>

---

## Tabs

Tabbed content panels for showing alternatives, language variants, or categorised information side by side:

<ul class="nav nav-tabs mb-0" id="exampleTabs" role="tablist">
<li class="nav-item" role="presentation">
<button class="nav-link active" id="overview-tab" data-bs-toggle="tab" data-bs-target="#overview-pane" type="button" role="tab" aria-controls="overview-pane" aria-selected="true">Overview</button>
</li>
<li class="nav-item" role="presentation">
<button class="nav-link" id="details-tab" data-bs-toggle="tab" data-bs-target="#details-pane" type="button" role="tab" aria-controls="details-pane" aria-selected="false">Details</button>
</li>
<li class="nav-item" role="presentation">
<button class="nav-link" id="code-tab" data-bs-toggle="tab" data-bs-target="#code-pane" type="button" role="tab" aria-controls="code-pane" aria-selected="false">Code</button>
</li>
</ul>
<div class="tab-content border border-top-0 rounded-bottom p-3 mb-3">
<div class="tab-pane fade show active" id="overview-pane" role="tabpanel" aria-labelledby="overview-tab">
<p class="mb-0">First tab content. Tabs are useful for showing the same concept from different angles - e.g. a feature overview, technical details, and code examples.</p>
</div>
<div class="tab-pane fade" id="details-pane" role="tabpanel" aria-labelledby="details-tab">
<p class="mb-0">Second tab content. Each pane needs a unique <code>id</code> matching the button's <code>data-bs-target</code>. Use <code>.fade</code> for smooth transitions.</p>
</div>
<div class="tab-pane fade" id="code-pane" role="tabpanel" aria-labelledby="code-tab">
<p class="mb-0">Third tab content. You can put any HTML inside a tab pane - code blocks, images, tables, even nested components.</p>
</div>
</div>

For pill-style tabs, replace `.nav-tabs` with `.nav-pills`:

<ul class="nav nav-pills mb-3" id="pillTabs" role="tablist">
<li class="nav-item" role="presentation">
<button class="nav-link active" id="pill-one-tab" data-bs-toggle="pill" data-bs-target="#pill-one" type="button" role="tab" aria-selected="true">Option A</button>
</li>
<li class="nav-item" role="presentation">
<button class="nav-link" id="pill-two-tab" data-bs-toggle="pill" data-bs-target="#pill-two" type="button" role="tab" aria-selected="false">Option B</button>
</li>
</ul>
<div class="tab-content mb-3">
<div class="tab-pane fade show active" id="pill-one" role="tabpanel" aria-labelledby="pill-one-tab">
<div class="alert alert-info mb-0">Pill tabs have rounded backgrounds instead of underlined tabs. Good for toggling between views or modes.</div>
</div>
<div class="tab-pane fade" id="pill-two" role="tabpanel" aria-labelledby="pill-two-tab">
<div class="alert alert-success mb-0">Second pill content. Pills work exactly the same way as tabs - just a different visual style.</div>
</div>
</div>

---

## Modal

A dialog overlay for confirmations, detail views, or any content that needs focused attention. Click the button to open:

<button type="button" class="btn btn-accent" data-bs-toggle="modal" data-bs-target="#exampleModal">Open Modal</button>

<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
<div class="modal-dialog">
<div class="modal-content">
<div class="modal-header">
<h5 class="modal-title" id="exampleModalLabel">Example Modal</h5>
<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
</div>
<div class="modal-body">
Modal body content goes here. You can include any HTML - text, forms, images, even other components. The backdrop darkens the page behind to draw focus.
</div>
<div class="modal-footer">
<button type="button" class="btn btn-outline-accent" data-bs-dismiss="modal">Close</button>
<button type="button" class="btn btn-accent">Save changes</button>
</div>
</div>
</div>
</div>

For a larger modal, add `.modal-lg` or `.modal-xl` to `.modal-dialog`. For centred positioning, add `.modal-dialog-centered`.

---

## Tooltips

Hover over these elements to see tooltips. Useful for abbreviations, icon-only buttons, or supplementary context:

<p>
<button type="button" class="btn btn-accent btn-sm" data-bs-toggle="tooltip" data-bs-placement="top" title="Tooltip on top">Top</button>
<button type="button" class="btn btn-accent btn-sm" data-bs-toggle="tooltip" data-bs-placement="right" title="Tooltip on right">Right</button>
<button type="button" class="btn btn-accent btn-sm" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Tooltip on bottom">Bottom</button>
<button type="button" class="btn btn-accent btn-sm" data-bs-toggle="tooltip" data-bs-placement="left" title="Tooltip on left">Left</button>
</p>

Inline example: <abbr data-bs-toggle="tooltip" title="Search Engine Optimisation">SEO</abbr> is a core discipline. Hover the abbreviation to see the tooltip.

<script>
document.addEventListener('DOMContentLoaded', function() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(el) { return new bootstrap.Tooltip(el); });
});
</script>

Tooltips require JavaScript initialisation (see the script above). Use `data-bs-placement` to control direction. Works on any element with `data-bs-toggle="tooltip"` and a `title` attribute.

---

## Offcanvas

A slide-out panel from the edge of the screen. Useful for supplementary content, filters, or navigation that shouldn't take up permanent space:

<button class="btn btn-accent" type="button" data-bs-toggle="offcanvas" data-bs-target="#exampleOffcanvas" aria-controls="exampleOffcanvas">Open Offcanvas</button>

<div class="offcanvas offcanvas-end" tabindex="-1" id="exampleOffcanvas" aria-labelledby="offcanvasLabel">
<div class="offcanvas-header">
<h5 class="offcanvas-title" id="offcanvasLabel">Offcanvas Panel</h5>
<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
</div>
<div class="offcanvas-body">
<p>This panel slides in from the right. You can put any content here - navigation links, filter controls, supplementary information.</p>
<p>Use <code>.offcanvas-start</code> (left), <code>.offcanvas-end</code> (right), <code>.offcanvas-top</code>, or <code>.offcanvas-bottom</code> to control direction.</p>
<p>The backdrop behind darkens the page. Add <code>data-bs-scroll="true"</code> to the offcanvas element to allow background scrolling.</p>
</div>
</div>

---

## Progress Bars

Visual progress indicators. Useful for completion status, skill levels, or loading states:

<div class="mb-2">
<label class="form-label small fw-bold" style="font-family: 'Inter', sans-serif;">25% - Default</label>
<div class="progress" role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
<div class="progress-bar" style="width: 25%">25%</div>
</div>
</div>
<div class="mb-2">
<label class="form-label small fw-bold" style="font-family: 'Inter', sans-serif;">50% - Success</label>
<div class="progress" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
<div class="progress-bar bg-success" style="width: 50%">50%</div>
</div>
</div>
<div class="mb-2">
<label class="form-label small fw-bold" style="font-family: 'Inter', sans-serif;">75% - Striped</label>
<div class="progress" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
<div class="progress-bar progress-bar-striped" style="width: 75%">75%</div>
</div>
</div>
<div class="mb-3">
<label class="form-label small fw-bold" style="font-family: 'Inter', sans-serif;">90% - Animated</label>
<div class="progress" role="progressbar" aria-valuenow="90" aria-valuemin="0" aria-valuemax="100">
<div class="progress-bar progress-bar-striped progress-bar-animated bg-warning" style="width: 90%">90%</div>
</div>
</div>

Variants: `.bg-success`, `.bg-info`, `.bg-warning`, `.bg-danger`. Add `.progress-bar-striped` for stripes and `.progress-bar-animated` for animation.

---

## Spinners

Loading indicators for async content or processing states:

<p>
<span class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></span>
<span class="spinner-border text-secondary" role="status"><span class="visually-hidden">Loading...</span></span>
<span class="spinner-border text-success" role="status"><span class="visually-hidden">Loading...</span></span>
<span class="spinner-grow text-danger" role="status"><span class="visually-hidden">Loading...</span></span>
<span class="spinner-grow text-warning" role="status"><span class="visually-hidden">Loading...</span></span>
<span class="spinner-grow text-info" role="status"><span class="visually-hidden">Loading...</span></span>
</p>

Small spinner inside a button:

<button class="btn btn-accent" type="button" disabled>
<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
<span role="status">Saving...</span>
</button>

Two styles: `.spinner-border` (circular) and `.spinner-grow` (pulsing). Use `.spinner-border-sm` or `.spinner-grow-sm` for smaller variants inside buttons or inline text.

---

## Toasts

Lightweight notifications for transient messages. Click to trigger:

<button type="button" class="btn btn-accent" id="showToastBtn">Show Toast</button>

<div class="toast-container position-fixed bottom-0 end-0 p-3">
<div id="exampleToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
<div class="toast-header">
<i class="fa-solid fa-circle-info me-2" style="color: var(--color-accent);"></i>
<strong class="me-auto">Notification</strong>
<small class="text-muted">just now</small>
<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
</div>
<div class="toast-body">
This is a toast notification. It auto-dismisses after 5 seconds. Position with <code>.toast-container</code> utilities (bottom-right shown here).
</div>
</div>
</div>

<script>
document.getElementById('showToastBtn').addEventListener('click', function() {
    var toast = new bootstrap.Toast(document.getElementById('exampleToast'));
    toast.show();
});
</script>

Toasts are positioned with `.position-fixed` and directional utilities. They auto-hide by default (5 seconds). Add `data-bs-autohide="false"` to make them persistent.

---

## Carousel

An image/content slideshow. Use sparingly - carousels have poor engagement rates, but they work for before/after comparisons or portfolio pieces:

<div id="exampleCarousel" class="carousel slide mb-3" data-bs-ride="false" style="max-width: 600px;">
<div class="carousel-indicators">
<button type="button" data-bs-target="#exampleCarousel" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
<button type="button" data-bs-target="#exampleCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
<button type="button" data-bs-target="#exampleCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
</div>
<div class="carousel-inner rounded">
<div class="carousel-item active">
<div class="d-flex align-items-center justify-content-center" style="height: 250px; background-color: var(--color-accent); color: #fff;">
<div class="text-center"><h4>Slide One</h4><p class="mb-0">First slide content</p></div>
</div>
</div>
<div class="carousel-item">
<div class="d-flex align-items-center justify-content-center" style="height: 250px; background-color: var(--color-surface-dark); color: #fff;">
<div class="text-center"><h4>Slide Two</h4><p class="mb-0">Second slide content</p></div>
</div>
</div>
<div class="carousel-item">
<div class="d-flex align-items-center justify-content-center" style="height: 250px; background-color: var(--color-text); color: #fff;">
<div class="text-center"><h4>Slide Three</h4><p class="mb-0">Third slide content</p></div>
</div>
</div>
</div>
<button class="carousel-control-prev" type="button" data-bs-target="#exampleCarousel" data-bs-slide="prev">
<span class="carousel-control-prev-icon" aria-hidden="true"></span>
<span class="visually-hidden">Previous</span>
</button>
<button class="carousel-control-next" type="button" data-bs-target="#exampleCarousel" data-bs-slide="next">
<span class="carousel-control-next-icon" aria-hidden="true"></span>
<span class="visually-hidden">Next</span>
</button>
</div>

Set `data-bs-ride="carousel"` for auto-play, or `"false"` for manual only. Add `data-bs-interval="3000"` to control timing. The carousel above is manual-only.

---

## Dropdowns

Toggleable context menus for actions or navigation. Work on buttons or links:

<div class="d-flex gap-2 mb-3">
<div class="dropdown">
<button class="btn btn-accent dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Actions</button>
<ul class="dropdown-menu">
<li><a class="dropdown-item" href="#">Edit</a></li>
<li><a class="dropdown-item" href="#">Duplicate</a></li>
<li><hr class="dropdown-divider"></li>
<li><a class="dropdown-item text-danger" href="#">Delete</a></li>
</ul>
</div>
<div class="dropdown">
<button class="btn btn-outline-accent dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">With Header</button>
<ul class="dropdown-menu">
<li><h6 class="dropdown-header">Categories</h6></li>
<li><a class="dropdown-item" href="#">SEO</a></li>
<li><a class="dropdown-item" href="#">Analytics</a></li>
<li><a class="dropdown-item" href="#">Development</a></li>
</ul>
</div>
</div>

Use `.dropdown-divider` for separators and `.dropdown-header` for section labels. Add `.dropup`, `.dropend`, or `.dropstart` to the wrapper to change direction.

---

## Popovers

Richer than tooltips - popovers can contain a title and HTML body content. Click the buttons to toggle:

<p>
<button type="button" class="btn btn-accent btn-sm" data-bs-toggle="popover" data-bs-title="Popover Title" data-bs-content="This is the popover body. It can contain longer text than a tooltip and has a distinct title area." data-bs-trigger="click">Click Popover</button>
<button type="button" class="btn btn-outline-accent btn-sm" data-bs-toggle="popover" data-bs-title="Hover Popover" data-bs-content="This one appears on hover and disappears when you move away." data-bs-trigger="hover focus">Hover Popover</button>
</p>

<script>
document.addEventListener('DOMContentLoaded', function() {
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(el) { return new bootstrap.Popover(el); });
});
</script>

Like tooltips, popovers require JS initialisation. Use `data-bs-trigger` to control behaviour: `click`, `hover`, `focus`, or combinations.

---

## Summary

This theme is built on **Bootstrap 5.3** with a custom design system defined in `theme.css`. The colour palette uses 7 CSS custom properties, typography pairs Inter (headings/UI) with Lora (body), and JetBrains Mono handles code and labels. Custom components include venture cards, bio cards, contact cards, timelines, scroll reveal animations, and responsive video embeds. Bootstrap 5 utilities (flexbox, visibility, shadows, ratios, list groups) and interactive JS components (accordion, tabs, modals, tooltips, popovers, offcanvas, toasts, carousel, dropdowns, progress bars, spinners) are all available. Icons are Font Awesome 6.
