# AidLink — Landing + Auth + Browse App

This folder is a small Vite project with **two entry points**:

- `index.html` — the landing page (static HTML/CSS/JS, loads first)
- `app.html` — the React app: intro animation, login/signup, and now a full
  browsing experience with routing (`src/App.jsx`)

## Routes (inside app.html, using React Router)

| Path | What it is | Syllabus topic |
|---|---|---|
| `/` | Intro animation → login (now with a "Continue as" role picker: Citizen / NGO / Restaurant, since there's no backend yet to look up an existing account's role) | base route |
| `/signup` | Intro animation → signup wizard | base route |
| `/browse` | Food listings, fetched via `useEffect` + async. NGO-role logins see no photos — only text details (packed/unpacked, quantity, expiry, pickup window) | list + conditional rendering |
| `/food/:id` | One listing's detail page (same NGO photo-hiding rule) | **dynamic route** (`useParams`) |
| `/post-food` | Restaurant form to post surplus food — packed/unpacked, veg/non-veg/both, quantity + unit, expiry, pickup window, optional photo | protected route, forms |
| `/requests` | Anyone can browse community needs (non-food) and post their own ("I need X") | list + form |
| `/donate` | Anyone can browse and offer non-food donations (clothing, hygiene, education supplies, etc.) for NGOs | list + form |
| `/dashboard` | Sidebar layout, protected | **protected route** |
| `/dashboard` (index) | Overview stats | **nested route** |
| `/dashboard/posts` | Your posted listings | **nested route** |
| anything else | 404 page | wildcard route |

Routing uses `HashRouter` (URLs look like `app.html#/browse`), so it works
on any static host without server-side rewrite rules — important since
`app.html` is a separate file from `index.html`, not one single-page app.

## New posting/requests/donations features

- **Post food** (`src/pages/PostFoodPage.jsx`) — a restaurant fills in:
  packed vs. unpacked, veg/non-veg/both, quantity + unit, when it expires,
  the pickup window, and an optional photo. Submitted listings are saved to
  `localStorage` (`aidlink_posted_listings`) and merged into Browse.
- **NGO accounts see no photos** — `BrowsePage.jsx` and `FoodDetailPage.jsx`
  check `user.role === "ngo"` and replace the image with a text placeholder.
  Since there's no real backend yet, role comes from the "Continue as"
  picker on the login screen — swap this for a real role lookup once the
  database side is built.
- **Requests** (`src/pages/RequestsPage.jsx`) — any logged-in user (typically
  a common citizen) can post a need for something other than food — an
  item, their location, and urgency — and everyone can browse open needs.
- **Donate** (`src/pages/DonatePage.jsx`) — citizens can offer non-food
  essentials (clothing, hygiene items, school supplies, etc.) to NGOs, with
  pickup or drop-off noted. Linked from both the landing page's top nav and
  the in-app header.

## Other topics now covered

- **`useEffect` + `fetch`-style async data loading** — `BrowsePage.jsx` and
  `FoodDetailPage.jsx` simulate a network call (`src/data/listings.js`,
  `fetchListings()`), with loading / error / empty states.
- **Custom hooks** — `useLocalStorage` (generic persisted state) and
  `useAuth` (built on top of it) live in `src/hooks/`.
- **Browser storage** — logging in saves the user to `localStorage` under
  `aidlink_user`; refreshing the page keeps you logged in; logging out
  clears it.
- **`useCallback`** — used in `BrowsePage.jsx` (claim handler) and
  `AppHeader.jsx` (logout handler).
- **List rendering + conditional rendering** — `.map()` over listings, plus
  loading/empty/error branches.

## Real map + distance — Leaflet, Geolocation, Nominatim

This is the first *real* external API integration in the project (everything
before this was mock data / localStorage). Three things work together:

- **Browser Geolocation API** (`src/hooks/useGeolocation.js`) — asks for your
  real location when you open Browse or a listing's detail page. If you deny
  it or it's unavailable, it falls back to a fixed Chandigarh city-center
  point so distances still compute.
- **Haversine formula** (`src/utils/geo.js`) — calculates real straight-line
  distance in km between your location and each listing's coordinates. This
  was the distance-matching approach in the original AidLink blueprint.
- **OpenStreetMap Nominatim** (`src/utils/geocode.js`) — when a restaurant
  posts a listing on `/post-food`, the pickup address they type is sent to
  Nominatim's free geocoding API to get real map coordinates. No API key
  needed, no signup required.
- **Leaflet + OpenStreetMap tiles** (`src/components/ListingsMap.jsx`) — a
  real interactive map (pan/zoom) on Browse (toggle "List"/"Map") and on
  each listing's detail page, showing your location and every listing's pin.

Listings are sorted by real distance (nearest first) instead of a fixed
mock number.

## How to run it (do NOT just double-click the files)

`app.html` loads `.jsx` files, which need to be compiled by Vite — you must
run a dev server:

1. Install [Node.js](https://nodejs.org/) if you don't have it.
2. In a terminal, inside this folder:
   ```
   npm install
   npm run dev
   ```
3. Open the printed URL (usually `http://localhost:5173/`) — that's the
   landing page. Log in with anything (it's mock auth) to reach `/browse`.

## Building for deployment

```
npm run build
```

Outputs both pages into `dist/` (`dist/index.html`, `dist/app.html`) as
static files — upload to any static host.

