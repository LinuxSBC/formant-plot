Formant Plot — Modernization notes

What I changed
- Replaced multiple/old jQuery includes with a single modern jQuery (3.6.4) from CDN and added jQuery Migrate 3.4.1 to surface deprecated API usage.
- Ensured scripts use `defer` where appropriate and removed obsolete `type` attributes from script/link tags.
- Kept local `jquery-ui-1.14.2` assets and Raphaël as they exist in the repository.

Why
- Using one modern jQuery reduces conflicts. jQuery Migrate helps find deprecated calls so they can be fixed incrementally.

Testing locally
1. Start a static server from the project root:

    ```bash
    python3 -m http.server 8000
    ```

2. Open http://localhost:8000 in a browser.

3. Open the developer console and look for jQuery Migrate warnings. Address any deprecated API usages reported.

Rollback
- If anything breaks, you can restore the old files from version control. The original older jQuery files (if present) can be moved into a `vendor/legacy/` folder for safekeeping.

Next steps (recommended)
- Run the app in a browser, open the console, and fix any deprecated API usage flagged by jQuery Migrate (e.g., replace `.bind()` with `.on()`).
- Optionally remove jQuery Migrate after all warnings are resolved.

