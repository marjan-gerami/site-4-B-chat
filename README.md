# site-4-B-chat

Independent React + Vite site for Vita experiment. Architecture **B**, chatbot **enabled**. The architecture and chatbot condition are hardcoded, not selectable by URL.

## Run

```bash
npm install
npm run build
npm run dev
```

## Deploy

Upload the **contents of this directory** to its own GitHub repository. Import that repository as a separate Vercel project. Framework: Vite; build command: `npm run build`; output directory: `dist`.

Set OPENAI_API_KEY (and optionally OPENAI_MODEL) as server-side Vercel environment variables; then redeploy. Never commit secrets.

**Status:** Build and live LLM connection have not been verified. Order completion is a browser-only demo and does not persist to a backend.
