---
name: clinical-change-safety
description: Applies safety controls to PresCMed medication, dose, protocol, CID, prescription, and legal-text changes. Use before editing or reviewing any clinical behavior or data.
---

Treat clinical changes as safety-critical:

1. Identify the requested rule and its authoritative source before editing.
   Do not infer doses, concentrations, maximums, schedules, contraindications,
   or legal requirements.
2. Map every affected reference across `src/data/`,
   `src/utils/doseCalculator.ts`, protocol `pediatricMedId` links, UI
   summaries, `PrintPreview.tsx`, sharing text, and
   `src/utils/pdfGenerator.ts`.
3. Preserve units explicitly. Check conversions among mg, mg/kg, mL, drops,
   concentration, dose frequency, and maximum dose.
4. Reject silent fallbacks, ambiguous rounding, invalid weights, missing
   concentrations, duplicate medication IDs, and protocol references that do
   not resolve.
5. Preserve pt-BR formatting and the CID consent notice required by
   Resolução CFM nº 1.658/2002 wherever applicable.
6. Run `npm run lint` and `npm run build`, then use `ui-pdf-validation` for
   user-visible or generated-document changes.
7. Request review by `prescmed-clinical-reviewer` and qualified human clinical
   review before treating a changed clinical value as approved.

Never alter clinical logic solely to silence a compiler, lint, build, or UI
error.
