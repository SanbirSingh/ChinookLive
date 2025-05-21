// src/api/traffic-api.ts
import { TRAFFIC_CONFIG } from "./traffic-cam-config";
import type { TrafficCameraResponse } from "./types";

class TrafficAPI {
    private createUrl(
      endpoint: string,
      params: Record<string, string | number> = {}
    ) {
      // Convert all values to strings for URLSearchParams
      const stringParams: Record<string, string> = {};
      for (const [key, value] of Object.entries({
        ...TRAFFIC_CONFIG.DEFAULT_PARAMS,
        ...params,
      })) {
        stringParams[key] = value.toString();
      }
  
      const searchParams = new URLSearchParams(stringParams);
      return `${TRAFFIC_CONFIG.BASE_URL}/${endpoint}.json?${searchParams.toString()}`;
    }

  private async fetchData<T>(url: string): Promise<T> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Traffic API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async getTrafficCameras(): Promise<TrafficCameraResponse> {
    const cacheKey = 'calgary-traffic-cameras';
    const cacheExpiry = 30 * 60 * 1000; // 30 minutes
    
    // Check cache
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < cacheExpiry) {
        return data;
      }
    }
    
    // Fetch fresh data
    const url = this.createUrl("k7p9-kppz");
    const data = await this.fetchData<TrafficCameraResponse>(url);
    
    // Update cache
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    
    return data;
  }

  async getCamerasByQuadrant(quadrant: string): Promise<TrafficCameraResponse> {
    const url = this.createUrl("k7p9-kppz", {
      quadrant,
    });
    return this.fetchData<TrafficCameraResponse>(url);
  }
}

export const trafficAPI = new TrafficAPI();