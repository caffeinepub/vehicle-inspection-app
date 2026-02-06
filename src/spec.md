# Specification

## Summary
**Goal:** Add a selectable “Glass Option” field to vehicle inspection reports, storing it in the backend and showing it across inspection views and printable reports.

**Planned changes:**
- Backend: Add a persisted `glassOption : Text` field to vehicle inspection record types and all relevant public/input APIs; ensure submit and query methods store/return it.
- Backend: Add/adjust an upgrade migration to initialize `glassOption` for existing stored inspections with a sensible default (e.g., empty text) so older records remain readable.
- Frontend: Add a required “Glass Option *” dropdown to the New Vehicle Inspection form with the specified six options; include `glassOption` in the submission payload.
- Frontend: Display “Glass Option” in inspection details and the formal printable report view, with an English fallback (e.g., “Not specified”) for older/default records.

**User-visible outcome:** Users can select a required Glass Option when creating an inspection, and then see that value in inspection details and the printable/formal report; older inspections continue to load and show a clear fallback when not specified.
