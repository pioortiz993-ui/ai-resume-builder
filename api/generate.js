// TAB NAVIGATION
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.id !== 'theme-toggle-btn') btn.classList.remove('active');
  });

  const selectedTab = document.getElementById(`tab-${tabName}`);
  if (selectedTab) selectedTab.classList.add('active');

  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabName)) {
      btn.classList.add('active');
    }
  });

  if (tabName === 'my-docs') {
    loadSavedDocs();
  }
}

// THEME TOGGLE LOGIC
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('preferred_theme', newTheme);
  updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.innerText = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('preferred_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeButton(theme);
}

// RESUME PREVIEW GENERATOR
function updatePreview() {
  const sheet = document.getElementById('resume-sheet');
  const template = document.getElementById('template-select').value;
  
  const name = document.getElementById('res-name').value.trim();
  const email = document.getElementById('res-email').value.trim();
  const phone = document.getElementById('res-phone').value.trim();
  const location = document.getElementById('res-location').value.trim();
  const summary = document.getElementById('res-summary').value.trim();
  const expTitle = document.getElementById('res-exp-title').value.trim();
  const expCompany = document.getElementById('res-exp-company').value.trim();
  const expDates = document.getElementById('res-exp-dates').value.trim();
  const expDesc = document.getElementById('res-exp-desc').value.trim();
  const skills = document.getElementById('res-skills').value.trim();

  sheet.className = `resume-sheet template-${template}`;

  // Build clean contact row without trailing | separators
  const contactDetails = [email, phone, location].filter(item => item !== '').join(' | ');

  // Clean and parse bullet points properly
  const bullets = expDesc 
    ? expDesc.split('\n')
        .map(line => line.replace(/^[-*•]\s*/, '').trim()) // Strip raw markdown bullets if present
        .filter(line => line !== '')
        .map(b => `<li>${b}</li>`)
        .join('') 
    : '';

  const skillBadges = skills ? skills.split(',').filter(s => s.trim() !== '').map(s => `<span style="display:inline-block; background:#e2e8f0; padding:2px 8px; margin:2px; border-radius:4px; font-size:0.85rem; color:#0f172a;">${s.trim()}</span>`).join(' ') : '';

  sheet.innerHTML = `
    ${name ? `<h1>${name}</h1>` : '<h1 style="color:#cbd5e1;">Your Name</h1>'}
    ${contactDetails ? `<p style="margin-bottom: 1rem;">${contactDetails}</p>` : ''}
    
    ${summary ? `<h3>Professional Summary</h3><p>${summary}</p>` : ''}
    
    ${expTitle || expCompany ? `
      <h3>Experience</h3>
      <div style="display:flex; justify-content:space-between;">
        <strong>${expTitle}${expTitle && expCompany ? ' @ ' : ''}${expCompany}</strong>
        <span>${expDates}</span>
      </div>
      ${bullets ? `<ul style="margin-left: 1.2rem; margin-top: 0.5rem;">${bullets}</ul>` : ''}
    ` : ''}

    ${skills ? `<h3>Skills</h3><div>${skillBadges}</div>` : ''}
  `;
}

// AI API CALLER
async function callGeminiAPI(prompt) {
  showToast('AI is thinking...');
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    showToast('Success!');
    return data.result;
  } catch (err) {
    showToast('Error: ' + err.message);
    return null;
  }
}

// AI OPTIMIZE FIELD
async function aiOptimizeField(elementId, fieldType) {
  const field = document.getElementById(elementId);
  if (!field.value.trim()) {
    showToast('Please enter text first');
    return;
  }
  
  const prompt = `Rewrite and enhance the following ${fieldType} for a professional resume to make it action-oriented, metrics-driven, and clear. Format each distinct responsibility or achievement on a new line. Return ONLY the enhanced text without extra commentary:\n\n"${field.value}"`;
  const result = await callGeminiAPI(prompt);
  if (result) {
    field.value = result.trim();
    updatePreview();
  }
}

// COVER LETTER GENERATION
async function generateCoverLetter() {
  const name = document.getElementById('cl-name').value || 'Peepps';
  const title = document.getElementById('cl-title').value;
  const company = document.getElementById('cl-company').value;
  const jobDesc = document.getElementById('cl-job-desc').value;

  if (!title || !company) {
    showToast('Please specify Job Title and Company');
    return;
  }

  const prompt = `Write a compelling, professional cover letter for ${name} applying for the ${title} position at ${company}. Context/Job Details: ${jobDesc}. Keep it concise, formal, and persuasive.`;
  const result = await callGeminiAPI(prompt);
  
  if (result) {
    document.getElementById('cl-output').value = result.trim();
  }
}

// JOB ANALYZER
async function analyzeJob() {
  const jobDesc = document.getElementById('ja-job-desc').value;
  const resumeText = document.getElementById('ja-resume-text').value;

  if (!jobDesc || !resumeText) {
    showToast('Please fill in both fields');
    return;
  }

  const prompt = `Analyze the fit between this Resume and Job Description.
Resume: "${resumeText}"
Job Description: "${jobDesc}"

Provide output in this exact format:
MATCH SCORE: [0-100]%
ANALYSIS:
- Key matching strengths
- Missing keywords/skills
- Recommendations to improve fit`;

  const result = await callGeminiAPI(prompt);
  if (result) {
    document.getElementById('ja-results').classList.remove('hidden');
    const scoreMatch = result.match(/MATCH SCORE:\s*(\d+%)/i);
    document.getElementById('ja-score').innerText = scoreMatch ? scoreMatch[1] : '85%';
    document.getElementById('ja-analysis-text').innerText = result.replace(/MATCH SCORE:.*?\n/i, '').trim();
  }
}

// LOCAL STORAGE MANAGEMENT
function saveDocument(type) {
  const docs = JSON.parse(localStorage.getItem('saved_docs') || '[]');
  
  if (type === 'resume') {
    const doc = {
      id: Date.now(),
      type: 'Resume',
      title: (document.getElementById('res-name').value || 'Peepps') + ' - Resume',
      date: new Date().toLocaleDateString(),
      data: {
        name: document.getElementById('res-name').value,
        email: document.getElementById('res-email').value,
        summary: document.getElementById('res-summary').value
      }
    };
    docs.push(doc);
  } else if (type === 'cover-letter') {
    const doc = {
      id: Date.now(),
      type: 'Cover Letter',
      title: document.getElementById('cl-title').value + ' @ ' + document.getElementById('cl-company').value,
      date: new Date().toLocaleDateString(),
      content: document.getElementById('cl-output').value
    };
    docs.push(doc);
  }

  localStorage.setItem('saved_docs', JSON.stringify(docs));
  showToast('Document saved successfully!');
}

function loadSavedDocs() {
  const docsList = document.getElementById('docs-list');
  const docs = JSON.parse(localStorage.getItem('saved_docs') || '[]');

  if (docs.length === 0) {
    docsList.innerHTML = '<p>No saved documents yet.</p>';
    return;
  }

  docsList.innerHTML = docs.map(doc => `
    <div class="card">
      <h3>${doc.title}</h3>
      <p><strong>Type:</strong> ${doc.type}</p>
      <p><strong>Date:</strong> ${doc.date}</p>
      <button class="btn primary" style="margin-top:0.8rem;" onclick="deleteDoc(${doc.id})">Delete</button>
    </div>
  `).join('');
}

function deleteDoc(id) {
  let docs = JSON.parse(localStorage.getItem('saved_docs') || '[]');
  docs = docs.filter(d => d.id !== id);
  localStorage.setItem('saved_docs', JSON.stringify(docs));
  loadSavedDocs();
  showToast('Document deleted');
}

// PDF EXPORT
function downloadPDF() {
  const element = document.getElementById('resume-sheet');
  const opt = {
    margin:       0.5,
    filename:     'Resume.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}

// UTILITY TOAST
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.innerText = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// INITIALIZATION
window.onload = () => {
  initTheme();
  updatePreview();
  loadSavedDocs();
};