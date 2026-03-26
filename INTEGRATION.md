# Permit Client Intake ↔ Permit Manager Integration

## Overview
When a client submits the intake form, a permit entry is automatically created in the Permit Manager tool. Both apps share `localStorage` on the same GitHub Pages domain (`ashersoutherncities-art.github.io`), enabling seamless data flow without a backend.

## How It Works

```
Client fills form → Submit →
  1. PDF generated (existing)
  2. Budget calculated (existing)
  3. createPermitEntry() called → writes to localStorage key "permit-manager-data"
  4. SuccessPage shows reference ID + "Project added to permit queue"

Permit Manager loads → reads "permit-manager-data" from localStorage →
  Shows intake-sourced projects in "Potential" tab with:
  - "📝 Client Intake" badge
  - Reference ID (SCE-INT-xxx)
  - Client contact info (email, phone)
  - Scope of work and budget estimate
```

## Reference IDs
- Format: `SCE-INT-{timestamp36}-{random4}` (e.g., `SCE-INT-M5K2X9-AB3F`)
- Generated at submission time
- Stored in permit entry as `_intakeRef`
- Displayed on both SuccessPage and Permit Manager cards

## Data Mapping

| Intake Form Field | Permit Manager Field |
|---|---|
| firstName + lastName | Project name (+ address) |
| propertyAddress + city/state/zip | address |
| projectType (New Build/Renovation/Site Improvements) | type (mapped to New Construction/Renovation/Commercial Buildout) |
| budget.total | value |
| permitElectrical/Mechanical/HVAC | permits[] array |
| scopeOfWork | _scopeOfWork (metadata) |
| email, phone | _clientEmail, _clientPhone (metadata) |

## Project Status Flow
1. **Potential** (default) — Submitted via intake, awaiting review
2. **Active** — Approved by team, permits being processed
3. **Declined** — Project not proceeding (with reason)

## localStorage Keys
- `permit-submissions` — Raw intake form submissions (intake form's own storage)
- `permit-manager-data` — Shared project data (both apps read/write)

## Live URLs
- Intake Form: https://ashersoutherncities-art.github.io/permit-client-intake/
- Permit Manager: https://ashersoutherncities-art.github.io/permit-manager/
