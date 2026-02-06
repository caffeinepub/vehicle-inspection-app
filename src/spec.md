# Specification

## Summary
**Goal:** Let inspectors capture vehicle inspection photos directly in-app using the device camera, with configurable camera settings that persist for future use.

**Planned changes:**
- Add a “Use Camera” action in the “New Vehicle Inspection” form Photos section alongside the existing file upload.
- Implement a camera capture modal with live preview, permission handling, capture action, and proper camera stream cleanup on close.
- Add camera settings in the capture modal: switch camera (device selection when available, otherwise front/back facingMode fallback) and a photo quality/resolution option with at least two levels.
- Persist selected camera and quality settings to localStorage and restore them when reopening the capture modal.
- Convert captured images into bytes and wrap them as `ExternalBlob`, adding them to the existing `photos: ExternalBlob[]` state so they render and behave like uploaded photos (including remove UI) and work end-to-end on submission.

**User-visible outcome:** In the New Vehicle Inspection form, the user can open an in-app camera, adjust camera/quality settings, capture photos into the same photo grid as uploads, and submit inspections with those captured photos.
