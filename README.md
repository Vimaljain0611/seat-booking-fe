# Seat booking frontend

React + Vite + TypeScript client. Configure `.env` with `VITE_API_URL` set to the backend origin (no trailing slash), then run `npm install`, `npm run dev`. Build with `npm run build`.

## Netlify
Create a site rooted at `frontend`, build command `npm run build`, publish directory `dist`. Set `VITE_API_URL` to the Render service HTTPS origin. The client opens `wss://<backend>/ws` automatically and reconnects with exponential backoff.
