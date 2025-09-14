import WebSDK from 'hydra-sdk-web';

class HydraService {
  private sdk: WebSDK | null = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) {
      console.log('Hydra SDK already initialized, skipping...');
      return;
    }

    try {
      const config = {
        accountId: 'e14378390072',
        baseURL: 'https://mock-server-7d3h.onrender.com/',
        country: 'US',
        city: 'New York',
        countryCode: 'US',
        debugLevel: 'INFO' as const,
        brandId: 'demo-brand',
        applicationId: 'todo-app',
      };

      console.log('Initializing Hydra SDK with config:', config);
      this.sdk = new WebSDK(config);
      await this.sdk.init();
      this.initialized = true;
      console.log('Hydra SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Hydra SDK:', error);
      throw error;
    }
  }

  async trackUserSignup(user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) {
    if (!this.sdk) throw new Error('SDK not initialized');
    
    await this.sdk.pushUserSignup(
      user.id,
      user.firstName,
      user.lastName,
      user.email,
      user.phone
    );
  }

  async trackUserSignin(userId: string, firstName?: string, lastName?: string, email?: string, phone?: string) {
    if (!this.sdk) throw new Error('SDK not initialized');
    
    await this.sdk.pushUserSignin(userId, firstName, lastName, email, phone);
  }

  async trackUserUpdate(user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }) {
    if (!this.sdk) throw new Error('SDK not initialized');
    
    await this.sdk.pushUserUpdate(
      user.id,
      user.firstName,
      user.lastName,
      user.email,
      user.phone
    );
  }

  async trackUserSignout(userId: string) {
    if (!this.sdk) throw new Error('SDK not initialized');
    
    await this.sdk.pushUserSignOut(userId);
    this.sdk = null;
    this.initialized = false;
  }

  async trackEvent(eventName: string, attributes?: Record<string, unknown>) {
    if (!this.sdk) throw new Error('SDK not initialized');
    
    await this.sdk.pushEvent(eventName, attributes);
  }
}

export const hydraService = new HydraService();
