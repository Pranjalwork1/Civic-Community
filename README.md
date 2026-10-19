# Civic-Community (CivicSignal)

> Community-powered civic issue reporting and collective action platform with real geotagged photo capture.

[![Live on Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://civic-community-wine.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Civic--Community-181717?logo=github)](https://github.com/Pranjalwork1/Civic-Community)

---

## 🌐 Live Deployments

- **Production App:** [https://civic-community-wine.vercel.app](https://civic-community-wine.vercel.app)
- **GitHub Repository:** [https://github.com/Pranjalwork1/Civic-Community](https://github.com/Pranjalwork1/Civic-Community)

---

## ✨ Key Features

1. **Real Geotagged Camera Capture:**
   - Real-time device camera stream utilizing `navigator.mediaDevices.getUserMedia` with mobile rear-camera preference (`facingMode: 'environment'`).
   - Authentic frame capture from live video onto high-resolution HTML5 canvas.
   - Dual evidence preservation: retains both original raw photograph and generated geotagged evidence variant.
   - Professional geotag overlay displaying CivicSignal branding, exact coordinates (`lat° N, lng° E`), resolved locality, landmark, local capture timestamp, and GPS accuracy.
   - Privacy protection control: optional toggle to exclude reporter name from visible public overlay.

2. **Accurate Geolocation & Reverse Geocoding:**
   - Browser Geolocation API integration with rate-limited OpenStreetMap Nominatim reverse geocoding.
   - User-editable landmarks and draggable interactive map pin.
   - Clear distinction between device GPS, geocoded addresses, and manual pin selections.

3. **4-Step Incident Reporting Wizard:**
   - **Step 1: Capture Evidence:** Live camera feed, gallery upload fallback, original vs. geotagged preview switcher.
   - **Step 2: Confirm Location:** OpenStreetMap pin placement, neighborhood search, editable nearest landmark.
   - **Step 3: Add Details:** Title, category, severity rating, and description.
   - **Step 4: Review & Publish:** Full side-by-side or toggled review of original vs. geotagged photo and verified metadata.

4. **Community Incident Feed & Action Rooms:**
   - Neighborhood problem exploration feed with distance filtering.
   - Interactive civic gestures: *Witnessed*, *Affected*, *Still Happening*, *Can Help*.
   - Community rooms for collective petition signing and official complaint dispatches.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite 6
- **Styling:** Custom Modular CSS with rich dark-mode overlays and glassmorphism
- **Mapping:** Leaflet & OpenStreetMap
- **Icons:** Lucide React
- **Storage:** IndexedDB for local high-resolution media persistence
- **Hosting:** Vercel

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Pranjalwork1/Civic-Community.git

# Navigate into project directory
cd Civic-Community

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Building for Production

```bash
# Build the production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📄 License

MIT
