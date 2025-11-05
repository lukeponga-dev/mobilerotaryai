# 🔧 Rotary Mechanic: Your Digital Renesis Expert

![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite)
![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-8E75B1?logo=google-gemini)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?logo=tailwind-css)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

**An advanced, mobile-first diagnostic assistant for Mazda RX-8 owners, powered by the Google Gemini API.**

---

<!-- Placeholder for a nice GIF or screenshot of the app in action -->
<!-- ![Rotary Mechanic Demo](./docs/demo.gif) -->

Rotary Mechanic is a specialized AI companion designed to demystify the complexities of the Mazda RX-8's Renesis rotary engine. It leverages expert knowledge from workshop manuals and community best practices to help users troubleshoot, diagnose, and understand their vehicles through an intuitive chat interface.

## 🤔 Why Rotary Mechanic?

The rotary engine is a masterpiece of engineering, but its unique design comes with specific challenges that baffle standard diagnostic tools and generic AI assistants. From the nuances of engine flooding to the critical importance of monitoring oil consumption, RX-8 owners need specialized advice. Rotary Mechanic fills this gap by providing:

-   **Rotary-Specific Knowledge:** Trained on a system prompt derived from official workshop manuals.
-   **Contextual Understanding:** Goes beyond simple error codes to understand symptoms described in natural language, photos, and videos.
-   **Structured Guidance:** Delivers clear, actionable steps, just like a professional mechanic would.

## ✨ Key Features

-   **🤖 AI-Powered Diagnostics:** Get expert-level advice by describing issues through text, speech, images, or videos.
-   **📷 Multimodal Input:**
    -   **🗣️ Text & Speech:** Describe your issue or use the microphone for hands-free input.
    -   **🖼️ Image Analysis:** Upload photos of engine components, warning lights, or fluid leaks for visual inspection.
    -   **🎥 Video Analysis:** Upload short clips of engine sounds, startup behavior, or exhaust smoke for deeper insights.
-   **🗂️ Session Management:** All diagnostic sessions are saved locally on your device for easy access and review.
-   **📈 Context-Aware Summaries:** The AI maintains a running summary of diagnosed symptoms, parts, and actions for each session.
-   **📚 Built-in Knowledge Base:** Quickly access articles on the most common RX-8 issues, from apex seal wear to ignition coil failure.
-   **📱 Responsive & Mobile-First:** A clean, modern interface with full dark mode support that works seamlessly on all devices.
-   **📄 Export to PDF:** Save a complete transcript of your diagnostic session as a professional PDF report for your records or to share with a mechanic.

## 🛠️ Tech Stack

-   **Frontend:** React 19, TypeScript, Vite
-   **AI Integration:** Google Gemini API (`gemini-2.5-flash`, `gemini-2.5-pro`) for:
    -   Streaming text responses
    -   Multimodal (image/video) analysis
    -   Web-grounded knowledge base generation
    -   Live audio conversation
-   **Styling:** Tailwind CSS for a utility-first design system.
-   **Web APIs:**
    -   **Web Speech API:** For voice-to-text dictation.
    -   **Web Audio API:** For Text-to-Speech (TTS) and live audio processing.
    -   **LocalStorage:** For client-side session storage.
-   **Deployment:** Configured for static site hosting platforms (e.g., Vercel, Netlify, Render).

## 🚀 Getting Started (Local Development)

To run this project on your local machine, follow these steps.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or newer recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/rotary-mechanic.git
    cd rotary-mechanic
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    This application requires a Google Gemini API key.

    -   Create a file named `.env` in the project root.
    -   Add your API key to the file:
        ```
        GEMINI_API_KEY="YOUR_API_KEY_HERE"
        ```
    -   You can get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or the next available port).

## 📂 Project Structure

The codebase is organized to be modular and maintainable:

```
/src
├── components/     # Reusable React components (Header, Sidebar, Message, etc.)
├── context/        # React Context providers (ThemeContext)
├── data/           # Static data like technical term definitions
├── hooks/          # Custom React hooks (useSpeechRecognition, useTTSPlayer)
├── pages/          # Top-level page components for each route
├── services/       # API interaction logic (geminiService.ts)
└── types.ts        # TypeScript type definitions (Session, Message, etc.)
```

## 🔐 Privacy & Data

This application is designed with user privacy as a priority:
-   **Local Data Storage:** All your diagnostic chats, including messages and uploaded media previews, are stored **only in your browser's local storage**. This data is never sent to or stored on a server controlled by this application.
-   **API Calls:** When you send a message, its content (text and media) is sent to the Google Gemini API for processing. Please refer to [Google's Privacy Policy](https://policies.google.com/privacy) for how they handle data.

For more details, see the in-app Privacy Policy page.

## 🤝 Contributing

Contributions are welcome! Whether it's reporting a bug, suggesting a feature, or submitting a pull request, your input is valued. Please read our [**Contributing Guidelines**](./CONTRIBUTING.md) for more details on how to get started.

## 📄 License

This project is open-source and available under the MIT License. (Note: A formal `LICENSE` file should be added to the repository).
