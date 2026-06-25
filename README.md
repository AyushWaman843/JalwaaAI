# Jalwaa AI 🌟 — Mumbai's Premium Salon & Spa Discovery Marketplace

> **A Next-Generation AI-Driven Hyperlocal Beauty Platform** built for the **SuperXgen AI Startup Buildathon 2026**.
> 
> **Live Demo Link:** [Jalwaa AI Marketplace](https://ais-pre-7uthffmcefszkott6buley-650677139329.asia-southeast1.run.app)  
> **Development Server:** [Jalwaa AI Development Console](https://ais-dev-7uthffmcefszkott6buley-650677139329.asia-southeast1.run.app)

---

## 🚀 The Vision

In a high-intensity metropolis like Mumbai, finding the perfect salon that matches your styling needs, hair texture, skin tone, and calendar shouldn't require endless phone calls or guesswork. 

**Jalwaa AI** is a fully functional full-stack startup platform designed to revolutionize the hyperlocal beauty ecosystem in Mumbai. By merging **live Google Maps scraping data** with **state-of-the-art vision-enabled AI style consulting**, and an **interactive QR-based real-time queue management system**, Jalwaa AI delivers an elite, frictionless experience for both beauty seekers and premium salon merchants.

---

## ✨ Core Features

### 1. 🤖 AI Style Muse (Groq-Powered Consultation)
*   **Facial and Skin Analysis:** Users can input their style criteria (hair type, skin tone, face shape, budget) or upload profile images.
*   **Ultra-Fast Intelligence:** Powered by **Groq Cloud API** running **Llama 3.3 70B (Versatile)** for text consultation and **Llama 3.2 11B (Vision-Preview)** for image-based style analysis.
*   **Intelligent Matchmaking:** The AI analyzes user styles and directly recommends real premium salons in Mumbai (e.g., BBlunt in Bandra West, JCB in Juhu) that specialize in those specific looks.

### 2. 📍 Authentic Hyperlocal Search (Apify Scraper Engine)
*   **Real Google Maps Data:** No fake mock placeholders. The platform integrates a real-time **Google Maps Scraper (via Apify)** to pull live Mumbai salons, ratings, physical addresses, contact details, and review counts.
*   **Smart Background Cache:** Implements robust server-side caching and dynamic client merging (with seed fallback data) to maintain blisteringly fast load times and zero network overhead.

### 3. 🎫 Dynamic QR Smart Queues & Instant Pass
*   **No More Waiting Rooms:** Users can select a premium treatment (classic haircuts, luxury facials, nail artistry) and instantly reserve a place in the salon’s active waitlist.
*   **Secure QR Booking:** Generates secure, high-contrast QR codes and unique Queue Numbers directly on a personalized booking pass.
*   **Interactive Checks:** Users can track live queue status (e.g. "Checked In", "In Service", "Completed") right from their dashboard.

### 4. 💼 Merchant & Partner Command Center
*   **Claim Your Business:** Local Mumbai salon owners can claim their listings, configure operational hours, adjust pricing, and add custom luxury packages.
*   **Front-Desk Queue Manager:** Real-time dashboard for merchants to advance waitlists, check-in guests using a **Live Web QR Code Scanner**, and send OTP booking confirmations.

---

## 🛠️ The AI Workflow & Architecture

```
[User Interface (Vite + React)]
       │
       ▼ (Fetch API Requests)
[Express proxy Server]
       │
       ├─► [Groq API Engine] ──► Llama 3.3 70B (Consultations & Salon Matchmaking)
       │                    ──► Llama 3.2 11B Vision (Image Style Analysis)
       │
       └─► [Apify Google Maps API] ──► Extracts Live Ratings, Addresses, & Reviews
```

### High-Performance Key Design:
1.  **Server-Side Secret Isolation:** All API interactions (Groq and Apify) are proxied server-side (`/api/groq/chat` and `/api/apify/search`) so that developer secret keys are never exposed to the client-side browser console.
2.  **Graceful API Fallbacks:** If API limits are reached, the system automatically merges results with pre-verified local seed files (`MUMBAI_SALONS_SEED`) to ensure the application stays fully functional with 100% uptime.

---

## 🎨 Design & UI/UX Excellence

*   **Elite Visual Identity (Burgundy & Charcoal):** Specifically designed with an elegant, high-contrast editorial theme combining deep premium burgundy (`#5C1329`), warm cream background canvas (`#F4F5ED`), and dark charcoal text lines (`#1F1D1A`) to evoke a high-end salon brand experience.
*   **Responsive Fluidity:** Beautifully hand-optimized for all viewport heights (mobile, tablets, and wide-desktop monitors) using Tailwind CSS.
*   **Micro-Animations:** Fluid state changes and soft transitions powered by `Framer Motion` for high interactive satisfaction.

---

## ⚙️ How to Run Locally

### 1. Clone & Install Dependencies
```bash
git clone <your-repository-url>
cd <repository-directory>
npm install
```

### 2. Configure Environment Secrets
Create a `.env` file in the root directory (using `.env.example` as a template):
```env
VITE_GROQ_API_KEY="your_groq_api_key_here"
VITE_APIFY_API_TOKEN="your_apify_api_token_here"
```

### 3. Launch Development Server
```bash
npm run dev
```
The application will boot up at `http://localhost:3000`.

---

## 🏆 Hackathon Judging Criteria Alignment

*   **Product Thinking:** Directly solves a massive, real-world friction point (long salon waitlists and unpersonalized style choices) in dense urban markets like Mumbai.
*   **UI/UX Design:** Implemented a unique, gorgeous, and brand-distinctive design system rather than relying on standard cookie-cutter layouts. Perfect visual readability and high color contrast.
*   **AI Usage & Innovation:** Uses advanced LLM and Vision combinations with context-injection to give personalized recommendations mapped back to *real-world location businesses*.
*   **Execution Quality:** Features clean TypeScript typing, reliable state syncing, fully modular code files, robust server-side proxy routes, and a complete end-to-end user-to-merchant workflow (from booking to QR scanning).

---

*Created with passion for the **SuperXgen AI Startup Buildathon 2026**.*
