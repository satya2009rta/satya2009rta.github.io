# Vienna events finder

The planned public entry point is `/vienna-events/`. This addition preserves the existing academic website, its configuration and main-branch Jekyll publishing. `index.html` explicitly disables the parent layout. JavaScript, CSS and JSON use relative paths, so the finder works from a subfolder and from an independent static preview.

The finder uses no server API, Sites token, public write endpoint, secret or GitHub credential. `vienna-events/events.json` is the complete read-only collection. The browser reloads it on opening, reopening or every five minutes while visible. Reload listings reads the saved file and does not run a source search. Saved events remain local to each browser; the public site exposes no visitor shortlist or write controls.

Daily discovery is performed by the existing ChatGPT website-refresh task. After approved publication, its prompt is switched to `update-instructions.json`: research sources, validate a replacement catalogue, update only `vienna-events/events.json` through the authenticated GitHub connector using its current blob SHA, and verify the existing Pages build and deployed JSON. Timing stays 08:00 Europe/Vienna and the Friday roundup is unchanged. Do not claim the GitHub schedule is active before the switch is confirmed.

Files in this `_maintenance` directory are source maintenance material; Jekyll excludes underscore-prefixed directories from ordinary web output.

Run `node _maintenance/vienna-events/check-catalog.mjs` to validate current data. `node _maintenance/vienna-events/validate.mjs` checks the initial migrated dataset and filter regressions. `node --check vienna-events/app.mjs` checks browser syntax.
