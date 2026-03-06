# BlockMind AI

**BlockMind AI** is a Secure Enterprise RAG (Retrieval-Augmented Generation) Chatbot designed to act as a Blockchain Domain Expert. Built with React and Vite, the application utilizes the Google Generative AI API to accurately answer questions related to blockchain technology based on its internal knowledge base.

## Features

- **Blockchain Domain Expert:** Provides accurate and structured answers to your blockchain-related queries.
- **RAG Architecture:** Leverages a Retrieval-Augmented Generation approach to find contextually relevant information before generating a response.
- **Real-time Streaming:** Streams AI responses token-by-token for a fast, interactive chat experience.
- **Structured Explanations:** Automatically formats responses into four clear sections:
  - Definition
  - Technical Explanation
  - Example
  - Security / Limitations
- **Modern UI/UX:** A clean, responsive chat interface showcasing dynamic conversation flows, loading states, and embedded `lucide-react` icons.

## Tech Stack

- **Frontend Framework:** React 19, Vite
- **AI Integration:** `@google/generative-ai` (Google Gemini API)
- **Icons:** `lucide-react`
- **Other Utilities:** `string-similarity` for RAG matching algorithms.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A valid Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Arun597134/LLM-Workshop.git
   cd LLM-Workshop
   ```
*(Note: If you are already inside the cloned project, switch to the `blockmind-ai` directory!)*

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root of your project directory and add your Gemini API Key:
   ```env
   VITE_GEMINI_API_KEY="your_actual_api_key_here"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`) to start chatting with BlockMind AI!
