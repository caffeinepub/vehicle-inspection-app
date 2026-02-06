export interface CameraPreferences {
  facingMode: 'user' | 'environment';
  quality: 'standard' | 'high';
  deviceId?: string;
  deviceLabel?: string;
}

const STORAGE_KEY = 'camera-preferences';

const DEFAULT_PREFERENCES: CameraPreferences = {
  facingMode: 'environment',
  quality: 'high',
};

export function getCameraPreferences(): CameraPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (error) {
    console.error('Failed to read camera preferences:', error);
  }
  return DEFAULT_PREFERENCES;
}

export function saveCameraPreferences(preferences: Partial<CameraPreferences>): void {
  try {
    const current = getCameraPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save camera preferences:', error);
  }
}

export function getQualityConfig(quality: 'standard' | 'high') {
  if (quality === 'high') {
    return {
      width: 1920,
      height: 1080,
      quality: 0.95,
    };
  }
  return {
    width: 1280,
    height: 720,
    quality: 0.85,
  };
}
