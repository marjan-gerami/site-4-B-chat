# Vita — React experiment prototype

Four experimental conditions from a shared React/Vite/TypeScript codebase.

## Run

```bash
npm install
npm run dev
npm run build
```

## Four URLs

- `/a-no-chat`
- `/a-chat`
- `/b-no-chat`
- `/b-chat`

Alternatively `/?variant=a-chat` etc. For Vercel, import this Vite repository; SPA rewrites are provided in `vercel.json`.

## Current limits

- This is a **prototype**. No backend or persisted orders; reloading resets cart and form.
- The chatbot is an explicitly labeled **placeholder**, not an LLM. Do not use chatbot conditions in the study until server-side LLM integration is complete.
- Watches are CSS illustrations, not real product photography.
- The A/B manipulation and wording require final methodological sign-off.
- No analytics or real payment is implemented.
- Do not collect real personal data in the trial form; replace with dummy data instructions before recruiting participants.

## LLM integration

Use a server-side API route or Vercel Function with a secret environment variable. Never put the API key in a `VITE_` variable or client code. Keep product facts identical across both chat-enabled versions.

## Chat API and Vercel deployment

- `/api/chat` is a Vercel serverless function. It requires `OPENAI_API_KEY` as a **server-side** Vercel environment variable. Optional `OPENAI_MODEL` defaults to `gpt-4o-mini`.
- The assistant sends recent conversation messages to the model API. Do not include identifying participant information in chat. Obtain appropriate consent before use.
- Local `vite dev` does **not** serve Vercel functions; for local API testing use `vercel dev` with environment variables configured, or deploy a preview.
- Deploy the repository as a Vite project in Vercel. The four paths are `/a-no-chat`, `/a-chat`, `/b-no-chat`, `/b-chat`.
- The checkout form is a local simulation only. Use fabricated data. No real orders are persisted.
- IMPORTANT: the React production build has **not** been verified in this environment because `npm install` timed out. Run `npm install && npm run build` before launch.
