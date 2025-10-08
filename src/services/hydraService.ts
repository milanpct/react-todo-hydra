// Import the WebSDK types
import type { WebSDKInstance } from "../types/global";

class HydraService {
  private sdk: WebSDKInstance | null = null;
  private initialized = false;

  initialize() {
    if (this.initialized) {
      console.log("Hydra SDK already initialized, skipping...");
      return;
    }

    try {
      // Check if WebSDK is available globally
      if (typeof window === "undefined" || !window.WebSDK) {
        throw new Error(
          "WebSDK is not available. Make sure the hydra_sdk_web.js script is loaded."
        );
      }

      const config = {
        accountId: "e14378390072",
        baseURL: "https://mock-server-7d3h.onrender.com/",
        country: "US",
        city: "New York",
        countryCode: "US",
        debugLevel: "INFO" as const,
        brandId: "demo-brand",
        applicationId: "todo-app",
      };

      console.log("Initializing Hydra SDK with config:", config);
      this.sdk = new window.WebSDK(config);

      // ✅ Fire-and-forget initialization (non-blocking)
      this.sdk.init();
      this.initialized = true;
      console.log(
        "✅ Hydra SDK initialization started (background processing)"
      );
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
    if (!this.sdk) {
      console.warn("SDK not initialized, signup tracking skipped");
      return;
    }

    // ✅ Fire-and-forget user signup tracking (non-blocking)
    this.sdk.pushUserSignup(
      user.id,
      user.firstName,
      user.lastName,
      user.email,
      user.phone
    );
    console.log("✅ User signup tracking started (background processing)");
  }

  trackUserSignin(
    userId: string,
    firstName?: string,
    lastName?: string,
    email?: string,
    phone?: string
  ) {
    if (!this.sdk) {
      console.warn("SDK not initialized, signin tracking skipped");
      return;
    }

    // ✅ Fire-and-forget user signin tracking (non-blocking)
    this.sdk.pushUserSignin(userId, firstName, lastName, email, phone);
    console.log("✅ User signin tracking started (background processing)");
  }

  trackUserUpdate(user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }) {
    if (!this.sdk) {
      console.warn("SDK not initialized, update tracking skipped");
      return;
    }

    // ✅ Fire-and-forget user update tracking (non-blocking)
    this.sdk.pushUserUpdate(
      user.id,
      user.firstName,
      user.lastName,
      user.email,
      user.phone
    );
    console.log("✅ User update tracking started (background processing)");
  }

  trackUserSignout(userId: string) {
    if (!this.sdk) {
      console.warn("SDK not initialized, signout tracking skipped");
      return;
    }

    // ✅ Fire-and-forget user signout tracking (non-blocking)
    this.sdk.pushUserSignOut(userId);

    // Note: WebSDK automatically destroys itself after signout
    // This is the expected behavior, so we reset our state accordingly
    this.sdk = null;
    this.initialized = false;
    console.log(
      "✅ User signout tracking started, SDK will destroy itself (background processing)"
    );
  }

  // Method to reset SDK state (called after WebSDK destroys itself)
  resetUserSession() {
    // Reset our tracking state since WebSDK destroys itself on signout
    this.sdk = null;
    this.initialized = false;
    console.log("Hydra SDK user session reset");
  }

  // Method to check if SDK is initialized
  isInitialized(): boolean {
    return this.initialized && this.sdk !== null;
  }

  trackEvent(eventName: string, attributes?: Record<string, unknown>) {
    if (!this.sdk) {
      console.warn("SDK not initialized, event tracking skipped:", eventName);
      return;
    }

    // ✅ Fire-and-forget event tracking (non-blocking)
    this.sdk.pushEvent(eventName, attributes);
    console.log(
      `✅ Event '${eventName}' tracking started (background processing)`
    );
  }
}

export const hydraService = new HydraService();
