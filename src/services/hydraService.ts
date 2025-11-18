// Import the WebSDK types
import type { WebSDKInstance } from "../types/global";

class HydraService {
  private sdk: WebSDKInstance | null = null;
  private initialized = false;
  private userIdentified = false;

  // Initialize SDK for anonymous users (called on app load)
  initializeAnonymous() {
    if (this.initialized) {
      console.log("Hydra SDK already initialized");
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
        accountId: "1234",
        baseURL: "https://mock-server-7d3h.onrender.com/",
        orgId: "1102", // ⚠️ REQUIRED - Replace with your actual orgId
        vapId: "test-vap-456", // ⚠️ REQUIRED - Replace with your actual vapId
        country: "US",
        city: "New York",
        countryCode: "US",
        debugLevel: "INFO" as const,
        brandId: "demo-brand",
        applicationId: "todo-app",
      };

      console.log("Initializing Hydra SDK for anonymous tracking:", config);
      this.sdk = new window.WebSDK(config);

      // ✅ Fire-and-forget initialization (non-blocking)
      this.sdk.init();
      this.initialized = true;
      this.userIdentified = false;
      console.log(
        "✅ Hydra SDK initialized for anonymous tracking (background processing)"
      );
    } catch (error) {
      console.error("Failed to initialize Hydra SDK:", error);
      throw error;
    }
  }

  // Reuse existing SDK instance if already initialized
  initialize() {
    if (this.initialized) {
      console.log("Hydra SDK already initialized, reusing instance");
      return;
    }
    this.initializeAnonymous();
  }

  // Mark user as identified
  private identifyUser(userId: string) {
    this.userIdentified = true;
    console.log("✅ User identified:", userId);
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

    // ✅ Identify user on signup
    this.identifyUser(user.id);

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

    // ✅ Identify user on signin
    this.identifyUser(userId);

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

    // ✅ User becomes anonymous after signout
    this.userIdentified = false;
    console.log(
      "✅ User signout tracking started, user now anonymous (background processing)"
    );
  }

  // Method to reset SDK state (user becomes anonymous)
  resetUserSession() {
    // Don't destroy SDK - just mark as anonymous
    this.userIdentified = false;
    console.log("User session reset - SDK continues for anonymous tracking");
  }

  // Method to check if SDK is initialized
  isInitialized(): boolean {
    return this.initialized && this.sdk !== null;
  }

  // Method to check if user is identified
  isUserIdentified(): boolean {
    return this.userIdentified;
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
