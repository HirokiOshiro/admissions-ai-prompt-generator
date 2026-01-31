# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned for v1.2.0
- Category cards with icons
- AI service link buttons
- LocalStorage for form data persistence

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
