# extractable-components.md

Components that are good candidates to extract as reusable Superdesign DraftComponents.

## Navbar
- Source: `src/components/layout/Navbar.jsx`
- Category: layout
- Description: Sticky top navigation + mobile bottom navigation for authenticated users.
- Extractable props: `activeItem` (string, default: "home"), `unreadCount` (number, default: 0), `isAuthenticated` (boolean, default: true)
- Hardcoded: Khoj logo image, labels, icon set, all Tailwind classes.

## Footer
- Source: `src/components/layout/Footer.jsx`
- Category: layout
- Description: Footer with brand mark, platform/company/legal links, and social icons.
- Extractable props: none (static content)
- Hardcoded: all link URLs, stats text, icons, all Tailwind classes.

## ItemCard (implicit pattern in Home feed)
- Source: `src/pages/dashboard/Home.jsx` (listing card markup in the feed map loop)
- Category: basic
- Description: Listing card pattern with image, Found/Lost badge, urgent badge, title/meta, and contact CTA overlay for guests.
- Extractable props: `type`, `urgent`, `title`, `category`, `description`, `location`, `date`, `universityName`, `campusName`, `userName`, `imageUrl`, `isGuest`
- Hardcoded: icon choices, layout, Tailwind classes.

