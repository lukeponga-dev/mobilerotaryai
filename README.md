# RotorWise AI

RotorWise AI is a specialized diagnostic assistant for Mazda RX-8 owners. It uses the Google Gemini API with expert knowledge from workshop manuals to help troubleshoot, diagnose, and understand the Renesis rotary engine through text, image, and voice inputs.

## Features

-   **Specialized Knowledge:** Trained on Mazda RX-8 workshop manuals and rotary engine best practices.
-   **Multimodal Input:** Accepts text, images (e.g., engine components, warning lights), and videos (e.g., engine sounds).
-   **Systematic Diagnosis:** Follows a structured approach to identify root causes and provide actionable solutions.
-   **Session Management:** Saves your diagnostic conversations locally for future reference.
-   **PDF Export:** Export your session history as a PDF report.

## Tech Stack

-   React
-   Vite
-   TypeScript
-   Tailwind CSS
-   Google Gemini API

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   A Google Gemini API Key

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/mobilerotaryai.git
    cd mobilerotaryai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    Create a `.env` file in the root of the project and add your Gemini API key:
    ```
    API_KEY="YOUR_API_KEY_HERE"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application should now be running on `http://localhost:5173`.

## Build for Production

To create a production build, run:
```bash
npm run build
```
This will generate a `dist` folder with the optimized static assets. You can preview the production build with `npm run preview`.
