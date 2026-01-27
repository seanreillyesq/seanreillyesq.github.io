---
author: Sean
comments: true
date: 2023-02-28 10:05:00+00:00
layout: post
title: "How to Disable Caps Lock Notifications in Windows 11"
header-img: img/caps-lock-notification-windows-11.jpg
meta-description: Stop the Caps Lock popup interrupting your games and workflow. Quick fixes for Windows 11 and Dell Peripheral Manager.
categories:
- Blog
- IT
---

Nothing ruins a tense moment in a first-person shooter quite like accidentally hitting Caps Lock and having Windows throw a notification across your screen. This happened to me yesterday, mid-firefight, and I finally snapped and fixed it properly.

If you're here, you probably have the same problem. Here's how to turn it off.

## Windows 11 Settings

This fixes the system-level notification and the toggle key sounds:

1. Open **Settings** (Win + I)
2. Go to **Accessibility** > **Keyboard**
3. Turn off **Toggle keys** (this stops the sounds when you press Caps Lock, Num Lock, or Scroll Lock)

That's it for most people. But if you have a Dell machine, there's another culprit.

## Dell Peripheral Manager

Dell installs its own software that adds a separate Caps Lock indicator. I'd forgotten this was even on my machine until the Windows fix didn't solve the problem.

1. Open **Dell Peripheral Manager** (search for it in Start)
2. Select the **Keyboard** tab
3. Toggle off **Caps Lock Indicator**

If you don't have Dell Peripheral Manager installed, you don't need to worry about this step.

## Why I Keep Finding My Own Blog Post

I've fixed this at least three times now on different machines and after Windows updates. Each time I google it, find this post, and remember I already solved it. If you're future me: hello. If you're someone else with the same problem: hope this helped.
