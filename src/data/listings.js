import { geocodeAddress } from "../utils/geocode.js";

export const MOCK_LISTINGS = [
  {
    id: "1",
    title: "Paneer butter masala + naan",
    restaurant: "Kettle & Vine",
    address: "Sector 17, Chandigarh",
    lat: 30.7410,
    lng: 76.7821,
    packed: true,
    type: "veg",
    quantity: 12,
    unit: "servings",
    expiresAt: "Today, 9:30 PM",
    pickupWindow: "6:30 PM – 8:30 PM",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80&auto=format&fit=crop",
    description:
      "Fresh from tonight's dinner service — a full tray of paneer butter masala with extra naan, still warm at handover.",
  },
  {
    id: "2",
    title: "Vegetable biryani, family trays",
    restaurant: "Basil Bros",
    address: "Sector 35, Chandigarh",
    lat: 30.7186,
    lng: 76.7550,
    packed: true,
    type: "veg",
    quantity: 20,
    unit: "servings",
    expiresAt: "Today, 11:00 PM",
    pickupWindow: "9:00 PM – 10:00 PM",
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800&q=80&auto=format&fit=crop",
    description:
      "Closing-time surplus from a catering order that came in short. Packed in sealed trays, ready for pickup.",
  },
  {
    id: "3",
    title: "Grilled chicken + roasted veg",
    restaurant: "Harvest Room",
    address: "Sector 8, Chandigarh",
    lat: 30.7461,
    lng: 76.7920,
    packed: false,
    type: "non-veg",
    quantity: 8,
    unit: "servings",
    expiresAt: "Today, 9:00 PM",
    pickupWindow: "8:00 PM – 9:00 PM",
    image:
      "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&q=80&auto=format&fit=crop",
    description:
      "End-of-shift extras from today's lunch menu — grilled chicken thighs with a seasonal roasted vegetable mix.",
  },
  {
    id: "4",
    title: "Assorted bakery bread & pastries",
    restaurant: "Farmhouse Co.",
    address: "Sector 22, Chandigarh",
    lat: 30.7280,
    lng: 76.7730,
    packed: true,
    type: "veg",
    quantity: 15,
    unit: "servings",
    expiresAt: "Tomorrow, 8:00 AM",
    pickupWindow: "7:00 PM – 7:45 PM",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80&auto=format&fit=crop",
    description:
      "Unsold bread and pastries from today's bake — sourdough loaves, croissants, and a few dozen dinner rolls.",
  },
  {
    id: "5",
    title: "Chole + rice, bulk tray",
    restaurant: "GreenTable",
    address: "Sector 43, Chandigarh",
    lat: 30.7020,
    lng: 76.7480,
    packed: false,
    type: "veg",
    quantity: 25,
    unit: "servings",
    expiresAt: "Today, 11:15 PM",
    pickupWindow: "9:15 PM – 10:15 PM",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80&auto=format&fit=crop",
    description:
      "Large leftover batch from an event booking — chickpea curry with steamed rice, still sealed and food-safe.",
  },
];

/**
 * Simulates a network request. Also merges in anything a restaurant has
 * posted from this browser (stored in localStorage under aidlink_posted_listings),
 * so newly-posted listings show up in Browse without a real backend.
 */
export function fetchListings() {
  return new Promise((resolve) => {
    setTimeout(() => {
      let posted = [];
      try {
        posted = JSON.parse(window.localStorage.getItem("aidlink_posted_listings") || "[]");
      } catch {
        posted = [];
      }
      resolve([...posted, ...MOCK_LISTINGS]);
    }, 700);
  });
}

/**
 * Builds a listing from the post-food form. Geocodes the typed address via
 * OpenStreetMap Nominatim to get real coordinates; falls back to the
 * Chandigarh city center if geocoding fails so the listing still has a pin.
 */
export async function makeListingFromForm(form) {
  const geocoded = await geocodeAddress(form.address);
  const coords = geocoded || { lat: 30.7333, lng: 76.7794 };

  return {
    id: `local-${Date.now()}`,
    title: form.title,
    restaurant: form.restaurant,
    address: form.address,
    lat: coords.lat,
    lng: coords.lng,
    packed: form.packed === "packed",
    type: form.type,
    quantity: Number(form.quantity) || 0,
    unit: form.unit,
    expiresAt: form.expiresAt,
    pickupWindow: form.pickupWindow,
    description: form.description,
  };
}
