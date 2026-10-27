export const MOCK_REQUESTS = [
  {
    id: "r1",
    title: "Baby formula for a newborn",
    postedBy: "Anjali S.",
    location: "Sector 14, Rajpura",
    urgency: "urgent",
    description: "Ran out unexpectedly overnight — any brand works, small tin is fine.",
  },
  {
    id: "r2",
    title: "Warm blankets for winter",
    postedBy: "Ramesh K.",
    location: "Near bus stand",
    urgency: "soon",
    description: "For a family of four sleeping rough near the bus stand this week.",
  },
  {
    id: "r3",
    title: "School notebooks & pencils",
    postedBy: "Fatima N.",
    location: "Model Town",
    urgency: "flexible",
    description: "For three kids starting the term without basic stationery.",
  },
];

export function fetchRequests() {
  return new Promise((resolve) => {
    setTimeout(() => {
      let posted = [];
      try {
        posted = JSON.parse(window.localStorage.getItem("aidlink_posted_requests") || "[]");
      } catch {
        posted = [];
      }
      resolve([...posted, ...MOCK_REQUESTS]);
    }, 600);
  });
}

export function makeRequestFromForm(form) {
  return {
    id: `local-${Date.now()}`,
    title: form.title,
    postedBy: form.postedBy || "You",
    location: form.location,
    urgency: form.urgency,
    description: form.description,
  };
}
