# Honda OBD Backend

A Node.js + Express REST API that looks up Honda OBD-II error codes from a local CSV database, serves the frontend UI, and securely delivers a Google Maps API key to the client at runtime.

---

## Setup

```bash
npm install
npm start
```

Server runs at `http://localhost:3000` by default.

---

## Environment Variables

The following environment variables must be set before running the server.

| Variable | Description |
|---|---|
| `MAPS_API_KEY` | Your Google Maps Embed API key |
| `PORT` | (Optional) Port to run the server on. Defaults to `3000` |

**Locally:** Create a `.env` file in the `backend/` directory:
MAPS_API_KEY=your_key_here

**On Render:** Add `MAPS_API_KEY` directly in the Render dashboard under Environment → Environment Variables. Do not use a `.env` file in production — Render provides environment variables natively.

> **Important:** Never commit your `.env` file. It is listed in `.gitignore`. The API key is never hardcoded in any file or served directly in the HTML source.

---

## How the Google Maps API Key Works

The frontend never has direct access to the API key. The security pattern works as follows:

1. The API key is stored as a server-side environment variable on Render
2. The backend exposes it via a protected `/api/config` route
3. The frontend fetches the key from `/api/config` on page load and stores it in memory
4. The key is used to build the Google Maps Embed iframe URL dynamically

This means the key never appears in the HTML source, never appears in the GitHub repo, and is never exposed in the browser's view-source.

---

## API Endpoints

### `GET /`
Serves the frontend (`public/index.html`).

---

### `GET /health`
Health check. Confirms the server is running and returns the total number of OBD codes loaded.

**Response:**
```json
{
  "status": "running",
  "message": "Honda OBD Lookup API is live.",
  "totalCodes": 2000
}
```

---

### `GET /api/config`
Returns the Google Maps Embed API key for use by the frontend. The key is read from the `MAPS_API_KEY` environment variable server-side.

**Response:**
```json
{
  "mapsApiKey": "your_key_here"
}
```

---

### `GET /api/code/:code`
Look up a single OBD code passed as a URL parameter. Input is normalized automatically — lowercase, missing prefix, reversed order, and extra spaces are all handled.

**Example:**
GET /api/code/P0420
GET /api/code/p0420
GET /api/code/0420

**Response:**
```json
{
  "code": "P0420",
  "category": "Catalyst System",
  "summary": "Catalyst system efficiency below threshold...",
  "recommendedShop": "MP Motorwerks"
}
```

---

### `POST /api/code`
Same lookup via POST with a JSON body. Useful for form submissions.

**Request body:**
```json
{ "code": "P0420" }
```

---

### `GET /api/codes`
Returns every code in the database.

**Response:**
```json
{
  "total": 2000,
  "codes": [ ... ]
}
```

---

### `GET /api/categories`
Returns all unique fault categories.

**Response:**
```json
{
  "total": 42,
  "categories": ["Catalyst System", "Fuel pressure / fuel pump", ...]
}
```

---

### `GET /api/codes/category/:category`
Returns all codes in a specific category. Category name must be URL-encoded.

**Example:**
GET /api/codes/category/Fuel%20pressure%20%2F%20fuel%20pump

---

## Input Normalization

The `normalizeOBDCode()` helper handles fuzzy user input before any lookup:

| Input | Normalized |
|---|---|
| `p0420` | `P0420` |
| `0420` | `P0420` |
| `0420P` | `P0420` |
| `P 0 4 2 0` | `P0420` |

Valid codes must match the format: one letter (`P`, `B`, `C`, or `U`) followed by exactly 4 digits.

---

## Error Responses

| Status | Meaning |
|---|---|
| `400` | Bad input — invalid code format or missing field |
| `404` | Code or category not found in database |

---

## Deployment (Render)

1. Connect your GitHub repo to Render
2. Set **Root Directory** to `backend`
3. Set **Build Command** to `npm install`
4. Set **Start Command** to `node server.js`
5. Under **Environment**, add `MAPS_API_KEY` with your Google Maps Embed API key
6. Deploy — Render will auto-redeploy on every push to `main`

> Do **not** include `require('dotenv').config()` in `server.js` when deployed on Render. Render provides environment variables natively and `dotenv` is not needed in production.

Live URL: **obdme.onrender.com**

---

## Project Structure
backend/
├── public/
│   └── index.html        # Frontend UI (HTML + CSS + JS, all inline)
├── server.js             # Express server, route definitions, normalizeOBDCode()
├── dataLoader.js         # CSV parser & in-memory database builder
├── engine_codes.csv      # Honda OBD-II code database (2,000+ codes)
├── package.json
├── .gitignore            # Excludes node_modules/ and .env
└── README.md

---

## Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project and enable the **Maps Embed API**
3. Generate an API key and restrict it to the Maps Embed API
4. Add the key to your Render environment variables as `MAPS_API_KEY`
5. The key is never committed to GitHub — it lives only in Render's environment

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Frontend | HTML / CSS / JavaScript (no framework) |
| Database | CSV file loaded into memory at startup (O(1) lookup) |
| Maps | Google Maps Embed API |
| Hosting | Render (auto-deploy from GitHub) |
