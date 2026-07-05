# ViaHer

> Fast when it matters. Safe when it counts.

ViaHer is an AI-powered navigation platform built for solo travelers — designed with women's safety in mind. Instead of optimizing only for speed, ViaHer adds a safety intelligence layer on top of OpenStreetMap routing data, weighing every road segment on how safe it actually is to travel, not just how fast.

This is a working prototype demonstrating a full-stack safety-routing pipeline: real road network data, a custom scoring model, and a live route comparison — not a mockup.

---

## What It Does

### Dual-Route Comparison
For any origin and destination, ViaHer computes two routes over the real road network and renders them on an interactive map:

- **Fastest Route** — the shortest-time path
- **ViaHer Safe Route** — a path selected by weighing travel time against a custom Dynamic Safety Score, not just distance

Each route comes back with distance, duration, and its average safety score, so the trade-off between speed and safety is visible at a glance instead of hidden behind a black box.

### Dynamic Safety Scoring
Every road segment in the network is scored from 0–100 using a combination of:

- **Road classification** — main roads and commercial corridors score higher than isolated residential or service roads
- **Lighting data** — verified street lighting raises a segment's score; unlit segments are penalized
- **Lane capacity** — wider, multi-lane roads imply more visibility and passive surveillance
- **Time of day** — the same road scores differently at 10 AM than at 11 PM; scores are recalculated per request against a time-of-day multiplier

This isn't a static heatmap. The score is computed fresh for the exact route and exact hour of the request, layering a rule-based engine with a trained gradient-boosted model (XGBoost) on top of the road network.

### Explainable Routing
Rather than asking users to trust the algorithm blindly, ViaHer generates a plain-language breakdown of *why* a route was chosen — lighting quality, road type, and time-of-day context — so the reasoning is transparent, not just the output.

### SOS Alerts
A one-tap emergency action that captures live location, battery level, current route, and ETA, and pushes it to the user's trusted contacts in real time.

### Trusted Contacts
Users can maintain a list of trusted contacts who receive SOS alerts — added, listed, and removed through a simple contacts system tied to each account.

---

## Tech Stack

**Frontend** — React (Vite) · TypeScript · Tailwind CSS · Zustand · Leaflet

**Backend** — FastAPI · SQLAlchemy · OSMnx · NetworkX · XGBoost · scikit-learn

**Data** — PostgreSQL (PostGIS-ready) · Redis · OpenStreetMap

---