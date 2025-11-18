// Global type declarations for WebSDK loaded via script tag

export interface WebSDKConfig {
  accountId: string; // required
  baseURL: string; // required
  orgId: string; // required - organization ID for visitor tracking
  vapId: string; // required - VAP ID for visitor tracking
  country: string; // required
  city: string; // required
  countryCode: string; // required
  debugLevel?: "VERBOSE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "NONE";
  brandId?: string; // Optional brand identifier for multi-tenant isolation
  applicationId?: string; // Optional application identifier for same-domain isolation
  commChannels?: Array<{
    type: string;
    value: string;
    primary?: boolean;
    verified?: boolean;
  }>; // Optional communication channels for visitor
  extendedFields?: Record<string, unknown>; // Optional extended fields for visitor
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
