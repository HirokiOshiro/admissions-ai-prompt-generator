# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Dark mode support
- Searchable nationality dropdown
- Additional accessibility improvements

## [1.5.0] - 2026-02-04

### Added
- **Conditional School Details section** for improved eligibility assessment
  - Appears when selecting high school or non-traditional educational status
  - **School Type** selector: Regular high school, International school, Vocational/Technical, Online/Distance, Other
  - **Qualification/Certification** multi-select: IB Diploma, A-Level, International accreditation (WASC, CIS, ACSI), National accreditation, High school equivalency (GED, 高卒認定)
- **"Other (non-traditional pathway)"** option for Educational Status
  - Captures students with high school equivalency certificates, GED, etc.
- Generated prompts now include school type and qualifications in Applicant Information table
  - Enables AI to assess eligibility more accurately based on specific credentials

### Changed
- Educational Status option "Other (e.g., withdrawn, transferred)" renamed to "Other (non-traditional pathway)"
- LocalStorage now saves and restores school type and qualifications

### Improved
- Eligibility assessment accuracy by capturing school type and international accreditation status
- User experience with clear conditional UI that only appears when relevant
- Data collection for international school students and non-traditional education pathways

### Technical
- Added `handleEducationStatusChange()` function for conditional section visibility
- Added `getSelectedQualifications()` function for multi-select checkbox handling
- Added `buildEducationDetailsRows()` function for dynamic prompt generation
- Updated `collectFormData()`, `saveFormData()`, `loadSavedData()`, and `resetStep1()` functions
- New CSS styles for `.conditional-section` and `.qualification-checkboxes`

## [1.4.0] - 2026-02-03

### Added
- **Source Access Status section** (Section 0) in generated prompts
  - AI must report access status for each source before answering
  - Uses ✅/❌ indicators to clearly show what was accessible
  - Prevents AI from answering without actually reading sources
- **Alternative search keywords** for each source in generated prompts
  - Helps AI find documents via web search if direct URL fails
  - Related page URLs provided as fallback
- **Staged fallback instructions** for source access
  - Step 1: Direct URL access
  - Step 2: Web search for document title
  - Step 3: Domain-specific search (en.ritsumei.ac.jp)
  - Step 4: Clear reporting of inaccessible sources

### Changed
- **Response Rules strengthened** to prevent hallucination
  - Added explicit requirement to actually access and read documents
  - Prohibited answering based on general knowledge or assumptions
  - Required exact page numbers and section titles for citations
  - Added "I could not verify this" fallback language
- **buildSourcesSection() output format** now includes:
  - URL with bold label
  - Alternative search query suggestion
  - Related page link (for main sources)
- **"If You Cannot Access" section** redesigned with multi-step approach
  - Encourages alternative access methods before asking for upload
  - Explicit warning against pretending to have read inaccessible documents

### Improved
- AI response accuracy by forcing explicit source verification
- User confidence through transparent access status reporting
- Compatibility with AI tools that have limited PDF reading capability (e.g., Microsoft Copilot)

### Technical
- Modified `generatePrompt()` function with enhanced instructions
- Refactored `buildSourcesSection()` to output structured source entries
- Added honesty-enforcement language throughout prompt template

## [1.3.2] - 2026-01-31

### Changed
- **Privacy badge redesigned** for clearer, more reassuring messaging
  - Badge text: "Simple & Safe" (previously "Your data stays in your browser")
  - Tooltip title: "About This Prompt Generator" (focuses on tool functionality)
  - Removed technical jargon (LocalStorage, server, etc.) that could cause anxiety
  - New positive messaging: "Create AI prompts easily — no registration required"
  - Emphasis on convenience rather than data concerns

### Improved
- User trust through tool-focused explanation instead of privacy-focused warnings
- International user clarity with simpler English expressions

## [1.3.1] - 2026-01-31

### Added
- **Collapsible User Guide** after header explaining how to use the tool
- **Privacy & Data notice** (collapsible) explaining LocalStorage usage and data privacy
- **Version and last updated date** display in footer
- Step-by-step usage instructions with 4-step workflow explanation

### Changed
- Footer redesigned with three sections: main info, privacy accordion, and version meta
- Improved transparency about data handling for user trust

### Technical
- Added `<details>` accordion components for collapsible sections
- New CSS animations for accordion content (slideDown)
- Privacy content styles with nested list formatting

## [1.3.0] - 2026-01-31

### Added
- **Country/Region separation**: Split "Nationality" into "Country/Region of Citizenship" and "Country/Region of Residence"
- **International sensitivity**: Added Hong Kong (SAR), Macau (SAR), alphabetical sorting
- **Reset buttons** for Step 1 (Your Info) and Step 2 (Question) sections
- **Information Sources section** (Step 3) with customizable URLs
- Ability to edit default source URLs (Handbook, Application Page)
- Ability to add unlimited additional information sources
- "Reset to Default" button to restore original source URLs
- Progress bar expanded to 4 steps (Your Info → Question → Sources → Result)
- LocalStorage persistence for custom information sources

### Changed
- Progress indicator now shows 4 steps instead of 3
- Generated prompt dynamically includes all configured sources
- Section headers now include reset/clear buttons

### Technical
- Refactored CONFIG to support dynamic sources
- Added source management functions (add, remove, save, load)
- Enhanced prompt generation to build sources section dynamically

## [1.2.0] - 2026-01-31

### Added
- Category cards with icons replacing checkbox list
- Visual card selection with hover and checked states
- AI service quick-launch buttons (ChatGPT, Claude, Gemini)
- Fade-in animations for form sections and cards
- LocalStorage auto-save for form data persistence
- Form data restoration on page reload
- ARIA attributes for improved accessibility

### Changed
- Categories now display as a responsive grid of cards
- Each category has a unique emoji icon for visual identification
- AI service links transformed into branded buttons
- Improved responsive design for mobile devices

### Technical
- Added debounced auto-save functionality
- CSS animations with staggered delays for cards
- Enhanced semantic HTML structure

## [1.1.0] - 2026-01-31

### Added
- Progress bar indicator showing current step (1/2/3)
- Progress tracking based on form focus
- Floating copy button positioned at top-right of prompt output
- Enhanced copy feedback with button color change and checkmark

### Changed
- Improved focus styles for better accessibility
- Copy button now shows "✓ Copied!" state with visual feedback

### Technical
- Added progress bar state management in JavaScript
- Enhanced CSS for progress indicators and floating button

## [1.0.0] - 2026-01-31

### Added
- Initial release of the AI Prompt Generator
- Form input for applicant information
  - Desired program selection
  - Nationality / country of residence
  - Current educational status
  - Total years of education
- Question category selection (10 categories)
  - Program overview
  - Eligibility requirements
  - Required documents
  - English proficiency requirements
  - Application procedures and deadlines
  - Selection process
  - Tuition and fees
  - Scholarships
  - Visa
  - Other
- Specific question text area (optional)
- Prompt generation with structured format
- One-click copy to clipboard functionality
- Toast notification on successful copy
- Responsive design for mobile devices
- English UI and English prompt output
- Usage guide with AI service links
- Disclaimer and contact information

### Technical
- Static site (HTML/CSS/JavaScript)
- No external dependencies
- GitHub Pages compatible
