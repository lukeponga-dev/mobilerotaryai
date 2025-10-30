# Rotary Mechanic

![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite)
![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-8E75B1?logo=google-gemini)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?logo=tailwind-css)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

Rotary Mechanic is a specialized, mobile-first diagnostic assistant for Mazda RX-8 owners. Powered by the Google Gemini API, it leverages expert knowledge from workshop manuals and community best practices to help users troubleshoot, diagnose, and understand the unique complexities of the Renesis rotary engine.

---

## Key Features

- **AI-Powered Diagnostics:** Get expert-level advice by describing issues through text, speech, images, or videos.
- **Multimodal Input:**
  - **Text & Speech:** Describe your issue or use the microphone for voice-to-text input.
  - **Image Analysis:** Upload photos of engine components, warning lights, or fluid leaks.
  - **Video Analysis:** Upload short clips of engine sounds, startup behavior, or exhaust smoke.
- **Session Management:** All diagnostic sessions are saved locally on your device for easy access and review.
- **Context-Aware Summaries:** The AI maintains a running summary of diagnosed symptoms, parts, and actions for each session.
- **Built-in Knowledge Base:** Quickly access articles on the most common RX-8 issues, from engine flooding to ignition coil failure.
- **Responsive & Mobile-First:** A clean, modern interface that works seamlessly on all devices, with full dark mode support.
- **Export to PDF:** Save a complete transcript of your diagnostic session as a PDF for your records or to share with a mechanic.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **AI Integration:** Google Gemini API (`gemini-2.5-flash`, `gemini-2.5-pro`) for streaming responses, title generation, and context extraction.
- **Styling:** Tailwind CSS for a utility-first design system.
- **Web APIs:**
  - **Web Speech API:** For voice-to-text dictation.
  - **LocalStorage:** For client-side session storage.
- **Deployment:** Configured for static site hosting platforms like Vercel, Netlify, or Render.

## Local Development

To run this project on your local machine, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

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
    You need a Google Gemini API key to run this application.

    - Create a file named `.env` in the root of the project.
    - Add your API key to the file like this:
      ```
      GEMINI_API_KEY="YOUR_API_KEY_HERE"
      ```
    - You can get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:5173` (or the next available port).

## Project Structure

The codebase is organized to be modular and maintainable:

```
/src
├── components/     # Reusable React components (Header, Sidebar, Message, etc.)
├── context/        # React Context providers (ThemeContext)
├── hooks/          # Custom React hooks (useSpeechRecognition)
├── pages/          # Top-level page components for each route
├── services/       # API interaction logic (geminiService.ts)
└── types.ts        # TypeScript type definitions (Session, Message, etc.)
```

## Privacy & Data

This application is designed with user privacy in mind:
- **Local Data Storage:** All your diagnostic chats, including messages and uploaded media previews, are stored **only in your browser's local storage**. This data is never sent to or stored on a server controlled by this application.
- **API Calls:** When you send a message, the content (text and media) is sent to the Google Gemini API for processing. Please refer to [Google's Privacy Policy](https://policies.google.com/privacy) for more information on how they handle data.
- For more details, see the in-app Privacy Policy page or the `privacy-policy.md` file in this repository.