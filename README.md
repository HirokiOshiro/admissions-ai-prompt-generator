# Ritsumeikan Admissions AI Prompt Generator

Generate optimized prompts to ask AI about Ritsumeikan University's international admissions.

## 🌐 Live Demo

**https://hirokioshiro.github.io/admissions-ai-prompt-generator/**

## ✨ Features

### Core Features
- **Input your background**: Program, country/region of citizenship, country/region of residence, educational status, years of education
- **Select question categories**: Visual cards with icons for eligibility, documents, English proficiency, scholarships, visa, and more
- **Customize information sources**: Edit default sources or add your own URLs
- **Generate structured prompts**: Optimized for AI tools to provide accurate answers based on official sources
- **One-click copy**: Copy to clipboard and paste into your preferred AI
- **AI service quick-launch**: Direct buttons for ChatGPT, Claude, and Gemini

### User Experience
- **Progress bar**: 4-step visual indicator (Your Info → Question → Sources → Result)
- **Auto-save**: Your inputs are automatically saved and restored
- **Reset buttons**: Clear individual sections or all data
- **Collapsible user guide**: Learn how to use the tool
- **Simple & Safe**: No registration required, form data saved locally for convenience
- **Mobile-friendly**: Responsive design works on any device
- **International sensitivity**: Supports Hong Kong (SAR), Macau (SAR), and separates citizenship from residence

## 📖 How to Use

1. **Step 1 - Your Info**: Fill in your information (desired program, country/region, education background)
2. **Step 2 - Question**: Select what you want to know (multiple categories allowed) and optionally add a specific question
3. **Step 3 - Sources**: Review or customize the official information sources (optional)
4. **Step 4 - Result**: Click **"Generate Prompt"** and copy the result
5. Paste into [ChatGPT](https://chat.openai.com), [Claude](https://claude.ai), or [Gemini](https://gemini.google.com)
6. Review the AI's response based on official information

> 💡 **Tip**: Your inputs are automatically saved in your browser, so you can return later without re-entering your information.

## 📚 Official Information Sources

The generated prompts direct AI to reference these official sources (customizable in Step 3):

### Default Sources
- [Admissions Handbook (PDF)](https://en.ritsumei.ac.jp/e-ug/apply/aohb26.pdf)
- [Application Procedures](https://en.ritsumei.ac.jp/e-ug/apply/howto.html/?version=English)

### Customization
- Edit the default source URLs if newer versions are available
- Add unlimited additional sources (faculty pages, scholarship info, etc.)
- Reset to defaults anytime

## ⚠️ Disclaimer

- AI responses are for **reference only**
- Always verify information with official sources before applying
- For cases requiring individual assessment, contact the university directly

## 🔧 Development

### Local Development

Simply open `index.html` in your browser. No build process required.

```bash
# Clone the repository
git clone https://github.com/[username]/ritsumeikan-admissions-prompt-generator.git

# Open in browser
open index.html
```

### Project Structure

```
├── index.html          # Main HTML (4-step form with progress bar)
├── css/
│   └── style.css       # Styles (1200+ lines, responsive, animations)
├── js/
│   └── app.js          # Application logic (LocalStorage, source management)
├── docs/
│   └── UI_IMPROVEMENT_PLAN.md  # Development roadmap & progress
├── README.md           # This file
└── CHANGELOG.md        # Version history
```

## 📋 Version History

**Current Version: v1.3.2** (January 31, 2026)

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

### Recent Updates
- v1.3.2: Improved privacy badge messaging ("Simple & Safe", tool-focused explanation)
- v1.3.1: User guide, privacy notice, version display
- v1.3.0: Reset buttons, customizable information sources
- v1.2.0: Category cards, AI buttons, LocalStorage
- v1.1.0: Progress bar, floating copy button
- v1.0.0: Initial release

## 📄 License

This project is for Ritsumeikan University's International Admissions Office.

## 📧 Contact

For questions about admissions: [Contact Ritsumeikan University](https://en.ritsumei.ac.jp/e-ug/contact/)
