// Import the WebSDK from NPM package
import WebSDK from "cap-hydra-web-sdk";

class HydraService {
  private userIdentified = false;

  /**
   * Initialize the SDK. Call once on app load.
   * The SDK manages its own singleton instance internally.
   */
  initialize() {
    if (WebSDK.isInitialized()) {
      console.log("Hydra SDK already initialized, reusing instance");
      return;
    }

    try {
      WebSDK.initialize({
        debugLevel: "INFO" as const,

        // User Location Information (Optional)
        country: "US",
        city: "New York",
        countryCode: "US",

        // Application version for tracking
        appVersion: "1.0.0",

        // Push Notifications Configuration
        notifications: {
          enableNotifications: true,
          vapidKey:
            "BK9kMBFolJ6Ys_t5mCQd_JL_iEtat7E1kZ2SgT9ZrmTVwm8Cy1lAo0-Davc6TMvPZBwESlGts0quCsfk0WHxAAg",
        },
        firebaseConfig: {
          apiKey: "AIzaSyCRVUaZrXJApXpt8Y2NhVZitqMxEm_I_8A",
          authDomain: "hydraexample-2e017.firebaseapp.com",
          databaseURL: "https://hydraexample-2e017-default-rtdb.firebaseio.com",
          projectId: "hydraexample-2e017",
          storageBucket: "hydraexample-2e017.appspot.com",
          messagingSenderId: "475210831036",
          appId: "1:475210831036:web:32954661d8deb124576cb9",
          measurementId: "G-C3TRBSEFBV",
        },
        remoteConfigKey: "react_todo_sample_app_config",
      });

      this.userIdentified = false;
      console.log("Hydra SDK initialized (background processing)");
    } catch (error) {
      console.error("Failed to initialize Hydra SDK:", error);
      throw error;
    }
  }

  trackUserSignup(user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) {
    if (!WebSDK.isInitialized()) {
      console.warn("SDK not initialized, signup tracking skipped");
      return;
    }

    this.userIdentified = true;
    WebSDK.pushUserSignup(user.id, {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    });
    console.log("User signup tracking started (background processing)");
  }

  trackUserSignin(
    userId: string,
    firstName: string,
    lastName: string,
    email?: string,
    phone?: string,
  ) {
    if (!WebSDK.isInitialized()) {
      console.warn("SDK not initialized, signin tracking skipped");
      return;
    }

    this.userIdentified = true;
    WebSDK.pushUserSignin(userId, {
      firstName,
      lastName,
      ...(email && { email }),
      ...(phone && { phone }),
    });
    console.log("User signin tracking started (background processing)");
  }

  trackUserUpdate(user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  }) {
    if (!WebSDK.isInitialized()) {
      console.warn("SDK not initialized, update tracking skipped");
      return;
    }

    WebSDK.pushUserUpdate(user.id, {
      firstName: user.firstName,
      lastName: user.lastName,
      ...(user.email && { email: user.email }),
      ...(user.phone && { phone: user.phone }),
    });
    console.log("User update tracking started (background processing)");
  }

  trackUserSignout(userId: string) {
    if (!WebSDK.isInitialized()) {
      console.warn("SDK not initialized, signout tracking skipped");
      return;
    }

    WebSDK.pushUserSignOut(userId);
    this.userIdentified = false;
    console.log(
      "User signout tracking started, user now anonymous (background processing)",
    );
  }

  resetUserSession() {
    this.userIdentified = false;
    console.log("User session reset - SDK continues for anonymous tracking");
  }

  isInitialized(): boolean {
    return WebSDK.isInitialized();
  }

  isUserIdentified(): boolean {
    return this.userIdentified;
  }

  trackEvent(eventName: string, attributes?: Record<string, unknown>) {
    if (!WebSDK.isInitialized()) {
      console.warn("SDK not initialized, event tracking skipped:", eventName);
      return;
    }

    WebSDK.pushEvent(eventName, attributes);
    console.log(
      `Event '${eventName}' tracking started (background processing)`,
    );
  }
}

export const hydraService = new HydraService();
// Expose to window for debugging in console
if (typeof window !== "undefined") {
  (window as any).hydraService = hydraService;
}
