# ResumeBoost AI 🚀

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg?logo=react)
![Gemini](https://img.shields.io/badge/AI-Gemini%202.5-8e44ad.svg)
![Tailwind](https://img.shields.io/badge/Style-Tailwind-38bdf8.svg?logo=tailwindcss)

**ResumeBoost AI** is an intelligent web application designed to help job seekers optimize their resumes for Applicant Tracking Systems (ATS). By leveraging the power of Google's Gemini 2.5 Flash model, it provides instant scoring, actionable feedback, and AI-powered rewriting to increase interview chances.

## ✨ Key Features

### 📄 Universal File Support
- **Upload Anything:** Supports `PDF`, `DOCX`, `JPG`, `PNG`, and `TXT` files.
- **Smart Extraction:** Uses client-side libraries for Word docs and **Gemini Vision** for PDFs and Images to accurately transcribe text while preserving logical flow.

### 🎯 Comprehensive ATS Scoring
- **40+ Checkpoints:** rigorous analysis against industry standards.
- **Scoring Categories:**
  - **Format:** Checks for length, readability, and structure.
  - **Content:** Validates contact info and section headers.
  - **ATS Compatibility:** Ensures standard section naming.
  - **Keywords:** Analyzes keyword density and relevance.
  - **Impact:** measures the use of quantifiable metrics and action verbs.

### 🤖 AI-Powered Analysis
- **Gemini 2.5 Integration:** Uses the latest Google GenAI models for deep text understanding.
- **Tone Check:** Evaluates professional voice (e.g., Passive vs. Active).
- **Keyword Gap Analysis:** Identifies missing industry terms based on context.
- **Executive Summary:** Auto-generates a professional summary of the candidate.

### ✍️ Instant Rewrite Engine
- **Improvement Panel:** Side-by-side editor to rewrite weak sections.
- **Contextual Prompts:** Ask the AI to "Fix grammar", "Add metrics", or "Make it sound more senior".
- **One-Click Copy:** Easily copy optimized text back to your document.

### 🔒 Privacy First
- **Client-Side Processing:** File logic happens in the browser.
- **Ephemeral AI:** Text sent to the API is for analysis only and not stored.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS
- **AI/ML:** Google Gemini API (`@google/genai`)
- **Visualization:** Recharts
- **Parsing:**
  - `mammoth.js` for .docx
  - `Gemini Multimodal` for .pdf/.images
- **Icons:** Lucide React

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/resumeboost-ai.git
    cd resumeboost-ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure API Key:**
    - Create a `.env` file in the root directory.
    - Add your Google Gemini API key:
      ```env
      API_KEY=your_google_api_key_here
      ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## 📸 Usage

1.  **Upload:** Drag and drop your resume (PDF/DOCX/Image) or paste text.
2.  **Analyze:** Wait a few seconds for OCR and AI Analysis.
3.  **Review:** Check your ATS Score breakdown and critical issues.
4.  **Optimize:** Click "AI Optimize" to rewrite specific sections.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.