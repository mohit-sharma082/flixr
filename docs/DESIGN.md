# Flixr — Design System & UI/UX Guidelines

> This document defines the visual language, interaction patterns, component conventions, and underlying UX principles that all Flixr screens must follow. Reference it before building any new page or component.

---

## 1. Core Aesthetic & UX Philosophy

**Cinematic. Dark. Content-first.**

Flixr is a media discovery app. The UI is designed to be practically invisible—acting as a silent guide that showcases content (posters, backdrops, cast photos) without competing with it. Every surface should feel like a premium cinema lobby: rich blacks, carefully placed light, intentional contrast, and empathy for the user's browsing journey.

- **Default theme**: Dark (`bg-black` or `bg-background` in dark mode).
- **Light mode**: Supported but secondary; the dark aesthetic is the target.
- **Content is the hero**: Real imagery takes precedence over decorative illustration; backdrops bleed into UI surfaces.

---

## 2. Color System & Accessibility

Defined via CSS custom properties in `globals.css`. Use semantic tokens to ensure consistency and reduce cognitive load. 

### Semantic Tokens
| Token | Use |
| :--- | :--- |
| `background` | Page/surface base |
| `foreground` | Primary text |
| `muted-foreground` | Secondary/hint text |
| `primary` | Interactive accents, active states |
| `border` | Dividers, card outlines |
| `card` | Elevated surfaces |

### Rating Colors (Non-themeable)
To maintain immediate visual recognition, rating colors are hardcoded:
- **Great (≥ 7.5)**: `text-green-400 / bg-green-500/20`
- **OK (≥ 6.0)**: `text-yellow-400 / bg-yellow-500/20`
- **Below average (< 6.0)**: `text-red-400 / bg-red-500/20`

### Glass, Overlays, & Legibility
Use stacked patterns for overlay content on images. **Crucial A11y Rule:** Always ensure sufficient text contrast. If a dynamically loaded TMDB backdrop is excessively bright (e.g., a snowy landscape), ensure the overlay opacity is high enough to keep text readable.

```css
bg-background/30 backdrop-blur-sm          /* Panel floating on backdrop */
bg-black/40                                /* Base image veil (increase if image is very bright) */
bg-gradient-to-t from-background to-transparent  /* Bottom fade into surface */
bg-gradient-to-r from-black via-black/80 to-black/60  /* Side fade for readability */

```

---

## 3. Typography & Visual Hierarchy

Hierarchy tells the user what to look at first, second, and third.
**Font stack**: `Plus Jakarta Sans` (body) and `JetBrains Mono` (code/data).

| Role | Classes | UX Purpose |
| --- | --- | --- |
| **Hero title** | `text-3xl md:text-5xl font-bold` | Primary focus; Movie/show name |
| **Section header** | `text-2xl font-semibold` | Structural divider for lists/tabs |
| **Card title** | `text-sm md:text-base font-medium` | Digestible naming in dense grids |
| **Metadata** | `text-xs text-muted-foreground` | De-emphasized details (date, language) |
| **Label** | `text-sm font-medium` | Form instructions, small headings |

**Rules:**

* Headings use sentence case (no forced `uppercase`).
* Restrict card titles to `line-clamp-2` (cards) or `line-clamp-3` (wider contexts) to maintain grid alignment.
* Stat/number displays use `font-bold` or `font-extrabold` with a matching color token.

---

## 4. Spacing, Layout & Touch Targets

The law of proximity dictates that related items should share localized space.

### Standard Rhythms

```jsx
// Standard horizontal page padding
className='px-4 sm:px-6 lg:px-8'

// Standard section vertical rhythm
className='py-6'  // Between distinct sections
className='py-8'  // Inside content containers

```

### Grid & Scroll Patterns

```jsx
// Detail page main/sidebar split (2:1 Main + Sidebar)
'grid grid-cols-1 md:grid-cols-3 gap-8'

// Horizontal Scroll Carousels
'flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory'

```

* **UX Empathy Rule**: Always add a trailing spacer (`<div className='w-8 shrink-0' />`) to horizontal carousels so the final item doesn't clip against the screen edge.
* **Touch Target Minimum**: Any interactive element (buttons, small filter badges, links) must have a minimum clickable area of **44x44px** for mobile accessibility.

---

## 5. Component Conventions

### Cards

Cards are semi-transparent to inherit the ambient color of the backdrop behind them.

```jsx
// Standard interaction card
'bg-background/30 border border-white/10 hover:border-white/20 rounded-xl backdrop-blur-sm transition-all duration-300'

```

* **Constraint:** Never use heavy drop shadows (`shadow-2xl`) on transparent glass cards; reserve shadows strictly for opaque posters that need to float.

### Buttons & Badges

* **Icon buttons**: `rounded-full` + `size='icon'`.
* **Ghost buttons**: `bg-black/50 backdrop-blur-sm border-none text-white hover:bg-black/70`.
* **Genre tags**: `variant='outline' bg-black/30 text-white border-none`.

### Avatars

* **Cast/Crew**: Square `rounded-md` avatars to match the poster aesthetic.
* **User/Profile**: Round `rounded-full` with gradient background.

---

## 6. Image Usage & Performance

All images come from TMDB. Loading UI is a critical part of the user experience.

| Context | TMDB Size | Loading Strategy |
| --- | --- | --- |
| Hero backdrop | `original` | `priority` (Above the fold) |
| Poster (detail hero) | `w500` | `priority` (Above the fold) |
| Poster (grid card) | `w342` | `loading='lazy'` (Below the fold) |
| Poster (thumbnail) | `w185` | `loading='lazy'` |
| Season still | `w1280` | `loading='lazy'` |

* **Error Handling:** Never render a broken `<img>` tag if `poster_path` is null. Always provide an `<AvatarFallback>` equivalent.
* **Next.js Optimization:** Always specify `sizes` on the `<Image>` component for proper responsive delivery.

---

## 7. Motion & Animation

Flixr uses subtle, purposeful motion triggered by user intent (e.g., hovering).

| Interaction | Duration | Example Pattern |
| --- | --- | --- |
| Hover scale / color | `duration-200` | `group-hover:w-24 transition-all duration-200` |
| Slide/fade reveal | `duration-300` | `opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0` |
| Background transition | `duration-500–700` | Smooth fade when swapping full-bleed hero images |

* **Constraint:** Never use CSS animations for data loading—use skeleton screens (`animate-pulse`) that mimic the exact shape of the incoming content.

---

## 8. Page Archetypes

* **Home Page:** Full-bleed `HeroCarousel` top, alternating horizontal `NumberedList` and 3-col `CompactList` below.
* **Detail Page:** Fixed backdrop (`-z-10`), hero overlay with gradient fade, lazy-loaded tab layout (Overview, Cast, Media, Watch), and a 1/3 width sidebar.
* **Season Detail Page:** Three-column independent scroll layout (`lg` breakpoint): Season Info | Episodes List | Episode Details.
* **Profile Page:** Cinematic hero banner with stats, rating distribution sidebar, and dark glass review cards.
* **Auth Pages:** Minimal, centered form. No backdrop imagery to let the UI breathe.

---

## 9. Responsive Breakpoints & Mobile Validation

Follow standard Tailwind defaults (`sm: 640px`, `md: 768px`, `lg: 1024px`).

* **Golden Rule:** Mobile-first always. Never hide structural content on mobile—simplify the layout or adapt the interaction model instead. Stack grids vertically, collapse sidebars into bottom sheets or standard lists, and ensure horizontal carousels remain swipable.

---

## 10. Do's and Don'ts

### Do

* **Use real imagery** as the primary UI decoration.
* **Animate on hover** to reveal secondary metadata without cluttering the initial view.
* **Implement skeleton screens** that accurately match the geometry of the loading data.
* **Test mobile layouts rigorously** to ensure core features (discovery, rating) aren't compromised on smaller viewports.
* **Include trailing spacers** in horizontal scroll rows.

### Don't

* **Use white backgrounds** on dark pages, breaking the cinematic feel.
* **Apply heavy drop shadows** to glass elements.
* **Render broken image tags**.
* **Use decorative animations** that don't serve a functional purpose or provide interaction feedback.
* **Forget `sizes**` on Next.js `<Image>` components.
* **Make touch targets smaller than 44x44px** on mobile devices.

```