/**
 * Ritsumeikan Admissions AI Prompt Generator
 * Main Application Logic
 */

// ========================================
// Configuration
// ========================================
const CONFIG = {
    sources: {
        handbook: {
            url: 'https://en.ritsumei.ac.jp/e-ug/apply/aohb26.pdf',
            label: 'Admissions Handbook 2026'
        },
        applicationPage: {
            url: 'https://en.ritsumei.ac.jp/e-ug/apply/howto.html/?version=English',
            label: 'Application Procedures'
        }
    }
};

// ========================================
// DOM Elements
// ========================================
const form = document.getElementById('promptForm');
const promptOutput = document.getElementById('promptOutput');
const generatedPrompt = document.getElementById('generatedPrompt');
const copyBtn = document.getElementById('copyBtn');
const editBtn = document.getElementById('editBtn');
const toast = document.getElementById('toast');
const nationalitySelect = document.getElementById('nationality');
const nationalityOther = document.getElementById('nationalityOther');
const categoryError = document.getElementById('categoryError');

// ========================================
// Event Listeners
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Form submission
    form.addEventListener('submit', handleFormSubmit);

    // Copy button
    copyBtn.addEventListener('click', handleCopy);

    // Edit button
    editBtn.addEventListener('click', handleEdit);

    // Nationality "Other" toggle
    nationalitySelect.addEventListener('change', handleNationalityChange);
});

// ========================================
// Event Handlers
// ========================================
function handleFormSubmit(e) {
    e.preventDefault();

    // Validate categories
    const categories = getSelectedCategories();
    if (categories.length === 0) {
        categoryError.classList.remove('hidden');
        return;
    }
    categoryError.classList.add('hidden');

    // Collect form data
    const formData = collectFormData();

    // Generate prompt
    const prompt = generatePrompt(formData);

    // Display prompt
    displayPrompt(prompt);
}

function handleCopy() {
    const promptText = generatedPrompt.textContent;
    
    navigator.clipboard.writeText(promptText)
        .then(() => {
            showToast('Copied to clipboard!');
            copyBtn.innerHTML = '<span class="copy-icon">✓</span> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<span class="copy-icon">📋</span> Copy to Clipboard';
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            showToast('Failed to copy. Please select and copy manually.');
        });
}

function handleEdit() {
    promptOutput.classList.add('hidden');
    form.scrollIntoView({ behavior: 'smooth' });
}

function handleNationalityChange() {
    if (nationalitySelect.value === 'Other') {
        nationalityOther.classList.remove('hidden');
        nationalityOther.required = true;
    } else {
        nationalityOther.classList.add('hidden');
        nationalityOther.required = false;
        nationalityOther.value = '';
    }
}

// ========================================
// Data Collection
// ========================================
function collectFormData() {
    const nationality = nationalitySelect.value === 'Other' 
        ? nationalityOther.value 
        : nationalitySelect.value;

    return {
        program: document.getElementById('program').value,
        nationality: nationality,
        educationStatus: document.getElementById('educationStatus').value,
        educationYears: document.getElementById('educationYears').value,
        categories: getSelectedCategories(),
        specificQuestion: document.getElementById('specificQuestion').value.trim()
    };
}

function getSelectedCategories() {
    const checkboxes = document.querySelectorAll('input[name="category"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// ========================================
// Prompt Generation
// ========================================
function generatePrompt(data) {
    const categoriesText = data.categories.join(', ');
    const questionText = data.specificQuestion || '(No specific question provided - please answer based on the categories above)';

    return `# Question about Ritsumeikan University International Admissions

## Your Role
You are an expert advisor on Ritsumeikan University's international admissions (English-basis programs).
Please follow the rules below strictly when answering.

### Response Rules
1. Base your answers ONLY on the "Official Information Sources" provided below
2. For matters not explicitly stated in the sources, respond with: "This is not explicitly stated in the official information. Please contact the university directly for confirmation."
3. NEVER make assumptions or base answers on general university admission practices
4. Quote specific sections from the sources as evidence, including page numbers or section names
5. Respond in English

---

## Official Information Sources

### Admissions Handbook 2026 (Main Source)
${CONFIG.sources.handbook.url}

### Application Procedures Page
${CONFIG.sources.applicationPage.url}

Please refer to these sources and base your answers on their content.

### ⚠️ If You Cannot Access the Sources
If you cannot access the URLs above or cannot read their content:
1. Tell me: "I cannot access the URL. Please upload the PDF."
2. I will upload the Admissions Handbook PDF
3. Then please answer my question based on the uploaded document

---

## Applicant Information

| Item | Details |
|------|---------|
| Desired Program | ${data.program} |
| Nationality/Country | ${data.nationality} |
| Educational Status | ${data.educationStatus} |
| Years of Education | ${data.educationYears} years |

---

## Question

### Topics of Interest
${categoriesText}

### Specific Question
${questionText}

---

## Response Format

Please structure your response as follows:

### 1. Answer
(Direct answer to the question)

### 2. Evidence
(Quote relevant sections from the official information, including page numbers or section names)

### 3. Additional Notes
(Any related information or points to consider)

### 4. Unclear Points
(If anything cannot be determined from official sources, recommend contacting the university)`;
}

// ========================================
// UI Functions
// ========================================
function displayPrompt(prompt) {
    generatedPrompt.textContent = prompt;
    promptOutput.classList.remove('hidden');
    
    // Smooth scroll to output
    setTimeout(() => {
        promptOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 2000);
}
