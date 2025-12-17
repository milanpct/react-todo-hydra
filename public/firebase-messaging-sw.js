// firebase-messaging-sw.js

/**
 * Firebase Cloud Messaging Service Worker
 * - Handles background push notifications
 * - Supports:
 *    - Data-only messages
 *    - Action buttons (URL or ID-based)
 *    - CTAs mapping action -> URL
 */

importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

// --------------------------------------------------
// Firebase config
// --------------------------------------------------
firebase.initializeApp({
  apiKey: "AIzaSyCRVUaZrXJApXpt8Y2NhVZitqMxEm_I_8A",
  authDomain: "hydraexample-2e017.firebaseapp.com",
  databaseURL: "https://hydraexample-2e017-default-rtdb.firebaseio.com",
  projectId: "hydraexample-2e017",
  storageBucket: "hydraexample-2e017.appspot.com",
  messagingSenderId: "475210831036",
  appId: "1:475210831036:web:32954661d8deb124576cb9",
  measurementId: "G-C3TRBSEFBV",
});

const messaging = firebase.messaging();
console.log("[FCM SW] Initialized");

// --------------------------------------------------
// Handle background messages (tab closed / in bg)
// --------------------------------------------------
messaging.onBackgroundMessage((payload) => {
  console.log("[FCM SW] ===== BACKGROUND MESSAGE =====");
  console.log("[FCM SW] Raw payload:", JSON.stringify(payload, null, 2));

  const data = payload.data || {};

  // Notification UI fields (we trust data only)
  const title = data.title || "New Notification";
  const body = data.body || "";
  const icon = data.icon || "/logo192.png";
  const image = data.image;
  const badge = data.badge || "/logo192.png";
  const tag = data.tag || `hydra-${payload.fcmMessageId || Date.now()}`;

  // Where to go on normal click (no action button)
  const clickUrl =
    data.redirectUrl || // preferred
    data.link ||
    data.url ||
    "/";

  console.log("[FCM SW] Base click URL:", clickUrl);

  // Parse CTAs: [{ action, actionLink }]
  let ctaActions = [];
  if (data.ctas) {
    try {
      ctaActions =
        typeof data.ctas === "string" ? JSON.parse(data.ctas) : data.ctas;
      console.log("[FCM SW] Parsed CTAs:", ctaActions);
    } catch (e) {
      console.error("[FCM SW] Failed to parse CTAs:", e);
    }
  }

  // Parse actions for notification buttons
  // examples:
  // 1) [{ action: "https://www.zoho.com/", title: "Zoho" }]
  // 2) [{ action: "action_1", title: "Alpha" }]
  let actions = [];
  if (data.actions) {
    try {
      actions =
        typeof data.actions === "string"
          ? JSON.parse(data.actions)
          : data.actions;
      console.log("[FCM SW] Parsed actions:", actions);
    } catch (e) {
      console.error("[FCM SW] Failed to parse actions:", e);
    }
  }

  const notificationOptions = {
    body,
    icon,
    image,
    badge,
    tag,
    renotify: false,
    vibrate: [200, 100, 200],
    data: {
      clickUrl,
      ctaActions,
      actions,
      campaignId: data.campaignId,
      cuid: data.cuid,
      accountId: data.accountId,
      variationId: data.variationId,
      originalData: data,
    },
  };

  if (actions.length > 0) {
    notificationOptions.actions = actions.map((a) => ({
      action: a.action,
      title: a.title,
      icon: a.icon, // optional, often undefined
    }));
    console.log(
      "[FCM SW] Actions set on notification:",
      notificationOptions.actions
    );
  }

  console.log("[FCM SW] Showing notification:", title);

  return self.registration.showNotification(title, notificationOptions);
});

// --------------------------------------------------
// Handle notification click
// --------------------------------------------------
self.addEventListener("notificationclick", (event) => {
  console.log("[FCM SW] ===== NOTIFICATION CLICK =====");

  const notification = event.notification;
  const action = event.action; // empty string when body clicked
  const data = notification.data || {};

  notification.close();

  console.log("[FCM SW] Action clicked:", action || "(main body)");

  let urlToOpen = data.clickUrl || "/";
  const ctaActions = data.ctaActions || [];
  const buttonActions = data.actions || [];

  // 1️⃣ If the action *itself* is a URL ⇒ open directly
  if (action && /^https?:\/\//i.test(action)) {
    console.log("[FCM SW] Action is URL, opening directly:", action);
    urlToOpen = action;
  }
  // 2️⃣ Else, try to resolve via CTAs
  else if (action && ctaActions.length > 0) {
    const matchedCta = ctaActions.find((cta) => cta.action === action);
    if (matchedCta && matchedCta.actionLink) {
      console.log("[FCM SW] Matched CTA actionLink:", matchedCta.actionLink);
      urlToOpen = matchedCta.actionLink;
    } else {
      console.log("[FCM SW] No CTA match, using default clickUrl:", urlToOpen);
    }
  }
  // 3️⃣ Else (no action button or no match) → use default clickUrl
  else {
    console.log("[FCM SW] Using default clickUrl:", urlToOpen);
  }

  // Ensure URL is absolute
  try {
    if (!/^https?:\/\//i.test(urlToOpen)) {
      urlToOpen = new URL(urlToOpen, self.location.origin).href;
    }
  } catch (e) {
    console.error(
      "[FCM SW] Invalid URL, falling back to origin:",
      urlToOpen,
      e
    );
    urlToOpen = self.location.origin;
  }

  console.log("[FCM SW] Opening URL:", urlToOpen);

  event.waitUntil(
    clients.openWindow(urlToOpen).then((client) => {
      if (client) {
        console.log("[FCM SW] Window opened");
      } else {
        console.warn("[FCM SW] Window did not open");
      }
    })
  );
});

// --------------------------------------------------
// Handle notification close (dismiss)
// --------------------------------------------------
self.addEventListener("notificationclose", (event) => {
  const data = event.notification.data || {};
  console.log("[FCM SW] Notification dismissed");
  console.log("[FCM SW]   - Campaign ID:", data.campaignId || "N/A");
  console.log("[FCM SW]   - Tag:", event.notification.tag);
});

// --------------------------------------------------
// Service worker lifecycle
// --------------------------------------------------
self.addEventListener("install", (event) => {
  console.log("[FCM SW] Installing...");
  // No skipWaiting: let it activate normally on next load
});

self.addEventListener("activate", (event) => {
  console.log("[FCM SW] Activating...");
  // No clients.claim: avoid extra OS "updated in background" noise
});

// --------------------------------------------------
// Messages from main app (optional)
// --------------------------------------------------
self.addEventListener("message", (event) => {
  console.log("[FCM SW] Message from app:", event.data);
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
