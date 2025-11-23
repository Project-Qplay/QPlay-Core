/**
 * API Service for Quantum Quest Frontend
 * Handles all communication with Netlify Functions and Supabase
 */

// Use Netlify Functions for API endpoints
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || (
  import.meta.env.MODE === 'development'
    ? 'http://localhost:8888/.netlify/functions' // Netlify dev server
    : '/.netlify/functions' // Production Netlify Functions
);

interface SignInResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: any;
}

interface SignUpData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    // Load token from localStorage on initialization
    this.authToken = localStorage.getItem('quantum-quest-token');
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      localStorage.setItem('quantum-quest-token', token);
    } else {
      localStorage.removeItem('quantum-quest-token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication API calls (Netlify Functions)
  async signIn(email: string, password: string): Promise<SignInResponse> {
    const response = await this.request('/auth-login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    // Store token automatically
    if (response.access_token) {
      this.setAuthToken(response.access_token);
    }
    
    return response;
  }

  async signUp(data: SignUpData): Promise<SignInResponse> {
    const response = await this.request('/auth-signup', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    // Store token automatically
    if (response.access_token) {
      this.setAuthToken(response.access_token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  async updateProfile(data: any) {
    return this.request('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async signOut() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.setAuthToken(null);
    }
  }

  async getUserAchievements() {
    return this.request('/api/auth/achievements');
  }

  async getUserStats() {
    return this.request('/api/auth/stats');
  }

  // Leaderboard API calls
  async getSpeedLeaderboard(limit: number = 50, difficulty?: string) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (difficulty) params.append('difficulty', difficulty);
    
    return this.request(`/leaderboard?type=speed&${params}`);
  }

  async getScoreLeaderboard(limit: number = 50, difficulty?: string) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (difficulty) params.append('difficulty', difficulty);
    
    return this.request(`/leaderboard?type=score&${params}`);
  }

  async getMasteryLeaderboard(limit: number = 50) {
    const params = new URLSearchParams({ limit: limit.toString() });
    return this.request(`/api/leaderboard/mastery?${params}`);
  }

  async getWeeklyLeaderboard(category: string) {
    return this.request(`/api/leaderboard/weekly?category=${category}`);
  }

  async submitToLeaderboard(sessionId: string) {
    return this.request('/api/leaderboard/submit', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId })
    });
  }

  // Game Session API calls - Updated to match Netlify Functions
  async startGameSession(userId: string, difficulty: string = 'easy') {
    return this.request('/game-session', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        difficulty: difficulty
      })
    });
  }

  async saveGameProgress(sessionId: string, currentRoom: string, roomTimes: any, roomAttempts: any, roomScores?: any) {
    return this.request('/game-session', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        current_room: currentRoom,
        room_times: roomTimes,
        room_attempts: roomAttempts,
        room_scores: roomScores
      })
    });
  }

  async completeGameSession(sessionId: string, userId: string, completionTime: number, totalScore: number, roomsCompleted: number, hintsUsed: number = 0, difficulty: string = 'easy') {
    return this.request('/game-session', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        user_id: userId,
        completion_time: completionTime,
        total_score: totalScore,
        rooms_completed: roomsCompleted,
        hints_used: hintsUsed,
        difficulty: difficulty
      })
    });
  }

  async getGameSessions(userId?: string) {
    // For now, we'll access Supabase directly to get sessions
    // This will need to be updated when backend adds a GET sessions endpoint
    if (!userId) {
      console.warn('User ID required to fetch game sessions');
      return [];
    }
    
    try {
      // Direct Supabase REST API call to get user's sessions
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase environment variables not configured');
        return [];
      }
      
      const response = await fetch(`${supabaseUrl}/rest/v1/game_sessions?user_id=eq.${userId}&order=started_at.desc`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to fetch game sessions:', response.statusText);
        return [];
      }
    } catch (error) {
      console.error('Error fetching game sessions:', error);
      return [];
    }
  }

  // Quantum Physics API calls (unchanged)
  async generateQuantumMeasurements(count: number = 50) {
    return this.request('/api/quantum/probability/generate-measurements', {
      method: 'POST',
      body: JSON.stringify({ measurement_count: count })
    });
  }

  async analyzePattern(measurements: number[]) {
    return this.request('/api/quantum/probability/analyze-pattern', {
      method: 'POST',
      body: JSON.stringify(measurements)
    });
  }

  async performQuantumMeasurement(axis: string) {
    return this.request(`/api/quantum/state/measure/${axis}`, {
      method: 'POST'
    });
  }

  async reconstructQuantumState(measurements: Record<string, number>) {
    return this.request('/api/quantum/state/reconstruct', {
      method: 'POST',
      body: JSON.stringify({ measurements })
    });
  }

  async measureEntangledParticles(aliceAngle: number, bobAngle: number) {
    return this.request('/api/quantum/entanglement/measure', {
      method: 'POST',
      body: JSON.stringify({ alice_angle: aliceAngle, bob_angle: bobAngle })
    });
  }

  async performBellTest(measurementCount: number = 40) {
    return this.request('/api/quantum/entanglement/bell-test', {
      method: 'POST',
      body: JSON.stringify({ measurement_count: measurementCount })
    });
  }

  async getOptimalAngles() {
    return this.request('/api/quantum/entanglement/optimal-angles');
  }

  async logQuantumMeasurement(sessionId: string, roomId: string, measurementType: string, measurementData: any) {
    return this.request('/quantum-measurements', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        room_id: roomId,
        measurement_type: measurementType,
        measurement_data: measurementData
      })
    });
  }

  async unlockAchievement(achievementId: string, sessionId?: string, userId?: string) {
    return this.request('/achievements', {
      method: 'POST',
      body: JSON.stringify({
        achievement_id: achievementId,
        session_id: sessionId,
        user_id: userId
      })
    });
  }

  async calculateTunneling(barrierHeight: number, barrierWidth: number, particleEnergy: number) {
    return this.request('/api/quantum/tunneling/calculate', {
      method: 'POST',
      body: JSON.stringify({
        barrier_height: barrierHeight,
        barrier_width: barrierWidth,
        particle_energy: particleEnergy
      })
    });
  }

  async optimizeTunnelingParameters(targetProbability: number = 20) {
    return this.request(`/api/quantum/tunneling/optimize?target_probability=${targetProbability}`);
  }

  // Legacy game API calls (for backward compatibility)
  async getGameState() {
    // For now, return a default state - this will be replaced with session-based state
    return {
      completedRooms: [],
      currentProgress: 0,
      achievements: [],
      totalScore: 0
    };
  }

  async completeRoom(roomId: string, completionData: any) {
    // This will be integrated with the session system
    return { success: true, room: roomId };
  }

  async getAchievements() {
    return this.getUserAchievements();
  }

  async getLeaderboard(limit: number = 10) {
    return this.getScoreLeaderboard(limit);
  }

  async validateRoomSolution(roomId: string, solutionData: any) {
    return this.request(`/api/game/validate/${roomId}`, {
      method: 'POST',
      body: JSON.stringify(solutionData)
    });
  }

  async getPlayerProgress() {
    return this.getUserStats();
  }

  async getGlobalStats() {
    return this.request('/api/game/stats/global');
  }

  // Health checks
  async checkHealth() {
    return this.request('/health');
  }

  async checkQuantumEngineHealth() {
    return this.request('/api/quantum/health');
  }

  // WebSocket connection (Supabase real-time)
  createWebSocketConnection() {
    if (!this.authToken) {
      console.error('Auth token required for WebSocket connection');
      return null;
    }

    const wsUrl = `${this.baseUrl.replace('http', 'ws')}/ws?token=${this.authToken}`;
    return new WebSocket(wsUrl);
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;