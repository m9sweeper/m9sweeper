# Accessibility

- A `<nav>` with `aria-label="breadcrumb"` identifies type of navigation as breadcrumb by screen readers.
- The breadcrumb links are structured using an ordered list `<ol>`.
- The last `<li>` element represents the current page, so it doesn't have to be clickable.
- Separators between links have `aria-hidden=true`. This prevents the screen reader announcement of visual separators.
