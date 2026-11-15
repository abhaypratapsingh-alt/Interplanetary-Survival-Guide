/**
 * Central API Client for Mars Pathfinder AI Backend
 * Connects Next.js frontend to FastAPI backend with JWT authentication and fallback.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.token = localStorage.getItem('pathfinder_access_token');
      } catch (e) {
        // ignore
      }
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      try {
        if (token) {
          localStorage.setItem('pathfinder_access_token', token);
        } else {
          localStorage.removeItem('pathfinder_access_token');
        }
      } catch (e) {
        // ignore
      }
    }
  }

  public getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      try {
        this.token = localStorage.getItem('pathfinder_access_token');
      } catch (e) {}
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMsg = `API Error ${response.status}: ${response.statusText}`;
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed.detail) errorMsg = parsed.detail;
      } catch {}
      throw new Error(errorMsg);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  // Health
  public async getHealth() {
    return this.request<any>('/health');
  }

  // Dashboard
  public async getDashboardSummary() {
    return this.request<any>('/dashboard/summary');
  }

  // Sensors
  public async getSensors(category?: string) {
    const query = category && category !== 'all' ? `?category=${category}` : '';
    return this.request<any[]>(`/sensors${query}`);
  }

  public async getSensor(sensorId: string) {
    return this.request<any>(`/sensors/${sensorId}`);
  }

  public async getSensorHistory(sensorId: string, range: string = '24h') {
    return this.request<any[]>(`/sensors/${sensorId}/history?range=${range}`);
  }

  public getSensorExportUrl(sensorId?: string) {
    const query = sensorId ? `?sensor_id=${sensorId}` : '';
    return `${API_BASE_URL}/sensors/export/csv${query}`;
  }

  // Missions
  public async getMissions(status?: string) {
    const query = status && status !== 'all' ? `?status=${status}` : '';
    return this.request<any[]>(`/missions${query}`);
  }

  public async getMission(id: number) {
    return this.request<any>(`/missions/${id}`);
  }

  public async createMission(data: any) {
    return this.request<any>('/missions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateMission(id: number, data: any) {
    return this.request<any>(`/missions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async deleteMission(id: number) {
    return this.request<void>(`/missions/${id}`, {
      method: 'DELETE',
    });
  }

  public async addMissionTask(missionId: number, data: any) {
    return this.request<any>(`/missions/${missionId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateTask(taskId: number, data: any) {
    return this.request<any>(`/missions/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Cameras
  public async getCameras() {
    return this.request<string[]>('/cameras');
  }

  public async getCameraImages(params: { camera_name?: string; sol?: number; featured_only?: boolean } = {}) {
    const searchParams = new URLSearchParams();
    if (params.camera_name && params.camera_name !== 'all') searchParams.set('camera_name', params.camera_name);
    if (params.sol !== undefined) searchParams.set('sol', params.sol.toString());
    if (params.featured_only) searchParams.set('featured_only', 'true');
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<any[]>(`/cameras/images${query}`);
  }

  // Locations
  public async getLocations(search?: string, featureType?: string) {
    const searchParams = new URLSearchParams();
    if (search) searchParams.set('search', search);
    if (featureType && featureType !== 'all') searchParams.set('feature_type', featureType);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<any[]>(`/locations${query}`);
  }

  // Datasets
  public async getDatasets(layerType?: string) {
    const query = layerType && layerType !== 'all' ? `?layer_type=${layerType}` : '';
    return this.request<any[]>(`/datasets${query}`);
  }

  // Hazards
  public async getHazards(severity?: string, hazardType?: string) {
    const searchParams = new URLSearchParams();
    if (severity && severity !== 'all') searchParams.set('severity', severity);
    if (hazardType && hazardType !== 'all') searchParams.set('hazard_type', hazardType);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<any>(`/hazards${query}`);
  }

  public async analyzeHazards(data: any) {
    return this.request<any>('/hazards/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Telemetry
  public async getTelemetrySummary() {
    return this.request<any>('/telemetry/summary');
  }

  public async getSignalWaveform() {
    return this.request<any>('/telemetry/waveform');
  }

  public async getRadarSweep() {
    return this.request<any>('/telemetry/radar');
  }

  // Logs
  public async getLogs(params: { category?: string; severity?: string; search?: string } = {}) {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== 'all') searchParams.set('category', params.category);
    if (params.severity && params.severity !== 'all') searchParams.set('severity', params.severity);
    if (params.search) searchParams.set('search', params.search);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<any[]>(`/logs${query}`);
  }

  public async createLog(data: any) {
    return this.request<any>('/logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public getLogExportUrl() {
    return `${API_BASE_URL}/logs/export/csv`;
  }

  // Settings
  public async getSettings() {
    return this.request<Record<string, string>>('/settings');
  }

  public async updateSetting(key: string, value: string, description?: string) {
    return this.request<Record<string, string>>('/settings', {
      method: 'PUT',
      body: JSON.stringify({ key, value, description }),
    });
  }

  // Auth
  public async login(credentials: { username: string; password: string }) {
    const res = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  }

  public async getAuthMe() {
    return this.request<any>('/auth/me');
  }

  // Mission Control Admin APIs
  public async getAdminMissions(status?: string) {
    const query = status && status !== 'all' ? `?status=${status}` : '';
    return this.request<any[]>(`/mission-control/missions${query}`);
  }

  public async getAdminMission(missionId: number) {
    return this.request<any>(`/mission-control/missions/${missionId}`);
  }

  public async createAdminMission(data: any) {
    return this.request<any>('/mission-control/missions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getAstronautTelemetryHistory(astronautId: number, limit: number = 25) {
    return this.request<any[]>(`/mission-control/astronauts/${astronautId}/telemetry?limit=${limit}`);
  }

  public async tickAstronautTelemetry(astronautId: number) {
    return this.request<any>(`/mission-control/astronauts/${astronautId}/telemetry-tick`, {
      method: 'POST',
    });
  }

  public async getMissionMinerals(missionId: number) {
    return this.request<any[]>(`/mission-control/missions/${missionId}/minerals`);
  }

  public async createMissionMineral(missionId: number, data: any) {
    return this.request<any>(`/mission-control/missions/${missionId}/minerals`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getMissionEvents(missionId: number) {
    return this.request<any[]>(`/mission-control/missions/${missionId}/events`);
  }

  public async createMissionEvent(missionId: number, data: any) {
    return this.request<any>(`/mission-control/missions/${missionId}/events`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
