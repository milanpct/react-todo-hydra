// Global type declarations for WebSDK loaded via script tag

export interface WebSDKConfig {
  accountId: string;
  baseURL: string;
  country?: string;
  city?: string;
  countryCode?: string;
  debugLevel?: "VERBOSE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "NONE";
  brandId?: string;
  applicationId?: string;
}

export interface WebSDKInstance {
  init(): void;
  setUserContext(cuid: string, systemDataArgs: any): Promise<void>;
  track(event: any): Promise<void>;
  destroy(): Promise<void>;
  pushUserSignin(
    cuid: string,
    firstName?: string,
    lastName?: string,
    email?: string,
    phone?: string,
    customData?: any
  ): void;
  pushUserSignup(
    cuid: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    customData?: any
  ): void;
  pushUserUpdate(
    cuid: string,
    firstName?: string,
    lastName?: string,
    email?: string,
    phone?: string,
    customData?: any
  ): void;
  pushUserSignOut(cuid: string): void;
  pushEvent(eventName: string, attributes?: Record<string, unknown>): void;
}

export interface WebSDKConstructor {
  new (config: WebSDKConfig): WebSDKInstance;
  instanceWithConfig(config: WebSDKConfig): WebSDKInstance;
}

declare global {
  interface Window {
    WebSDK: WebSDKConstructor;
  }

  const WebSDK: WebSDKConstructor;
}

export {};
