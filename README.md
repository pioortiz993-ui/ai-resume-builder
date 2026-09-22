# AI Resume & Cover Letter Builder (AD-ET 101 Final Project)

A complete, responsive web application that creates professional resumes, generates targeted cover letters, and analyzes job postings using the Google Gemini API.

## Features
- **Dynamic Live Resume Builder**: Auto-updates resume layout as you type.
- **Multiple Templates**: Choose between Classic, Modern, and Minimal styles.
- **Secure Gemini AI Proxy**: Serverless API architecture ensures your API key is never exposed on the client.
- **Zero-Fabrication Rewrites**: Gemini API enhances grammar and impact without adding false metrics or qualifications.
- **Job Description Analyzer**: Extracts technical skills, soft skills, and critical keywords into cards.
- **Tailored Cover Letter Generator**: Customizes letter structure based on position, tone, and user background.
- **PDF Export & Browser Persistence**: Download clean PDFs and save progress locally via `localStorage`.

## Technologies Used
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend API Layer**: Vercel Serverless Functions (Node.js)
- **AI Integration**: Google Gemini API (`gemini-3.6-flash`) via REST API
- **Export Utility**: `html2pdf.js`

---

## Local Setup Instructions

### Prerequisites
1. Install [Node.js](https://nodejs.org/) (v18 or higher).
2. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).

### Installation
1. Clone or download this repository.
2. Open a terminal in the root directory and install Vercel CLI globally (for local testing):
   ```bash
   npm install -g vercel