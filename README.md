# आलेखन सहायक / Aalekhan Sahayak

**A frontend for an agentic AI drafting assistant for Indian government officers.** This project was built for an AWS online build competition. The React application is our work; the drafting API and its backend agents are provided by the company/organizer and are not built or modified by this repository.

## Problem statement

Section Officers, Desk Officers, IAS/PCS officers and their teams handle daily correspondence, e-Office files, RTI replies and grievances. Preparing each formal Hindi or bilingual response in the right government format takes time and often requires formatting rework. Aalekhan Sahayak gives officers a familiar file-chat workspace to attach an incoming letter, provide an instruction and review a draft.

## What we built

- A responsive, WhatsApp Web-inspired React frontend for file threads, attachments and follow-up instructions.
- A Hindi-first composer with instruction templates, image/PDF upload, camera capture and browser speech input.
- Client-side Word (`.docx`) and print/PDF exports.
- A source-and-draft split view with a clearly labeled **reference check**. It checks whether extracted values appear in the draft; it does not claim that a source was verified.
- Backend audit and agent trace display, highlighted placeholders, case facts, timed progress and draft version comparison.
- Demo/mock mode, one-click sample-letter flow, presentation mode and a live architecture view.
- Client-side image downscaling, a 4 MB PDF limit and a 60-second API timeout.

## Provided backend (not built by us)

The company/organizer provides the backend behind an AWS Lambda Function URL. Its sequential drafting pipeline is:

1. **Sandarbh (संदर्भ):** extracts references and facts from the incoming document using Textract and Bedrock Vision.
2. **Prabandhak (प्रबंधक):** chooses a document format.
3. **Lekhan (लेखन):** prepares the draft using Amazon Bedrock.
4. **Samiksha (समीक्षा):** audits the format and facts.

The provided backend uses S3 for documents and DynamoDB for case memory. The frontend calls the documented JSON API; this repository does not include or change that backend.

## AWS services

| Group | Service | Responsibility |
| --- | --- | --- |
| Used by our frontend | Amplify Hosting | Builds and hosts this static React application. |
| Provided backend | Lambda Function URL | Receives the frontend's JSON requests. |
| Provided backend | Amazon Bedrock | Powers the drafting agents and document vision. |
| Provided backend | Amazon Textract | Extracts text and references from documents. |
| Provided backend | Amazon S3 | Stores incoming documents. |
| Provided backend | Amazon DynamoDB | Stores case/thread memory. |

## Features

- Create and search file threads; select Hindi, English or bilingual output.
- Upload PDFs and images, take a photo on supported mobile devices, or dictate instructions in Chrome/Edge.
- View timed progress for the four provided agents and review audit status, checks and trace details.
- Inspect extracted facts, placeholders, reference checks and successive draft versions.
- Copy the raw draft, download a Word document or print/save a PDF.
- Use one-click demo mode and optional presentation mode.
- Install the frontend on a supported Android device from the browser.

## Local setup

Requirements: Node.js 20+ and npm.

```sh
cp .env.example .env
npm install
npm run dev
```

On Windows PowerShell, the first command can be run as `Copy-Item .env.example .env`. Set the following values in `.env`:

```dotenv
VITE_API_URL=
VITE_USE_MOCK=false
VITE_MANUAL_MINUTES=30
```

`VITE_API_URL` is the provided backend's Lambda Function URL. It is intentionally blank in the example and must not be committed. The API URL is read only from this environment variable.

## Demo mode and sample letter

Set `VITE_USE_MOCK=true` in `.env` and restart the dev server to use two seeded Hindi threads and a three-second simulated response. No real API request is sent in mock mode. After consecutive real-service failures, the app also offers a non-blocking switch to demo mode for a recording.

The one-click sample-letter button fetches `/sample/incoming_letter.pdf`. **The team will place a fictional sample letter at `public/sample/incoming_letter.pdf`; that document is not included in this repository.** Until it is added, the app shows a friendly message. Do not use a real person's sensitive correspondence as the public demo document.

## Amplify deployment

1. Connect this repository and the intended branch to AWS Amplify Hosting.
2. Set `VITE_API_URL` as an Amplify environment variable before the build. Optionally set `VITE_USE_MOCK=false` and `VITE_MANUAL_MINUTES=30`.
3. Use the included `amplify.yml` build settings (`npm ci`, `npm run build`, artifacts from `dist`).
4. Add an Amplify Hosting rewrite rule for SPA fallback: source `/<*>`, destination `/index.html`, status `200`.
5. Redeploy after changing build-time environment variables.

The provided API must allow browser CORS requests from the deployed frontend origin. The frontend does not add authentication because none is in the API contract.

## CORS note

The frontend sends JSON-serialized request bodies with `Content-Type: text/plain;charset=UTF-8` and no other custom headers. This makes the browser request a simple request, avoiding the CORS preflight; the backend parses the body as JSON regardless of its content type.

## Responsible AI and review

- Drafts require human review and approval before signing or sending.
- The interface labels backend audit status and highlights `[placeholders]` that need completion.
- The UI does not claim to invent or independently verify facts. The split-view feature is only a text **reference check**.
- Officers should validate names, dates, rules, deadlines, enclosures and applicable department procedures against authoritative records.
- Uploaded documents are sent to the provided backend for processing. Do not upload sensitive documents unless their use is approved by the responsible department.

## Limitations

- This repository contains only the frontend. Live drafting depends on the separately provided API and its CORS configuration.
- PDF files larger than 4 MB are rejected; images are downscaled in the browser before upload.
- Reference checks use normalized text matching and are not source verification or a legal/factual guarantee.
- Browser speech recognition requires a supported browser and microphone permission.
- The frontend does not persist local drafts in browser storage and has no offline service worker.
- The application is a drafting aid, not legal advice or a replacement for departmental review.

## Phase 2 roadmap

- Department packs for Uttar Pradesh Awas Evam Vikas Parishad, PWD, Revenue and Health.
- Regional-language support through BHASHINI, subject to backend support and validation.
- Additional usability testing with officers and accessibility improvements informed by that feedback.

## Screenshots

<!-- TODO: Add screenshots of the welcome screen, draft card, case facts drawer and reference-check split view. -->

## Team

**Team members:** [Add team name and member names]

## License

This project is released under the MIT License. See [LICENSE](./LICENSE).
