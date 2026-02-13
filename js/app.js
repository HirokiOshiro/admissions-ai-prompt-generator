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
const programError = document.getElementById('programError');
const educationYearsError = document.getElementById('educationYearsError');

const educationYearsOtherWrapper = document.getElementById('educationYearsOtherWrapper');
const educationYearsOtherInput = document.getElementById('educationYearsOther');

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
const schoolTypeOtherDetailsSection = document.getElementById('schoolTypeOtherDetails');
const qualificationUnknownDetailsSection = document.getElementById('qualificationUnknownDetails');

const schoolOfficialNameInput = document.getElementById('schoolOfficialName');
const schoolLocationCountryInput = document.getElementById('schoolLocationCountry');
const schoolLocationCityInput = document.getElementById('schoolLocationCity');
const curriculumNameInput = document.getElementById('curriculumName');

const qualificationUnknownSchoolNameInput = document.getElementById('qualificationUnknownSchoolName');
const qualificationUnknownLocationCountryInput = document.getElementById('qualificationUnknownLocationCountry');
const qualificationUnknownLocationCityInput = document.getElementById('qualificationUnknownLocationCity');
const qualificationUnknownCurriculumInput = document.getElementById('qualificationUnknownCurriculum');

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

    if (schoolTypeSelect) {
        schoolTypeSelect.addEventListener('change', updateSchoolConditionalDetails);
    }

    const qualificationCheckboxes = document.querySelectorAll('input[name="qualification"]');
    qualificationCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateSchoolConditionalDetails);
    });

    // Education years choice change listener
    const educationYearsOptions = document.querySelectorAll('input[name="educationYearsChoice"]');
    educationYearsOptions.forEach(option => {
        option.addEventListener('change', handleEducationYearsChoiceChange);
    });

    // Initialize conditional section visibility based on saved data
    handleEducationStatusChange();
    handleEducationYearsChoiceChange();
});

// ========================================
// Event Handlers
// ========================================
function handleFormSubmit(e) {
    e.preventDefault();

    // Validate programs
    const programs = getSelectedPrograms();
    if (programs.length === 0) {
        programError.classList.remove('hidden');
        updateProgress(1);
        return;
    }
    programError.classList.add('hidden');

    // Validate education years (Other requires details)
    const educationYearsChoice = getEducationYearsChoice();
    if (!educationYearsChoice) {
        educationYearsError.classList.remove('hidden');
        updateProgress(1);
        return;
    }
    educationYearsError.classList.add('hidden');

    if (educationYearsChoice === 'Other' && !educationYearsOtherInput.value.trim()) {
        educationYearsOtherWrapper.classList.remove('hidden');
        educationYearsOtherInput.required = true;
        educationYearsOtherInput.focus();
        updateProgress(1);
        return;
    }

    if (!validateSchoolContextFields()) {
        updateProgress(1);
        return;
    }

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
    const isHighSchool = isHighSchoolRelatedStatus(status);

    if (isHighSchool && status !== '') {
        schoolDetailsSection.classList.remove('hidden');
        updateSchoolConditionalDetails();
    } else {
        schoolDetailsSection.classList.add('hidden');
        // Clear values when hidden
        if (schoolTypeSelect) {
            schoolTypeSelect.value = '';
        }
        // Uncheck all qualification checkboxes
        const qualificationCheckboxes = document.querySelectorAll('input[name="qualification"]');
        qualificationCheckboxes.forEach(cb => cb.checked = false);
        hideAndResetFieldGroup(
            schoolTypeOtherDetailsSection,
            [schoolOfficialNameInput, schoolLocationCountryInput, schoolLocationCityInput, curriculumNameInput]
        );
        hideAndResetFieldGroup(
            qualificationUnknownDetailsSection,
            [qualificationUnknownSchoolNameInput, qualificationUnknownLocationCountryInput, qualificationUnknownLocationCityInput, qualificationUnknownCurriculumInput]
        );
    }
}

function handleEducationYearsChoiceChange() {
    const choice = getEducationYearsChoice();
    educationYearsError.classList.add('hidden');
    if (choice === 'Other') {
        educationYearsOtherWrapper.classList.remove('hidden');
        educationYearsOtherInput.required = true;
    } else {
        educationYearsOtherWrapper.classList.add('hidden');
        educationYearsOtherInput.required = false;
        educationYearsOtherInput.value = '';
    }
}

function getSelectedQualifications() {
    const checkboxes = document.querySelectorAll('input[name="qualification"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function hasNotSureQualification() {
    return getSelectedQualifications().includes('Not sure');
}

function isHighSchoolRelatedStatus(status) {
    const normalizedStatus = (status || '').toLowerCase();
    return normalizedStatus.includes('high school') || normalizedStatus.includes('non-traditional');
}

function hideAndResetFieldGroup(section, inputs) {
    if (section) {
        section.classList.add('hidden');
    }
    inputs.forEach(input => {
        if (!input) return;
        input.required = false;
        input.value = '';
    });
}

function showAndRequireFieldGroup(section, inputs) {
    if (section) {
        section.classList.remove('hidden');
    }
    inputs.forEach(input => {
        if (!input) return;
        input.required = true;
    });
}

function updateSchoolConditionalDetails() {
    if (!schoolDetailsSection || schoolDetailsSection.classList.contains('hidden')) {
        return;
    }

    const isSchoolTypeOther = schoolTypeSelect && schoolTypeSelect.value === 'Other';
    const notSureSelected = hasNotSureQualification();

    if (isSchoolTypeOther) {
        showAndRequireFieldGroup(
            schoolTypeOtherDetailsSection,
            [schoolOfficialNameInput, schoolLocationCountryInput, schoolLocationCityInput, curriculumNameInput]
        );
        hideAndResetFieldGroup(
            qualificationUnknownDetailsSection,
            [qualificationUnknownSchoolNameInput, qualificationUnknownLocationCountryInput, qualificationUnknownLocationCityInput, qualificationUnknownCurriculumInput]
        );
        return;
    }

    hideAndResetFieldGroup(
        schoolTypeOtherDetailsSection,
        [schoolOfficialNameInput, schoolLocationCountryInput, schoolLocationCityInput, curriculumNameInput]
    );

    if (notSureSelected) {
        showAndRequireFieldGroup(
            qualificationUnknownDetailsSection,
            [qualificationUnknownSchoolNameInput, qualificationUnknownLocationCountryInput, qualificationUnknownLocationCityInput, qualificationUnknownCurriculumInput]
        );
    } else {
        hideAndResetFieldGroup(
            qualificationUnknownDetailsSection,
            [qualificationUnknownSchoolNameInput, qualificationUnknownLocationCountryInput, qualificationUnknownLocationCityInput, qualificationUnknownCurriculumInput]
        );
    }
}

function getActiveSchoolContextFields() {
    const isSchoolTypeOther = schoolTypeSelect && schoolTypeSelect.value === 'Other';
    const notSureSelected = hasNotSureQualification();

    if (isSchoolTypeOther) {
        return [schoolOfficialNameInput, schoolLocationCountryInput, schoolLocationCityInput, curriculumNameInput];
    }

    if (notSureSelected) {
        return [
            qualificationUnknownSchoolNameInput,
            qualificationUnknownLocationCountryInput,
            qualificationUnknownLocationCityInput,
            qualificationUnknownCurriculumInput
        ];
    }

    return [];
}

function validateSchoolContextFields() {
    const status = educationStatusSelect.value;
    if (!isHighSchoolRelatedStatus(status)) {
        return true;
    }

    const requiredFields = getActiveSchoolContextFields();
    if (requiredFields.length === 0) {
        return true;
    }

    for (const field of requiredFields) {
        if (field && !field.value.trim()) {
            showToast('Please enter school official name, country/city, and curriculum details.');
            field.focus();
            return false;
        }
    }

    return true;
}

function getSchoolContextDetails() {
    const fields = getActiveSchoolContextFields();
    if (fields.length === 0) {
        return {
            schoolOfficialName: '',
            schoolLocationCountry: '',
            schoolLocationCity: '',
            curriculumName: ''
        };
    }

    const [officialNameField, locationCountryField, locationCityField, curriculumField] = fields;
    return {
        schoolOfficialName: officialNameField ? officialNameField.value.trim() : '',
        schoolLocationCountry: locationCountryField ? locationCountryField.value.trim() : '',
        schoolLocationCity: locationCityField ? locationCityField.value.trim() : '',
        curriculumName: curriculumField ? curriculumField.value.trim() : ''
    };
}

function getSelectedPrograms() {
    const checkboxes = document.querySelectorAll('input[name="program"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function getEducationYearsChoice() {
    const selected = document.querySelector('input[name="educationYearsChoice"]:checked');
    return selected ? selected.value : '';
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
    const isHighSchoolRelated = isHighSchoolRelatedStatus(educationStatus);
    const schoolContextDetails = getSchoolContextDetails();

    const programs = getSelectedPrograms();
    const educationYearsChoice = getEducationYearsChoice();
    const educationYears = educationYearsChoice === 'Other'
        ? educationYearsOtherInput.value.trim()
        : educationYearsChoice;

    return {
        program: programs.join(', '),
        programs: programs,
        nationality: nationality,
        countryOfResidence: countryOfResidence,
        educationStatus: educationStatus,
        schoolType: isHighSchoolRelated ? (schoolTypeSelect?.value || '') : '',
        qualifications: isHighSchoolRelated ? getSelectedQualifications() : [],
        schoolOfficialName: isHighSchoolRelated ? schoolContextDetails.schoolOfficialName : '',
        schoolLocationCountry: isHighSchoolRelated ? schoolContextDetails.schoolLocationCountry : '',
        schoolLocationCity: isHighSchoolRelated ? schoolContextDetails.schoolLocationCity : '',
        curriculumName: isHighSchoolRelated ? schoolContextDetails.curriculumName : '',
        educationYears: educationYears,
        educationYearsChoice: educationYearsChoice,
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
1. Base your answers ONLY on the "Information Sources" provided below
2. **CRITICAL: You must actually access and read the source documents.** Do NOT answer based on:
   - Your general knowledge about universities or admissions
   - Assumptions about what the documents might contain
   - Information from other sources not listed below
3. For matters not explicitly stated in the sources, respond with: "This is not explicitly stated in the provided sources. Please contact the university directly for confirmation."
4. Quote specific sections as evidence with **exact page numbers, section titles, or paragraph references**. Vague citations like "according to the handbook" are NOT acceptable.
5. If you cannot verify information from the actual document, clearly state: "I could not verify this in the source document."
6. Respond in English

---

## Information Sources (Default Official + User-Added)

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
(If anything cannot be determined from the provided sources, recommend contacting the university)`;
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

    if (data.schoolOfficialName) {
        rows += `| School Official Name | ${data.schoolOfficialName} |\n`;
    }

    if (data.schoolLocationCountry || data.schoolLocationCity) {
        const locationParts = [data.schoolLocationCity, data.schoolLocationCountry].filter(Boolean);
        rows += `| School Location | ${locationParts.join(', ')} |\n`;
    }

    if (data.curriculumName) {
        rows += `| Curriculum / Program Name | ${data.curriculumName} |\n`;
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
    const step1Fields = ['nationality', 'countryOfResidence', 'educationStatus'];
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

    const programCheckboxes = document.querySelectorAll('input[name="program"]');
    programCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            programError.classList.add('hidden');
            updateProgress(1);
        });
    });

    const educationYearsOptions = document.querySelectorAll('input[name="educationYearsChoice"]');
    educationYearsOptions.forEach(option => {
        option.addEventListener('change', () => updateProgress(1));
    });

    if (educationYearsOtherInput) {
        educationYearsOtherInput.addEventListener('focus', () => updateProgress(1));
    }

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
            programs: getSelectedPrograms(),
            nationality: nationalitySelect.value,
            nationalityOther: nationalityOther.value,
            countryOfResidence: countryOfResidenceSelect.value,
            countryOfResidenceOther: countryOfResidenceOther.value,
            educationStatus: document.getElementById('educationStatus').value,
            schoolType: schoolTypeSelect ? schoolTypeSelect.value : '',
            qualifications: getSelectedQualifications(),
            schoolOfficialName: schoolOfficialNameInput ? schoolOfficialNameInput.value : '',
            schoolLocationCountry: schoolLocationCountryInput ? schoolLocationCountryInput.value : '',
            schoolLocationCity: schoolLocationCityInput ? schoolLocationCityInput.value : '',
            curriculumName: curriculumNameInput ? curriculumNameInput.value : '',
            qualificationUnknownSchoolName: qualificationUnknownSchoolNameInput ? qualificationUnknownSchoolNameInput.value : '',
            qualificationUnknownLocationCountry: qualificationUnknownLocationCountryInput ? qualificationUnknownLocationCountryInput.value : '',
            qualificationUnknownLocationCity: qualificationUnknownLocationCityInput ? qualificationUnknownLocationCityInput.value : '',
            qualificationUnknownCurriculum: qualificationUnknownCurriculumInput ? qualificationUnknownCurriculumInput.value : '',
            educationYearsChoice: getEducationYearsChoice(),
            educationYearsOther: educationYearsOtherInput.value,
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
        if (data.programs && data.programs.length > 0) {
            data.programs.forEach(program => {
                const checkbox = document.querySelector(`input[name="program"][value="${program}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        } else if (data.program) {
            const legacyProgram = document.querySelector(`input[name="program"][value="${data.program}"]`);
            if (legacyProgram) {
                legacyProgram.checked = true;
            }
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
        if (schoolOfficialNameInput) {
            schoolOfficialNameInput.value = data.schoolOfficialName || '';
        }
        if (schoolLocationCountryInput) {
            schoolLocationCountryInput.value = data.schoolLocationCountry || '';
        }
        if (schoolLocationCityInput) {
            schoolLocationCityInput.value = data.schoolLocationCity || '';
        }
        if (curriculumNameInput) {
            curriculumNameInput.value = data.curriculumName || '';
        }
        if (qualificationUnknownSchoolNameInput) {
            qualificationUnknownSchoolNameInput.value = data.qualificationUnknownSchoolName || '';
        }
        if (qualificationUnknownLocationCountryInput) {
            qualificationUnknownLocationCountryInput.value = data.qualificationUnknownLocationCountry || '';
        }
        if (qualificationUnknownLocationCityInput) {
            qualificationUnknownLocationCityInput.value = data.qualificationUnknownLocationCity || '';
        }
        if (qualificationUnknownCurriculumInput) {
            qualificationUnknownCurriculumInput.value = data.qualificationUnknownCurriculum || '';
        }
        updateSchoolConditionalDetails();
        if (data.educationYearsChoice) {
            const educationChoice = document.querySelector(`input[name="educationYearsChoice"][value="${data.educationYearsChoice}"]`);
            if (educationChoice) {
                educationChoice.checked = true;
            }
            if (data.educationYearsChoice === 'Other') {
                educationYearsOtherWrapper.classList.remove('hidden');
                educationYearsOtherInput.required = true;
                educationYearsOtherInput.value = data.educationYearsOther || '';
            }
        } else if (data.educationYears) {
            const legacyYears = String(data.educationYears).trim();
            const legacyChoice = ['11', '12'].includes(legacyYears) ? legacyYears : 'Other';
            const educationChoice = document.querySelector(`input[name="educationYearsChoice"][value="${legacyChoice}"]`);
            if (educationChoice) {
                educationChoice.checked = true;
            }
            if (legacyChoice === 'Other') {
                educationYearsOtherWrapper.classList.remove('hidden');
                educationYearsOtherInput.required = true;
                educationYearsOtherInput.value = legacyYears;
            }
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
    const programCheckboxes = document.querySelectorAll('input[name="program"]');
    programCheckboxes.forEach(cb => cb.checked = false);
    programError.classList.add('hidden');
    nationalitySelect.value = '';
    nationalityOther.value = '';
    nationalityOther.classList.add('hidden');
    nationalityOther.required = false;
    countryOfResidenceSelect.value = '';
    countryOfResidenceOther.value = '';
    countryOfResidenceOther.classList.add('hidden');
    countryOfResidenceOther.required = false;
    document.getElementById('educationStatus').value = '';
    const educationYearsOptions = document.querySelectorAll('input[name="educationYearsChoice"]');
    educationYearsOptions.forEach(option => option.checked = false);
    educationYearsError.classList.add('hidden');
    educationYearsOtherInput.value = '';
    educationYearsOtherInput.required = false;
    educationYearsOtherWrapper.classList.add('hidden');

    // Reset conditional education fields
    if (schoolTypeSelect) {
        schoolTypeSelect.value = '';
    }
    const qualificationCheckboxes = document.querySelectorAll('input[name="qualification"]');
    qualificationCheckboxes.forEach(cb => cb.checked = false);
    if (schoolDetailsSection) {
        schoolDetailsSection.classList.add('hidden');
    }
    hideAndResetFieldGroup(
        schoolTypeOtherDetailsSection,
        [schoolOfficialNameInput, schoolLocationCountryInput, schoolLocationCityInput, curriculumNameInput]
    );
    hideAndResetFieldGroup(
        qualificationUnknownDetailsSection,
        [qualificationUnknownSchoolNameInput, qualificationUnknownLocationCountryInput, qualificationUnknownLocationCityInput, qualificationUnknownCurriculumInput]
    );

    // Clear Step 1 data from localStorage
    try {
        const savedData = localStorage.getItem(CONFIG.storageKey);
        if (savedData) {
            const data = JSON.parse(savedData);
            data.programs = [];
            data.program = '';
            data.nationality = '';
            data.nationalityOther = '';
            data.countryOfResidence = '';
            data.countryOfResidenceOther = '';
            data.educationStatus = '';
            data.schoolType = '';
            data.qualifications = [];
            data.schoolOfficialName = '';
            data.schoolLocationCountry = '';
            data.schoolLocationCity = '';
            data.curriculumName = '';
            data.qualificationUnknownSchoolName = '';
            data.qualificationUnknownLocationCountry = '';
            data.qualificationUnknownLocationCity = '';
            data.qualificationUnknownCurriculum = '';
            data.educationYearsChoice = '';
            data.educationYearsOther = '';
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
