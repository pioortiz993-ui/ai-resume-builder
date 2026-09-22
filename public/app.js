let state = {
  personal: { name: '', email: '', phone: '', address: '', linkedin: '', portfolio: '' },
  summary: '',
  experiences: [],
  education: [],
  skills: ''
};

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  
  const selectedTab = document.getElementById(`tab-${tabName}`);
  if (selectedTab) selectedTab.classList.add('active');
  if (event && event.target) event.target.classList.add('active');
}

function showToast(message) {
  const toast = document.getElementById('status-toast');
  toast.innerText = message;
  toast.classList.remove('hidden');
}

function hideToast() {
  document.getElementById('status-toast').classList.add('hidden');
}

function updatePreview() {
  const selectEl = document.getElementById('template-select');
  const template = selectEl ? selectEl.value : 'modern';
  const preview = document.getElementById('resume-preview');
  if (!preview) return;

  preview.className = `resume-sheet template-${template}`;

  state.personal.name = document.getElementById('res-name')?.value || 'John Doe';
  state.personal.email = document.getElementById('res-email')?.value || 'john@example.com';
  state.personal.phone = document.getElementById('res-phone')?.value || '+1 234 567 890';
  state.personal.address = document.getElementById('res-address')?.value || 'City, Country';
  state.personal.linkedin = document.getElementById('res-linkedin')?.value || '';
  state.personal.portfolio = document.getElementById('res-portfolio')?.value || '';
  state.summary = document.getElementById('res-summary')?.value || '';
  state.skills = document.getElementById('res-skills')?.value || '';

  let html = `
    <h1>${state.personal.name}</h1>
    <p>${state.personal.email} | ${state.personal.phone} | ${state.personal.address}</p>
    <p>${state.personal.linkedin ? state.personal.linkedin + ' | ' : ''}${state.personal.portfolio}</p>
  `;

  if (state.summary) {
    html += `<h3>Professional Summary</h3><p>${state.summary}</p>`;
  }

  if (state.experiences.length > 0) {
    html += `<h3>Work Experience</h3>`;
    state.experiences.forEach(exp => {
      html += `
        <div style="margin-bottom: 0.8rem;">
          <strong>${exp.role || 'Role'}</strong> - ${exp.company || 'Company'} <em>(${exp.dates || 'Dates'})</em>
          <p>${exp.desc || ''}</p>
        </div>`;
    });
  }

  if (state.education.length > 0) {
    html += `<h3>Education</h3>`;
    state.education.forEach(edu => {
      html += `
        <div style="margin-bottom: 0.5rem;">
          <strong>${edu.degree || 'Degree'}</strong>, ${edu.school || 'School'} <em>(${edu.year || 'Year'})</em>
        </div>`;
    });
  }

  if (state.skills) {
    html += `<h3>Skills</h3><p>${state.skills}</p>`;
  }

  preview.innerHTML = html;
}

function addExperience() {
  const id = Date.now();
  state.experiences.push({ id, role: '', company: '', dates: '', desc: '' });
  renderExperiences();
}

function renderExperiences() {
  const container = document.getElementById('experience-list');
  if (!container) return;
  container.innerHTML = '';
  state.experiences.forEach((exp, idx) => {
    container.innerHTML += `
      <div style="border:1px dashed #cbd5e1; padding:0.5rem; margin-bottom:0.5rem; border-radius:4px;">
        <input type="text" placeholder="Job Title" value="${exp.role}" oninput="state.experiences[${idx}].role=this.value; updatePreview()">
        <input type="text" placeholder="Company" value="${exp.company}" oninput="state.experiences[${idx}].company=this.value; updatePreview()">
        <input type="text" placeholder="Start Date - End Date" value="${exp.dates}" oninput="state.experiences[${idx}].dates=this.value; updatePreview()">
        <textarea id="exp-desc-${idx}" placeholder="Responsibilities & Achievements">${exp.desc}</textarea>
        <button class="btn ai-btn" onclick="aiImproveExp(${idx})">✨ Improve with AI</button>
        <button class="btn secondary" onclick="state.experiences.splice(${idx},1); renderExperiences(); updatePreview();">Delete</button>
      </div>
    `;
  });
}

function addEducation() {
  const id = Date.now();
  state.education.push({ id, degree: '', school: '', year: '' });
  renderEducation();
}

function renderEducation() {
  const container = document.getElementById('education-list');
  if (!container) return;
  container.innerHTML = '';
  state.education.forEach((edu, idx) => {
    container.innerHTML += `
      <div style="border:1px dashed #cbd5e1; padding:0.5rem; margin-bottom:0.5rem; border-radius:4px;">
        <input type="text" placeholder="Degree/Diploma" value="${edu.degree}" oninput="state.education[${idx}].degree=this.value; updatePreview()">
        <input type="text" placeholder="School/University" value="${edu.school}" oninput="state.education[${idx}].school=this.value; updatePreview()">
        <input type="text" placeholder="Graduation Year" value="${edu.year}" oninput="state.education[${idx}].year=this.value; updatePreview()">
        <button class="btn secondary" onclick="state.education.splice(${idx},1); renderEducation(); updatePreview();">Delete</button>
      </div>
    `;
  });
}

async function callGeminiAPI(task, payload) {
  showToast('Connecting to Gemini AI...');
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, payload })
    });
    const data = await res.json();
    hideToast();
    if (data.error) {
      alert('AI Error: ' + data.error);
      return null;
    }
    return data.result;
  } catch (e) {
    hideToast();
    alert('Network Error: Unable to reach AI endpoint.');
    return null;
  }
}

async function aiImproveField(fieldId, sectionName) {
  const inputEl = document.getElementById(fieldId);
  if (!inputEl || !inputEl.value.trim()) return alert('Please enter some text first.');
  
  const result = await callGeminiAPI('improve_text', { text: inputEl.value, sectionType: sectionName });
  if (result) {
    inputEl.value = result.trim();
    updatePreview();
  }
}

async function aiImproveExp(index) {
  const descEl = document.getElementById(`exp-desc-${index}`);
  if (!descEl || !descEl.value.trim()) return alert('Please enter responsibilities first.');

  const result = await callGeminiAPI('improve_text', { text: descEl.value, sectionType: 'Work Experience' });
  if (result) {
    descEl.value = result.trim();
    state.experiences[index].desc = result.trim();
    updatePreview();
  }
}

async function aiSuggestSkills() {
  const context = JSON.stringify(state.experiences) + ' ' + state.summary;
  if (!context.trim()) return alert('Add work experience or summary first.');

  const result = await callGeminiAPI('suggest_skills', { text: context });
  if (result) {
    document.getElementById('res-skills').value = result.trim();
    updatePreview();
  }
}

async function analyzeJobDescription() {
  const jd = document.getElementById('analyzer-input').value;
  if (!jd.trim()) return alert('Please paste a job description first.');

  const rawJson = await callGeminiAPI('analyze_job', { text: jd });
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      document.getElementById('analyzer-results').classList.remove('hidden');
      
      const renderList = (id, items) => {
        document.getElementById(id).innerHTML = (items || []).map(i => `<li>${i}</li>`).join('');
      };

      renderList('res-tech-skills', parsed.technicalSkills);
      renderList('res-soft-skills', parsed.softSkills);
      renderList('res-keywords', parsed.keywords);
      renderList('res-responsibilities', parsed.responsibilities);
    } catch (err) {
      alert('Failed to parse AI output. Try again.');
    }
  }
}

async function generateCoverLetter() {
  const payload = {
    fullName: document.getElementById('cl-name').value,
    jobPosition: document.getElementById('cl-job').value,
    companyName: document.getElementById('cl-company').value,
    tone: document.getElementById('cl-tone').value,
    skills: document.getElementById('cl-skills').value,
    experience: document.getElementById('cl-exp').value,
    reason: document.getElementById('cl-reason').value,
    jobDescription: document.getElementById('cl-jd').value
  };

  if (!payload.fullName || !payload.jobPosition) return alert('Please fill in required fields.');

  const letter = await callGeminiAPI('generate_cover_letter', payload);
  if (letter) {
    document.getElementById('cl-output').value = letter.trim();
  }
}

function downloadResumePDF() {
  const element = document.getElementById('resume-preview');
  html2pdf().from(element).save(`${state.personal.name || 'Resume'}.pdf`);
}

function downloadCoverLetterPDF() {
  const text = document.getElementById('cl-output').value;
  if (!text) return alert('No letter content to download.');
  
  const element = document.createElement('div');
  element.style.padding = '30px';
  element.style.whiteSpace = 'pre-wrap';
  element.style.fontFamily = 'Georgia, serif';
  element.innerText = text;

  html2pdf().from(element).save('Cover_Letter.pdf');
}

function saveResumeLocal() {
  localStorage.setItem('saved_resume', JSON.stringify(state));
  alert('Resume saved to local storage!');
  loadSavedDocs();
}

function saveCoverLetterLocal() {
  const letter = document.getElementById('cl-output').value;
  localStorage.setItem('saved_cover_letter', letter);
  alert('Cover letter saved to local storage!');
  loadSavedDocs();
}

function loadSavedDocs() {
  const res = localStorage.getItem('saved_resume');
  const letter = localStorage.getItem('saved_cover_letter');

  const resList = document.getElementById('saved-resumes-list');
  if (resList) {
    resList.innerHTML = res 
      ? `<button class="btn secondary" onclick="loadResumeState()">Load Saved Resume (${JSON.parse(res).personal.name})</button>` 
      : 'No saved resumes found.';
  }

  const letterList = document.getElementById('saved-letters-list');
  if (letterList) {
    letterList.innerHTML = letter 
      ? `<p>Cover Letter Saved (${letter.substring(0, 30)}...)</p>` 
      : 'No saved cover letters found.';
  }
}

function loadResumeState() {
  const res = localStorage.getItem('saved_resume');
  if (res) {
    state = JSON.parse(res);
    if (document.getElementById('res-name')) document.getElementById('res-name').value = state.personal.name;
    if (document.getElementById('res-email')) document.getElementById('res-email').value = state.personal.email;
    if (document.getElementById('res-summary')) document.getElementById('res-summary').value = state.summary;
    if (document.getElementById('res-skills')) document.getElementById('res-skills').value = state.skills;
    renderExperiences();
    renderEducation();
    updatePreview();
    alert('Resume loaded!');
  }
}

window.onload = () => {
  updatePreview();
  loadSavedDocs();
};