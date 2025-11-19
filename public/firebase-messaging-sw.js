/**
 * Firebase Cloud Messaging Service Worker
 *
 * This service worker handles background push notifications from Firebase Cloud Messaging.
 *
 * IMPORTANT: Replace the Firebase configuration below with your actual Firebase project credentials.
 */

// Import Firebase scripts for service worker
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

/**
 * Firebase Configuration
 * Hydra Example Project - Real Configuration
 */
const firebaseConfig = {
  apiKey: "AIzaSyCRVUaZrXJApXpt8Y2NhVZitqMxEm_I_8A",
  authDomain: "hydraexample-2e017.firebaseapp.com",
  databaseURL: "https://hydraexample-2e017-default-rtdb.firebaseio.com",
  projectId: "hydraexample-2e017",
  storageBucket: "hydraexample-2e017.appspot.com",
  messagingSenderId: "475210831036",
  appId: "1:475210831036:web:32954661d8deb124576cb9",
  measurementId: "G-C3TRBSEFBV",
};

// Initialize Firebase in the service worker
try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  console.log("[FCM Service Worker] Firebase initialized successfully");

  /**
   * Handle background messages
   * This is called when a notification is received while the app is in the background
   */
  messaging.onBackgroundMessage((payload) => {
    console.log("[FCM Service Worker] Received background message:", payload);

    // Extract notification details
    const notificationTitle = payload.notification?.title || "New Notification";
    const notificationOptions = {
      body: payload.notification?.body || "",
      icon: payload.notification?.icon || "/logo192.png",
      badge: payload.notification?.badge || "/logo192.png",
      image: payload.notification?.image,
      data: payload.data || {},
      tag: payload.notification?.tag || "hydra-notification",
      requireInteraction: false,
      // Additional options
      vibrate: [200, 100, 200],
      actions: [
        { action: "open", title: "Open", icon: "/logo192.png" },
        { action: "close", title: "Close", icon: "/logo192.png" },
      ],
    };

    // Show the notification
    return self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );
  });

  /**
   * Handle notification click events
   */
  self.addEventListener("notificationclick", (event) => {
    console.log("[FCM Service Worker] Notification clicked:", event);

    event.notification.close();

    // Handle different action clicks
    if (event.action === "open") {
      // Open the app or a specific URL from notification data
      const urlToOpen = event.notification.data?.url || "/";
      event.waitUntil(clients.openWindow(urlToOpen));
    } else if (event.action === "close") {
      // Just close the notification (already done above)
      console.log("[FCM Service Worker] Notification closed by user");
    } else {
      // Default action - open the app
      event.waitUntil(
        clients
          .matchAll({ type: "window", includeUncontrolled: true })
          .then((clientList) => {
            // If a window is already open, focus it
            for (const client of clientList) {
              if (client.url === "/" && "focus" in client) {
                return client.focus();
              }
            }
            // Otherwise, open a new window
            if (clients.openWindow) {
              return clients.openWindow("/");
            }
          })
      );
    }
  });

  /**
   * Handle notification close events
   */
  self.addEventListener("notificationclose", (event) => {
    console.log("[FCM Service Worker] Notification closed:", event);

    // Track notification dismissal (optional)
    // You can send analytics or perform cleanup here
  });
} catch (error) {
  console.error("[FCM Service Worker] Failed to initialize Firebase:", error);
}

/**
 * Service Worker Installation
 */
self.addEventListener("install", (event) => {
  console.log("[FCM Service Worker] Installing...");
  self.skipWaiting();
});

/**
 * Service Worker Activation
 */
self.addEventListener("activate", (event) => {
  console.log("[FCM Service Worker] Activating...");
  event.waitUntil(clients.claim());
});

/**
 * Handle messages from the main application
 */
self.addEventListener("message", (event) => {
  console.log("[FCM Service Worker] Received message from app:", event.data);

  // You can handle custom messages from your app here
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
