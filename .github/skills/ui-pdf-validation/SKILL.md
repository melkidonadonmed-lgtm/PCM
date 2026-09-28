---
name: ui-pdf-validation
description: Validates PresCMed UI, responsive behavior, print preview, sharing, and PDF flows. Use for changes affecting React components, CSS, themes, printing, or document generation.
---

Validate the affected PresCMed flow end to end:

1. Run `npm run lint` and `npm run build`.
2. Start `npm run dev` from the repository root and use Playwright against
   `http://localhost:3000`.
3. Use fictitious data only. Never enter real patient or clinician data.
4. Exercise the changed flow at desktop and mobile widths and in light and
   dark themes.
5. Check browser console errors, clipped or overlapping controls, keyboard
   reachability, visible focus, and pt-BR labels.
6. For document changes, inspect `PrintPreview.tsx` and
   `src/utils/pdfGenerator.ts` together. Verify that the A4 document remains
   white with dark text in both themes and that required patient, clinician,
   consent, and legal text stays consistent.
7. Trigger the download/share path when relevant and confirm that generated
   content contains no test secrets or unexpected network transmission.
8. Report the exact views, viewport sizes, themes, and document types checked.

Do not change clinical wording or calculations merely to make a visual check
pass.
