export const MOCK_DONATIONS = [
  {
    id: "d1",
    item: "Children's winter clothing (bundle)",
    category: "clothing",
    donatedBy: "Meera T.",
    quantity: "1 bundle (~10 items)",
    pickupOrDrop: "Can drop off at any partner NGO",
  },
  {
    id: "d2",
    item: "Toothpaste, soap, sanitary pads",
    category: "hygiene",
    donatedBy: "Vikram J.",
    quantity: "Box of assorted essentials",
    pickupOrDrop: "Needs pickup from home",
  },
  {
    id: "d3",
    item: "Used school bags & stationery",
    category: "education",
    donatedBy: "Sana R.",
    quantity: "5 bags, mixed stationery",
    pickupOrDrop: "Can drop off at any partner NGO",
  },
];

export function fetchDonations() {
  return new Promise((resolve) => {
    setTimeout(() => {
      let posted = [];
      try {
        posted = JSON.parse(window.localStorage.getItem("aidlink_posted_donations") || "[]");
      } catch {
        posted = [];
      }
      resolve([...posted, ...MOCK_DONATIONS]);
    }, 600);
  });
}

export function makeDonationFromForm(form) {
  return {
    id: `local-${Date.now()}`,
    item: form.item,
    category: form.category,
    donatedBy: form.donatedBy || "You",
    quantity: form.quantity,
    pickupOrDrop: form.pickupOrDrop,
  };
}
