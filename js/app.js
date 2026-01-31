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
    },
    storageKey: 'ritsumei_prompt_generator_data'
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

// Progress bar elements
const progressSteps = document.querySelectorAll('.progress-step');
const progressLines = document.querySelectorAll('.progress-line');

// ========================================
// Event Listeners
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Load saved data
    loadSavedData();

    // Form submission
    form.addEventListener('submit', handleFormSubmit);

    // Copy button
    copyBtn.addEventListener('click', handleCopy);

    // Edit button
    editBtn.addEventListener('click', handleEdit);

    // Nationality "Other" toggle
    nationalitySelect.addEventListener('change', handleNationalityChange);

    // Track form section focus for progress bar
    trackFormProgress();

    // Auto-save on input changes
    setupAutoSave();
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

    // Update progress to step 3 (completed)
    updateProgress(3);
}

function handleCopy() {
    const promptText = generatedPrompt.textContent;
    
    navigator.clipboard.writeText(promptText)
        .then(() => {
            // Enhanced feedback
            copyBtn.classList.add('copied');
            copyBtn.innerHTML = '<span class="copy-icon">✓</span><span class="copy-text">Copied!</span>';
            showToast('Copied to clipboard!');
            
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.innerHTML = '<span class="copy-icon">📋</span><span class="copy-text">Copy</span>';
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            showToast('Failed to copy. Please select and copy manually.');
        });
}

function handleEdit() {
    promptOutput.classList.add('hidden');
    // Reset progress to step 1
    updateProgress(1);
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

// ========================================
// Progress Bar Functions
// ========================================
function updateProgress(step) {
    progressSteps.forEach((stepEl, index) => {
        const stepNum = index + 1;
        
        if (stepNum < step) {
            // Completed steps
            stepEl.classList.remove('active');
            stepEl.classList.add('completed');
        } else if (stepNum === step) {
            // Current step
            stepEl.classList.add('active');
            stepEl.classList.remove('completed');
        } else {
            // Future steps
            stepEl.classList.remove('active', 'completed');
        }
    });

    // Update progress lines
    progressLines.forEach((line, index) => {
        if (index < step - 1) {
            line.classList.add('active');
        } else {
            line.classList.remove('active');
        }
    });
}

function trackFormProgress() {
    // Step 1 fields
    const step1Fields = ['program', 'nationality', 'educationStatus', 'educationYears'];
    // Step 2 fields
    const step2Container = document.querySelector('.form-section:nth-of-type(2)');

    step1Fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('focus', () => updateProgress(1));
        }
    });

    if (step2Container) {
        step2Container.addEventListener('focusin', () => updateProgress(2));
    }

    // Category checkboxes
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => updateProgress(2));
    });

    // Specific question textarea
    const specificQuestion = document.getElementById('specificQuestion');
    if (specificQuestion) {
        specificQuestion.addEventListener('focus', () => updateProgress(2));
    }
}

// ========================================
// LocalStorage Functions
// ========================================
function saveFormData() {
    try {
        const data = {
            program: document.getElementById('program').value,
            nationality: nationalitySelect.value,
            nationalityOther: nationalityOther.value,
            educationStatus: document.getElementById('educationStatus').value,
            educationYears: document.getElementById('educationYears').value,
            categories: getSelectedCategories(),
            specificQuestion: document.getElementById('specificQuestion').value,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
}

function loadSavedData() {
    try {
        const savedData = localStorage.getItem(CONFIG.storageKey);
        if (!savedData) return;

        const data = JSON.parse(savedData);
        
        // Restore form fields
        if (data.program) {
            document.getElementById('program').value = data.program;
        }
        if (data.nationality) {
            nationalitySelect.value = data.nationality;
            if (data.nationality === 'Other') {
                nationalityOther.classList.remove('hidden');
                nationalityOther.required = true;
                if (data.nationalityOther) {
                    nationalityOther.value = data.nationalityOther;
                }
            }
        }
        if (data.educationStatus) {
            document.getElementById('educationStatus').value = data.educationStatus;
        }
        if (data.educationYears) {
            document.getElementById('educationYears').value = data.educationYears;
        }
        if (data.categories && data.categories.length > 0) {
            data.categories.forEach(category => {
                const checkbox = document.querySelector(`input[name="category"][value="${category}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
        if (data.specificQuestion) {
            document.getElementById('specificQuestion').value = data.specificQuestion;
        }

        // Show subtle notification that data was restored
        if (data.savedAt) {
            console.log('Form data restored from:', new Date(data.savedAt).toLocaleString());
        }
    } catch (e) {
        console.warn('Could not load from localStorage:', e);
    }
}

function setupAutoSave() {
    // Debounce function to avoid too frequent saves
    let saveTimeout;
    const debouncedSave = () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveFormData, 500);
    };

    // Add listeners to all form inputs
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('change', debouncedSave);
        input.addEventListener('input', debouncedSave);
    });
}

function clearSavedData() {
    try {
        localStorage.removeItem(CONFIG.storageKey);
    } catch (e) {
        console.warn('Could not clear localStorage:', e);
    }
}
