// firebase-messaging-sw.js

/**
 * Firebase Cloud Messaging Service Worker
 * - Handles background push notifications
 * - Supports:
 *    - Data-only messages
 *    - Action buttons (URL or ID-based)
 *    - CTAs mapping action -> URL
 *    - DLR (Delivery Receipt) tracking for received, clicked, dismissed events
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
// DLR (Delivery Receipt) IndexedDB Helper
// Stores DLR events for the main app to process
// --------------------------------------------------
const DLR_DB_NAME = "WebSDK_DLR_SW";
const DLR_DB_VERSION = 1;
const DLR_STORE_NAME = "pending_dlr_events";

/**
 * Open DLR IndexedDB database
 */
function openDLRDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DLR_DB_NAME, DLR_DB_VERSION);

    request.onerror = () => {
      console.error("[FCM SW] Failed to open DLR database:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(DLR_STORE_NAME)) {
        const store = db.createObjectStore(DLR_STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("type", "type", { unique: false });
        console.log("[FCM SW] DLR database store created");
      }
    };
  });
}

/**
 * Store DLR event in IndexedDB for main app to process
 * @param {string} type - Event type: 'received', 'clicked', or 'dismissed'
 * @param {object} data - Notification data containing messageId, campaignId, etc.
 */
async function storeDLREvent(type, data) {
  try {
    const db = await openDLRDatabase();

    const dlrEvent = {
      type: type,
      messageId: data.messageId || "",
      scope: data.scope || "",
      campaignId: data.campaignId || "",
      variationId: data.variationId || "",
      senderId: data.senderId || "",
      cuid: data.cuid || "",
      accountId: data.accountId || "",
      timestamp: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DLR_STORE_NAME], "readwrite");
      const store = transaction.objectStore(DLR_STORE_NAME);
      const request = store.add(dlrEvent);

      request.onerror = () => {
        console.error("[FCM SW] Failed to store DLR event:", request.error);
        db.close();
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log("[FCM SW] DLR event stored:", type, dlrEvent.messageId);
        db.close();
        resolve();
      };
    });
  } catch (error) {
    console.error("[FCM SW] Error storing DLR event:", error);
  }
}

/**
 * Notify main app that there are pending DLR events
 * Uses postMessage to all clients
 */
async function notifyMainAppOfDLREvents() {
  try {
    const allClients = await clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });

    for (const client of allClients) {
      client.postMessage({
        type: "HYDRA_DLR_EVENTS_PENDING",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("[FCM SW] Error notifying main app:", error);
  }
}

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
      // DLR-related fields
      scope: data.scope,
      campaignId: data.campaignId,
      variationId: data.variationId,
      senderId: data.senderId,
      cuid: data.cuid,
      accountId: data.accountId,
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

  // Track DLR: notification received
  // Use tag as messageId for consistency across received/clicked/dismissed
  const dlrData = {
    messageId: tag,
    scope: data.scope,
    campaignId: data.campaignId,
    variationId: data.variationId,
    senderId: data.senderId,
    cuid: data.cuid,
    accountId: data.accountId,
  };

  // Store DLR event and show notification
  return storeDLREvent("received", dlrData)
    .then(() => notifyMainAppOfDLREvents())
    .then(() => self.registration.showNotification(title, notificationOptions))
    .catch((error) => {
      console.error("[FCM SW] Error in DLR tracking:", error);
      // Still show notification even if DLR fails
      return self.registration.showNotification(title, notificationOptions);
    });
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

  // Track DLR: notification clicked
  const dlrData = {
    messageId: notification.tag || "",
    scope: data.scope,
    campaignId: data.campaignId,
    variationId: data.variationId,
    senderId: data.senderId,
    cuid: data.cuid,
    accountId: data.accountId,
  };

  event.waitUntil(
    storeDLREvent("clicked", dlrData)
      .then(() => notifyMainAppOfDLREvents())
      .then(() => clients.openWindow(urlToOpen))
      .then((client) => {
        if (client) {
          console.log("[FCM SW] Window opened");
        } else {
          console.warn("[FCM SW] Window did not open");
        }
      })
      .catch((error) => {
        console.error("[FCM SW] Error in click handler:", error);
        // Still try to open window even if DLR fails
        return clients.openWindow(urlToOpen);
      })
  );
});

// --------------------------------------------------
// Handle notification close (dismiss)
// --------------------------------------------------
self.addEventListener("notificationclose", (event) => {
  const notification = event.notification;
  const data = notification.data || {};

  console.log("[FCM SW] Notification dismissed");
  console.log("[FCM SW]   - Campaign ID:", data.campaignId || "N/A");
  console.log("[FCM SW]   - Tag:", notification.tag);

  // Track DLR: notification dismissed
  const dlrData = {
    messageId: notification.tag || "",
    scope: data.scope,
    campaignId: data.campaignId,
    variationId: data.variationId,
    senderId: data.senderId,
    cuid: data.cuid,
    accountId: data.accountId,
  };

  event.waitUntil(
    storeDLREvent("dismissed", dlrData)
      .then(() => notifyMainAppOfDLREvents())
      .catch((error) => {
        console.error("[FCM SW] Error tracking dismiss DLR:", error);
      })
  );
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
