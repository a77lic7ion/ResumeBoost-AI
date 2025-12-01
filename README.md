# ResumeBoost AI 🚀

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)
![Gemini](https://img.shields.io/badge/AI-Gemini%202.5-8e44ad.svg)
![Tailwind](https://img.shields.io/badge/Style-Tailwind-38bdf8.svg?logo=tailwindcss)

**ResumeBoost AI** is an intelligent web application designed to help job seekers optimize their resumes for Applicant Tracking Systems (ATS). By leveraging the power of Google's Gemini 2.5 Flash model, it provides instant scoring, actionable feedback, and AI-powered rewriting to increase interview chances.

## ✨ Key Features

### 📄 Universal File Support
- **Upload Anything:** Supports `PDF`, `DOCX`, `JPG`, `PNG`, and `TXT` files.
- **Smart Extraction:** 
  - **Text:** Uses `mammoth.js` for Word docs and **Gemini Multimodal** (Vision) for PDFs/Images.
  - **Photos:** Automatically extracts profile photos from `.docx` files or allows manual uploads.

### 🎯 Comprehensive ATS Scoring
- **40+ Checkpoints:** Rigorous analysis against industry standards.
- **Scoring Categories:**
  - **Format:** Checks for length, readability, and structure.
  - **Content:** Validates contact info and section headers.
  - **ATS Compatibility:** Ensures standard section naming.
  - **Keywords:** Analyzes keyword density and relevance.
  - **Impact:** Measures the use of quantifiable metrics and action verbs.

### 🤖 AI-Powered Analysis & Repair
- **Gemini 2.5 Integration:** Uses the latest Google GenAI models for deep text understanding.
- **Critical Fixes Banner:** Identifies "deal-breaker" errors (missing contact info, no metrics) and offers **One-Click AI Fixes**.
- **Auto-Write Summary:** Detects missing summaries and generates a professional executive profile instantly.
- **Tone Check:** Evaluates professional voice (e.g., Passive vs. Active).

### ✍️ Instant Rewrite & Preview Studio
- **Improvement Panel:** Side-by-side editor with Markdown support.
- **Isolated Preview:** Real-time resume rendering in an isolated environment (Iframe) to prevent style conflicts.
- **Templates:** Switch between **Modern**, **Classic**, and **Minimal** designs instantly.
- **Smart Prompts:** Context-aware suggestions based on your specific resume score (e.g., "Quantify Achievements", "Fix Formatting").

### 📤 Export & Privacy
- **High-Fidelity Export:** Download optimized resumes as **PDF** (via browser print) or **DOCX**.
- **Privacy First:** Client-side logic for file handling. API keys are stored in your browser's local storage.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide React Icons
- **AI/ML:** Google Gemini API (`@google/genai`)
- **Visualization:** Recharts
- **Parsing:** `mammoth.js`, `marked`, `dompurify`

## 🚀 Getting Started

### Prerequisites
- Node.js installed.
- A Google Cloud Project with the **Gemini API** enabled.

### Installation

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
    *   **Option A (Local/Secure):** Create a `.env` file in the root directory.
        ```env
        # For Vite/Client-side usage
        VITE_API_KEY=your_google_api_key_here
        ```
    *   **Option B (UI):** You can also enter your API key directly in the application's "Settings" menu (stored in LocalStorage).

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

### ☁️ Deployment (Vercel)

This project is optimized for Vercel deployment.

1.  Import project to Vercel.
2.  Add Environment Variable: `VITE_API_KEY`.
3.  Deploy!

## 📸 Usage

1.  **Upload:** Drag and drop your resume or paste text. Add a profile photo if desired.
2.  **Analyze:** Wait a few seconds for Gemini to score your resume.
3.  **Dashboard:** Review your score breakdown and "Critical Issues".
4.  **Optimize:** 
    - Click **"AI Optimize"** to open the studio.
    - Use the **"Auto-Fix"** buttons for specific errors.
    - Switch to **Preview Mode** to see the final layout.
5.  **Export:** Download as PDF or DOCX.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.