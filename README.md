# ✨ MCP-Gemini CLI Tools: Tweet Generator & Add-2-Numbers

A **command-line project** that uses **Gemini AI** and the **Model Context Protocol (MCP)** to demonstrate how to build and serve AI tools. This project includes:

- 🐦 A **Twitter Post Tool** that uses Gemini to generate tweet content and posts it directly to your X (formerly Twitter) account.
- ➕ An **Add-2-Numbers Tool** that performs simple numeric addition using Gemini's reasoning capabilities.

---

## 🔧 Tech Stack

- **Runtime**: Node.js
- **AI Model**: Google Gemini (via API key)
- **Protocol**: Model Context Protocol (MCP)
- **Transport**: `StreamableHTTPClientTransport` and `StreamableHTTPServerTransport`
- **API Integration**: Twitter/X API (v2)

---

## 🚀 Features

### 1. 🐦 Twitter/X Post Tool
- Prompts the user to enter a topic or phrase.
- Sends the prompt to Gemini, which generates tweet-like text.
- Posts the generated text to the user's X (Twitter) account using API keys.

### 2. ➕ Add-2-Numbers Tool
- Prompts the user to enter two numbers.
- Sends them to Gemini via MCP for addition.
- Displays the result in the terminal.

---

## Configure environment variables 

### server/.env: 
- TWITTER_API_KEY=...
- TWITTER_API_SECRET=...
- TWITTER_ACCESS_TOKEN=...
- TWITTER_ACCESS_TOKEN_SECRET=...

### client/.env: 
- GEMINI_API_KEY=...
