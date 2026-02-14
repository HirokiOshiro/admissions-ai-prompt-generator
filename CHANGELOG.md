# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- **Planned**
  - Dark mode support.
  - Searchable nationality dropdown.
  - Additional accessibility improvements.

## [1.5.1] - 2026-02-14

- **Added**
  - Conditional context enrichment fields for ambiguous school/curriculum cases.
  - When `Type of School = Other`, users must provide school official name, school location (country/region + city), and curriculum/program name.
  - When `Qualification/Certification = Not sure / Don't know`, users must provide the same details.
  - Generated prompts now include additional applicant context rows: School Official Name, School Location, Curriculum / Program Name.
- **Changed**
  - Source policy wording updated across UI and prompt template.
  - Official sources remain pre-filled by default, and AI is instructed to use the configured sources (including user-added trusted sources).
  - User Guide and Step 3 description updated to remove misleading "official documents only" wording.
  - Result section step number corrected from `3` to `4` to align with the 4-step progress bar.
- **Improved**
  - Better answer quality for non-standard education pathways by collecting prerequisite curriculum context before prompt generation.
  - Better UX guidance in ambiguous cases through conditional required fields.
- **Technical**
  - Added conditional detail handlers and validation logic in `js/app.js`.
  - Extended LocalStorage save/load/reset scope for new school context fields.
  - Updated `buildEducationDetailsRows()` and `generatePrompt()` for new data/output behavior.

## [1.5.0] - 2026-02-04

- **Added**
  - Conditional School Details section for improved eligibility assessment.
  - Appears when selecting high school or non-traditional educational status.
  - School Type selector: Regular high school, International school, Vocational/Technical, Online/Distance, Other.
  - Qualification/Certification multi-select: IB Diploma, A-Level, International accreditation (WASC, CIS, ACSI), National accreditation, High school equivalency (GED, 高卒認定).
  - "Other (non-traditional pathway)" option for Educational Status to capture GED/equivalency pathways.
  - Generated prompts now include school type and qualifications in the Applicant Information table.
- **Changed**
  - Educational Status option "Other (e.g., withdrawn, transferred)" renamed to "Other (non-traditional pathway)".
  - LocalStorage now saves and restores school type and qualifications.
- **Improved**
  - Eligibility assessment accuracy by capturing school type and international accreditation status.
  - User experience with clear conditional UI that only appears when relevant.
  - Data collection for international school students and non-traditional education pathways.
- **Technical**
  - Added `handleEducationStatusChange()` for conditional section visibility.
  - Added `getSelectedQualifications()` for multi-select checkbox handling.
  - Added `buildEducationDetailsRows()` for dynamic prompt generation.
  - Updated `collectFormData()`, `saveFormData()`, `loadSavedData()`, and `resetStep1()`.
  - Added CSS styles for `.conditional-section` and `.qualification-checkboxes`.

## [1.4.0] - 2026-02-03

- **Added**
  - Source Access Status section (Section 0) in generated prompts.
  - AI must report access status for each source before answering using ✅/❌ indicators.
  - Alternative search keywords for each source when direct URL access fails.
  - Staged fallback instructions for source access.
- **Changed**
  - Response Rules strengthened to prevent hallucination.
  - Added explicit requirement to access and read documents.
  - Prohibited answers based on assumptions or general knowledge.
  - Required exact page numbers and section titles for citations.
  - Added "I could not verify this" fallback language.
  - `buildSourcesSection()` output now includes URL labels, alternative search query, and related links.
  - "If You Cannot Access" section redesigned with multi-step fallback guidance.
- **Improved**
  - AI response accuracy through explicit source verification.
  - User confidence through transparent access status reporting.
  - Compatibility with tools that have limited PDF reading capability (for example, Microsoft Copilot).
- **Technical**
  - Modified `generatePrompt()` with enhanced source-access instructions.
  - Refactored `buildSourcesSection()` to output structured source entries.
  - Added honesty-enforcement language across prompt template sections.

## [1.3.2] - 2026-01-31

- **Changed**
  - Privacy badge redesigned for clearer, more reassuring messaging.
  - Badge text changed to "Simple & Safe" (from "Your data stays in your browser").
  - Tooltip title changed to "About This Prompt Generator".
  - Removed technical jargon (such as LocalStorage and server wording).
  - Added positive messaging: "Create AI prompts easily — no registration required".
- **Improved**
  - User trust through tool-focused explanation instead of privacy-warning emphasis.
  - International user clarity with simpler English expressions.

## [1.3.1] - 2026-01-31

- **Added**
  - Collapsible User Guide under the header.
  - Collapsible Privacy & Data notice.
  - Version and last updated date in the footer.
  - Step-by-step usage instructions with a 4-step workflow.
- **Changed**
  - Footer redesigned into main info, privacy accordion, and version meta sections.
  - Improved transparency about data handling for user trust.
- **Technical**
  - Added `<details>` accordion components.
  - Added CSS slide-down animation for accordion content.
  - Added nested privacy content styles.

## [1.3.0] - 2026-01-31

- **Added**
  - Country/Region separation: split "Nationality" into "Country/Region of Citizenship" and "Country/Region of Residence".
  - International sensitivity updates: Hong Kong (SAR), Macau (SAR), alphabetical sorting.
  - Reset buttons for Step 1 and Step 2.
  - Information Sources section (Step 3) with customizable URLs.
  - Editable default source URLs and unlimited additional sources.
  - "Reset to Default" source button.
  - Progress bar expanded to 4 steps.
  - LocalStorage persistence for source settings.
- **Changed**
  - Progress indicator updated from 3 steps to 4.
  - Generated prompt now dynamically includes configured sources.
  - Section headers now include reset/clear actions.
- **Technical**
  - Refactored `CONFIG` to support dynamic sources.
  - Added source management functions (`add`, `remove`, `save`, `load`).
  - Enhanced prompt generation for dynamic source sections.

## [1.2.0] - 2026-01-31

- **Added**
  - Category cards with icons replacing the checkbox list.
  - Visual card selection with hover and checked states.
  - AI service quick-launch buttons (ChatGPT, Claude, Gemini).
  - Fade-in animations for form sections and cards.
  - LocalStorage auto-save and restore for form data.
  - ARIA attributes for improved accessibility.
- **Changed**
  - Categories displayed as a responsive card grid.
  - Each category uses a dedicated emoji icon.
  - AI links transformed into branded buttons.
  - Improved mobile responsiveness.
- **Technical**
  - Added debounced auto-save functionality.
  - Added staggered CSS animations for cards.
  - Enhanced semantic HTML structure.

## [1.1.0] - 2026-01-31

- **Added**
  - Progress bar indicator showing current step.
  - Progress tracking based on form focus.
  - Floating copy button at the top-right of prompt output.
  - Enhanced copy feedback with color and checkmark state.
- **Changed**
  - Improved focus styles for accessibility.
  - Copy button now shows a "✓ Copied!" visual state.
- **Technical**
  - Added progress bar state management in JavaScript.
  - Enhanced CSS for progress indicators and floating copy button.

## [1.0.0] - 2026-01-31

- **Added**
  - Initial release of the AI Prompt Generator.
  - Applicant information form (program, nationality/residence, educational status, years of education).
  - Question category selection (10 categories).
  - Optional specific-question text area.
  - Structured prompt generation.
  - One-click copy to clipboard and toast feedback.
  - Responsive design for mobile devices.
  - English UI and English prompt output.
  - Usage guide, AI links, disclaimer, and contact information.
- **Technical**
  - Static site architecture (HTML/CSS/JavaScript).
  - No external dependencies.
  - GitHub Pages compatible.
