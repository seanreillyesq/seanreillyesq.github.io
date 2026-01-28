---
layout: page
title: "Theme Formatting Test Page"
description: "Demonstrating all available formatting options"
header-img: "img/home-bg.jpg"
meta-description: "Test page for Jekyll theme formatting options - not indexed"
robots: "noindex, nofollow"
hidden: true
permalink: /test-page/
---

This page demonstrates all formatting options available in the Clean Blog Jekyll theme. It is excluded from search engines via the robots meta tag.

## Front Matter Options

This page uses these front matter options:

- `hidden: true` - Excluded from navigation and blog roll
- `robots: "noindex, nofollow"` - Prevents search engine indexing

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

Regular paragraph text in Lora serif font at 20px.

**Bold text** and *italic text* and ***bold italic text***.

<p class="lead">Lead paragraph - larger intro text for opening statements. Uses a slightly larger font size to draw attention.</p>

<p class="text-muted">Muted text - greyed out for secondary information.</p>

<p class="text-center">Centred text using Bootstrap class.</p>

---

## Alert Boxes

<div class="alert alert-info">
<strong>Info:</strong> Light blue background for general information and tips.
</div>

<div class="alert alert-success">
<strong>Success:</strong> Green background for positive outcomes, recommendations, or completed steps.
</div>

<div class="alert alert-warning">
<strong>Warning:</strong> Yellow/orange background for cautions and things to watch out for.
</div>

<div class="alert alert-danger">
<strong>Important:</strong> Red background for critical information or errors.
</div>

---

## Blockquotes

> This is a standard blockquote. It renders in grey italic text with a left border.
>
> Multiple paragraphs work within blockquotes.

---

## Code

Inline code: `const greeting = "Hello World";`

Code block with syntax highlighting:

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

<a href="#" class="btn btn-default">Default Button</a>
<a href="#" class="btn btn-primary">Primary Button</a>

<a href="#" class="btn btn-success">Success</a>
<a href="#" class="btn btn-info">Info</a>
<a href="#" class="btn btn-warning">Warning</a>
<a href="#" class="btn btn-danger">Danger</a>

<p style="margin-top: 20px;">
<a href="#" class="btn btn-default btn-lg">Large Button</a>
<a href="#" class="btn btn-default btn-sm">Small Button</a>
</p>

<a href="#" class="btn btn-primary btn-block">Full Width Block Button</a>

---

## Background Highlights

<div class="bg-primary" style="padding: 15px; margin-bottom: 10px; color: white;">
Primary background (dark blue)
</div>

<div class="bg-success" style="padding: 15px; margin-bottom: 10px;">
Success background (green)
</div>

<div class="bg-info" style="padding: 15px; margin-bottom: 10px;">
Info background (light blue)
</div>

<div class="bg-warning" style="padding: 15px; margin-bottom: 10px;">
Warning background (yellow)
</div>

<div class="bg-danger" style="padding: 15px; margin-bottom: 10px;">
Danger background (red)
</div>

---

## Images

Standard image:

![Example header image](/img/home-bg.jpg)

<p class="caption">Image caption using the .caption class - centred and italicised.</p>

---

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Alert boxes | Available | Bootstrap 3 |
| Buttons | Available | Multiple styles |
| Code highlighting | Available | Rouge highlighter |
| Custom layouts | Not available | Single post template |

---

## Links

Internal link: [Home page](/)

External link (opens in new tab): <a href="https://github.com" target="_blank">GitHub</a>

---

## Horizontal Rules

Three different ways to create them:

---

***

___

---

## Badges and Labels

<span class="badge">42</span> Badge for counts

<span class="label label-default">Default</span>
<span class="label label-primary">Primary</span>
<span class="label label-success">Success</span>
<span class="label label-info">Info</span>
<span class="label label-warning">Warning</span>
<span class="label label-danger">Danger</span>

---

## Grid Layout Example

<div class="row">
<div class="col-md-6">
<div class="alert alert-info">Left column (50% on medium+ screens)</div>
</div>
<div class="col-md-6">
<div class="alert alert-success">Right column (50% on medium+ screens)</div>
</div>
</div>

---

## Wells

<div class="well">
This is a well - a simple container with a light grey background and rounded borders. Useful for highlighting content sections.
</div>

<div class="well well-sm">
Small well with less padding.
</div>

---

## Summary

This page demonstrates the formatting options available without any theme modifications. Most features come from Bootstrap 3, which is included in the Clean Blog theme.
