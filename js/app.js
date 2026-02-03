/**
 * Ritsumeikan Admissions AI Prompt Generator
 * Main Application Logic
 */

// ========================================
// Configuration
// ========================================
const CONFIG = {
    defaultSources: {
        handbook: {
            url: 'https://en.ritsumei.ac.jp/e-ug/apply/aohb26.pdf',
            label: 'Admissions Handbook'
        },
        applicationPage: {
            url: 'https://en.ritsumei.ac.jp/e-ug/apply/howto.html/?version=English',
            label: 'Application Procedures'
        }
    },
    storageKey: 'ritsumei_prompt_generator_data',
    sourcesStorageKey: 'ritsumei_prompt_generator_sources'
};

// Dynamic sources (will be updated based on user input)
let currentSources = {
    handbook: { ...CONFIG.defaultSources.handbook },
    applicationPage: { ...CONFIG.defaultSources.applicationPage },
    additional: []
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
const countryOfResidenceSelect = document.getElementById('countryOfResidence');
const countryOfResidenceOther = document.getElementById('countryOfResidenceOther');
const categoryError = document.getElementById('categoryError');

// Progress bar elements
const progressSteps = document.querySelectorAll('.progress-step');
const progressLines = document.querySelectorAll('.progress-line');

// Source elements
const sourceHandbookInput = document.getElementById('sourceHandbook');
const sourceApplicationPageInput = document.getElementById('sourceApplicationPage');
const additionalSourcesContainer = document.getElementById('additionalSourcesContainer');

// Education details elements (conditional)
const educationStatusSelect = document.getElementById('educationStatus');
const schoolDetailsSection = document.getElementById('schoolDetailsSection');
const schoolTypeSelect = document.getElementById('schoolType');

// ========================================
// Event Listeners
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Load saved data
    loadSavedData();
    loadSavedSources();

    // Form submission
    form.addEventListener('submit', handleFormSubmit);

    // Copy button
    copyBtn.addEventListener('click', handleCopy);

    // Edit button
    editBtn.addEventListener('click', handleEdit);

    // Nationality "Other" toggle
    nationalitySelect.addEventListener('change', handleNationalityChange);

    // Country of Residence "Other" toggle
    countryOfResidenceSelect.addEventListener('change', handleCountryOfResidenceChange);

    // Track form section focus for progress bar
    trackFormProgress();

    // Auto-save on input changes
    setupAutoSave();

    // Reset buttons
    document.getElementById('resetStep1Btn').addEventListener('click', resetStep1);
    document.getElementById('resetStep2Btn').addEventListener('click', resetStep2);
    document.getElementById('resetSourcesBtn').addEventListener('click', resetSources);

    // Add source button
    document.getElementById('addSourceBtn').addEventListener('click', addAdditionalSource);

    // Source URL input listeners
    sourceHandbookInput.addEventListener('input', saveSourcesData);
    sourceApplicationPageInput.addEventListener('input', saveSourcesData);

    // Education status change listener (for conditional fields)
    educationStatusSelect.addEventListener('change', handleEducationStatusChange);

    // Initialize conditional section visibility based on saved data
    handleEducationStatusChange();
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

    // Update current sources from inputs
    updateCurrentSources();

    // Collect form data
    const formData = collectFormData();

    // Generate prompt
    const prompt = generatePrompt(formData);

    // Display prompt
    displayPrompt(prompt);

    // Update progress to step 4 (completed)
    updateProgress(4);
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

function handleCountryOfResidenceChange() {
    if (countryOfResidenceSelect.value === 'Other') {
        countryOfResidenceOther.classList.remove('hidden');
        countryOfResidenceOther.required = true;
    } else {
        countryOfResidenceOther.classList.add('hidden');
        countryOfResidenceOther.required = false;
        countryOfResidenceOther.value = '';
    }
}

function handleEducationStatusChange() {
    const status = educationStatusSelect.value;
    const isHighSchool = status.toLowerCase().includes('high school') ||
                         status.toLowerCase().includes('non-traditional');

    if (isHighSchool && status !== '') {
        schoolDetailsSection.classList.remove('hidden');
    } else {
        schoolDetailsSection.classList.add('hidden');
        // Clear values when hidden
        if (schoolTypeSelect) {
            schoolTypeSelect.value = '';
        }
        // Uncheck all qualification checkboxes
        const qualificationCheckboxes = document.querySelectorAll('input[name="qualification"]');
        qualificationCheckboxes.forEach(cb => cb.checked = false);
    }
}

function getSelectedQualifications() {
    const checkboxes = document.querySelectorAll('input[name="qualification"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// ========================================
// Data Collection
// ========================================
function collectFormData() {
    const nationality = nationalitySelect.value === 'Other'
        ? nationalityOther.value
        : nationalitySelect.value;

    const countryOfResidence = countryOfResidenceSelect.value === 'Other'
        ? countryOfResidenceOther.value
        : countryOfResidenceSelect.value;

    const educationStatus = document.getElementById('educationStatus').value;
    const isHighSchoolRelated = educationStatus.toLowerCase().includes('high school') ||
                                educationStatus.toLowerCase().includes('non-traditional');

    return {
        program: document.getElementById('program').value,
        nationality: nationality,
        countryOfResidence: countryOfResidence,
        educationStatus: educationStatus,
        schoolType: isHighSchoolRelated ? (schoolTypeSelect?.value || '') : '',
        qualifications: isHighSchoolRelated ? getSelectedQualifications() : [],
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

    // Build sources section dynamically
    const sourcesSection = buildSourcesSection();

    // Build education details rows (conditional)
    const educationDetailsRows = buildEducationDetailsRows(data);

    return `# Question about Ritsumeikan University International Admissions

## Your Role
You are an expert advisor on Ritsumeikan University's international admissions (English-basis programs).
Please follow the rules below strictly when answering.

### Response Rules
1. Base your answers ONLY on the "Official Information Sources" provided below
2. **CRITICAL: You must actually access and read the source documents.** Do NOT answer based on:
   - Your general knowledge about universities or admissions
   - Assumptions about what the documents might contain
   - Information from other sources not listed below
3. For matters not explicitly stated in the sources, respond with: "This is not explicitly stated in the official information. Please contact the university directly for confirmation."
4. Quote specific sections as evidence with **exact page numbers, section titles, or paragraph references**. Vague citations like "according to the handbook" are NOT acceptable.
5. If you cannot verify information from the actual document, clearly state: "I could not verify this in the source document."
6. Respond in English

---

## Official Information Sources

**⚠️ IMPORTANT: How to Access These Sources**
Use your web browsing or search capability to access these documents. Follow these steps:

1. **First**: Try to directly access the URL and read the content
2. **If direct access fails**: Search the web for the exact URL or document title to find cached/indexed versions
3. **If still unavailable**: Search within the same domain (en.ritsumei.ac.jp) for related official pages
4. **Last resort**: Clearly report which sources you could NOT access

${sourcesSection}

### ⚠️ Honesty About Source Access
**You MUST be honest about what you can and cannot access.**
- If you successfully read a PDF: Quote specific content with page numbers
- If you can only access a web page summary: State this clearly
- If you cannot access a source at all: Do NOT guess its contents

### 🔄 If You Cannot Access the Sources
If you cannot access the URLs above or cannot read their content:
1. **First, try alternative methods:**
   - Search the web for: "Ritsumeikan University Admissions Handbook [current year]"
   - Search within: en.ritsumei.ac.jp site for the relevant information
2. **If still unsuccessful, clearly state:**
   "I cannot access [specific source name]. Please upload the PDF directly."
3. **Never pretend to have read a document you haven't accessed.**

---

## Applicant Information

| Item | Details |
|------|---------|
| Desired Program | ${data.program} |
| Country/Region of Citizenship | ${data.nationality} |
| Country/Region of Residence | ${data.countryOfResidence} |
| Educational Status | ${data.educationStatus} |
${educationDetailsRows}| Years of Education | ${data.educationYears} years |

---

## Question

### Topics of Interest
${categoriesText}

### Specific Question
${questionText}

---

## Response Format

Please structure your response as follows:

### 0. Source Access Status (REQUIRED)
**You MUST start your response with this section.**
For each source listed above, report:
- ✅ **Accessed**: [Source name] - Successfully read the document (specify: full PDF / web page only / cached version)
- ❌ **Not Accessible**: [Source name] - Could not access (briefly state why)

Example:
> ✅ Accessed: Admissions Handbook - Successfully read full PDF (52 pages)
> ❌ Not Accessible: Application Procedures page - URL returned 404 error

**If you could not access the main source (Admissions Handbook), clearly state this and ask for the PDF to be uploaded before proceeding.**

### 1. Answer
(Direct answer to the question - ONLY if you successfully accessed the relevant sources)

### 2. Evidence
(Quote relevant sections with **exact page numbers and section titles**. Example: "Page 12, Section 3.2: 'Applicants must submit...'")

### 3. Additional Notes
(Any related information or points to consider)

### 4. Unclear Points
(If anything cannot be determined from official sources, recommend contacting the university)`;
}

function buildSourcesSection() {
    let sources = [];

    // Add handbook if URL is provided
    if (currentSources.handbook.url) {
        const handbookEntry = `#### ${currentSources.handbook.label} (Main Source)
- **URL**: ${currentSources.handbook.url}
- **Alternative search**: "Ritsumeikan University Admissions Handbook PDF"
- **Related page**: https://en.ritsumei.ac.jp/e-ug/apply/`;
        sources.push(handbookEntry);
    }

    // Add application page if URL is provided
    if (currentSources.applicationPage.url) {
        const appPageEntry = `#### ${currentSources.applicationPage.label}
- **URL**: ${currentSources.applicationPage.url}
- **Alternative search**: "Ritsumeikan University application procedures English"`;
        sources.push(appPageEntry);
    }

    // Add additional sources
    currentSources.additional.forEach((source, index) => {
        if (source.url) {
            const label = source.label || `Additional Source ${index + 1}`;
            const additionalEntry = `#### ${label}
- **URL**: ${source.url}`;
            sources.push(additionalEntry);
        }
    });

    return sources.join('\n\n');
}

function buildEducationDetailsRows(data) {
    let rows = '';

    // Only add these rows if school type or qualifications are provided
    if (data.schoolType) {
        rows += `| Type of School | ${data.schoolType} |\n`;
    }

    if (data.qualifications && data.qualifications.length > 0) {
        const qualText = data.qualifications.join(', ');
        rows += `| Qualification/Certification | ${qualText} |\n`;
    }

    return rows;
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
    const step1Fields = ['program', 'nationality', 'countryOfResidence', 'educationStatus', 'educationYears'];
    // Step 2 fields
    const step2Container = document.querySelector('.form-section:nth-of-type(2)');
    // Step 3 fields (Sources)
    const step3Container = document.querySelector('.form-section:nth-of-type(3)');

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

    // Step 3 (Sources) tracking
    if (step3Container) {
        step3Container.addEventListener('focusin', () => updateProgress(3));
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
            countryOfResidence: countryOfResidenceSelect.value,
            countryOfResidenceOther: countryOfResidenceOther.value,
            educationStatus: document.getElementById('educationStatus').value,
            schoolType: schoolTypeSelect ? schoolTypeSelect.value : '',
            qualifications: getSelectedQualifications(),
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
        if (data.countryOfResidence) {
            countryOfResidenceSelect.value = data.countryOfResidence;
            if (data.countryOfResidence === 'Other') {
                countryOfResidenceOther.classList.remove('hidden');
                countryOfResidenceOther.required = true;
                if (data.countryOfResidenceOther) {
                    countryOfResidenceOther.value = data.countryOfResidenceOther;
                }
            }
        }
        if (data.educationStatus) {
            document.getElementById('educationStatus').value = data.educationStatus;
            // Trigger the conditional section visibility
            handleEducationStatusChange();
        }
        if (data.schoolType && schoolTypeSelect) {
            schoolTypeSelect.value = data.schoolType;
        }
        if (data.qualifications && data.qualifications.length > 0) {
            data.qualifications.forEach(qual => {
                const checkbox = document.querySelector(`input[name="qualification"][value="${qual}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
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

// ========================================
// Reset Functions
// ========================================
function resetStep1() {
    // Reset Step 1 form fields
    document.getElementById('program').value = '';
    nationalitySelect.value = '';
    nationalityOther.value = '';
    nationalityOther.classList.add('hidden');
    nationalityOther.required = false;
    countryOfResidenceSelect.value = '';
    countryOfResidenceOther.value = '';
    countryOfResidenceOther.classList.add('hidden');
    countryOfResidenceOther.required = false;
    document.getElementById('educationStatus').value = '';
    document.getElementById('educationYears').value = '';

    // Reset conditional education fields
    if (schoolTypeSelect) {
        schoolTypeSelect.value = '';
    }
    const qualificationCheckboxes = document.querySelectorAll('input[name="qualification"]');
    qualificationCheckboxes.forEach(cb => cb.checked = false);
    if (schoolDetailsSection) {
        schoolDetailsSection.classList.add('hidden');
    }

    // Clear Step 1 data from localStorage
    try {
        const savedData = localStorage.getItem(CONFIG.storageKey);
        if (savedData) {
            const data = JSON.parse(savedData);
            data.program = '';
            data.nationality = '';
            data.nationalityOther = '';
            data.countryOfResidence = '';
            data.countryOfResidenceOther = '';
            data.educationStatus = '';
            data.schoolType = '';
            data.qualifications = [];
            data.educationYears = '';
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
        }
    } catch (e) {
        console.warn('Could not update localStorage:', e);
    }

    showToast('Step 1 cleared');
    updateProgress(1);
}

function resetStep2() {
    // Reset Step 2 form fields
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    categoryCheckboxes.forEach(cb => cb.checked = false);
    document.getElementById('specificQuestion').value = '';
    categoryError.classList.add('hidden');

    // Clear Step 2 data from localStorage
    try {
        const savedData = localStorage.getItem(CONFIG.storageKey);
        if (savedData) {
            const data = JSON.parse(savedData);
            data.categories = [];
            data.specificQuestion = '';
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
        }
    } catch (e) {
        console.warn('Could not update localStorage:', e);
    }

    showToast('Step 2 cleared');
    updateProgress(2);
}

function resetSources() {
    // Reset to default sources
    sourceHandbookInput.value = CONFIG.defaultSources.handbook.url;
    sourceApplicationPageInput.value = CONFIG.defaultSources.applicationPage.url;
    
    // Clear additional sources
    additionalSourcesContainer.innerHTML = '';
    
    // Reset current sources
    currentSources = {
        handbook: { ...CONFIG.defaultSources.handbook },
        applicationPage: { ...CONFIG.defaultSources.applicationPage },
        additional: []
    };
    
    // Clear sources from localStorage
    try {
        localStorage.removeItem(CONFIG.sourcesStorageKey);
    } catch (e) {
        console.warn('Could not clear sources from localStorage:', e);
    }

    showToast('Sources reset to default');
    updateProgress(3);
}

// ========================================
// Source Management Functions
// ========================================
function updateCurrentSources() {
    // Update from input fields
    currentSources.handbook.url = sourceHandbookInput.value.trim();
    currentSources.applicationPage.url = sourceApplicationPageInput.value.trim();
    
    // Update additional sources from DOM
    currentSources.additional = [];
    const additionalItems = additionalSourcesContainer.querySelectorAll('.additional-source-item');
    additionalItems.forEach(item => {
        const labelInput = item.querySelector('.source-label-input');
        const urlInput = item.querySelector('.source-url-input');
        if (urlInput.value.trim()) {
            currentSources.additional.push({
                label: labelInput.value.trim() || 'Additional Source',
                url: urlInput.value.trim()
            });
        }
    });
}

function addAdditionalSource(label, url) {
    // Handle case when called as event handler (label would be PointerEvent)
    if (label instanceof Event || typeof label !== 'string') {
        label = '';
    }
    if (typeof url !== 'string') {
        url = '';
    }
    
    const sourceId = Date.now();
    const sourceHtml = `
        <div class="additional-source-item" data-source-id="${sourceId}">
            <div class="additional-source-row">
                <input type="text" class="source-label-input" 
                       placeholder="Source name (e.g., FAQ Page)" 
                       value="${label}">
                <button type="button" class="btn-remove-source" onclick="removeAdditionalSource(${sourceId})">
                    🗑️ Remove
                </button>
            </div>
            <div class="additional-source-row">
                <input type="url" class="source-url-input" 
                       placeholder="Enter URL (e.g., https://example.com/faq)" 
                       value="${url}">
            </div>
        </div>
    `;
    
    additionalSourcesContainer.insertAdjacentHTML('beforeend', sourceHtml);
    
    // Add event listeners for auto-save
    const newItem = additionalSourcesContainer.querySelector(`[data-source-id="${sourceId}"]`);
    newItem.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', saveSourcesData);
    });
    
    updateProgress(3);
}

function removeAdditionalSource(sourceId) {
    const item = additionalSourcesContainer.querySelector(`[data-source-id="${sourceId}"]`);
    if (item) {
        item.remove();
        saveSourcesData();
    }
}

function saveSourcesData() {
    try {
        updateCurrentSources();
        localStorage.setItem(CONFIG.sourcesStorageKey, JSON.stringify(currentSources));
    } catch (e) {
        console.warn('Could not save sources to localStorage:', e);
    }
}

function loadSavedSources() {
    try {
        const savedSources = localStorage.getItem(CONFIG.sourcesStorageKey);
        if (!savedSources) return;

        const data = JSON.parse(savedSources);
        
        // Restore handbook URL
        if (data.handbook && data.handbook.url) {
            sourceHandbookInput.value = data.handbook.url;
            currentSources.handbook = data.handbook;
        }
        
        // Restore application page URL
        if (data.applicationPage && data.applicationPage.url) {
            sourceApplicationPageInput.value = data.applicationPage.url;
            currentSources.applicationPage = data.applicationPage;
        }
        
        // Restore additional sources
        if (data.additional && data.additional.length > 0) {
            data.additional.forEach(source => {
                addAdditionalSource(source.label, source.url);
            });
            currentSources.additional = data.additional;
        }
        
        console.log('Sources restored from localStorage');
    } catch (e) {
        console.warn('Could not load sources from localStorage:', e);
    }
}
