# Rajib Digital Centre

## GitHub Pages

Extract the ZIP. To apply this update over RDC_Profile_Progress_Update, upload `index.html`, `rdc-ui.css` and `rdc-motion.js` to the folder served by GitHub Pages and commit them together. Keep the CSS and JavaScript next to index.html. For a complete copy, the archive also includes the login page and the printing folder. Keep the domain settings and Firebase configuration from your existing repository. If the repository has newer edits, merge the changes into those files before publishing.

## What changed

- Customer and administrator profile pages include a circular photo, an email verification badge, editable display name and phone, account activity, and a saved-profile checklist. Profile completeness is the share of name, phone, and photo saved to the account.
- Customer request progress summarizes their own requests across all statuses. The status filter affects the list below the summary.
- Admin Analytics shows the share of requests in the selected period whose current status is Completed. The report counts requests by creation date in India time. The last-seven-days chart shows requests received per day.
- An SVG ring and percentage use the same animated value. The rings respect reduced motion and distinguish a zero completion rate from an empty data set.

## Animation credits

- Animated Number behavior adapted from [Skiper UI](https://skiper-ui.com/v1/skiper37) into native JavaScript for the existing static site.
- Original profile reveals and pointer highlights inspired by public [Animmaster Lib](https://animmasterlib.dev/) previews. The paid component source is not included.

## Verification

JavaScript and markup checks passed. Automated tests with mocked dashboard elements and account data covered progress values, empty periods, reduced motion, profile saving, and photo removal. The local browser preview could not load in this session. Visual rendering and a live Firebase sign-in were not verified here.

## Skiper UI redesign

For this release upload the following six files together, beside the existing index.html in the published folder: index.html, login.html, rdc-ui.css, rdc-motion.js, rdc-redesign.css, and skiper-components.js. Keep your domain and favicon files in place. A complete copy also includes the existing printing folder.

The navigation and login links use [Text Roll Navigation](https://skiper-ui.com/v1/skiper58). Primary links and service cards use ArrowIcon, and the Admin navigation toggle uses MenuIcon, both from [Animated Icons 002](https://skiper-ui.com/v1/skiper99). These are ports of the published Skiper UI component source to the site's HTML, CSS and JavaScript. The Animmaster Lib redesign components remain pending access to their paid source files.
