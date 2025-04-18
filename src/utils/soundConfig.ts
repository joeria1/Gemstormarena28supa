interface SoundConfig {
  name: string;
  path: string;
  description: string;
}

// Default sound configurations
const defaultSoundConfigs: Record<string, string> = {
  'balance-change': '/sounds/balance-change.mp3',
  'button-click': '/sounds/button-click.mp3',
  'cashout': '/sounds/cashout.mp3',
  'win': '/sounds/win.mp3',
  'lose': '/sounds/lose.mp3'
};

/**
 * Get the path for a sound from configuration
 * Falls back to default paths if not configured
 */
export const getSoundPath = (soundName: string): string => {
  try {
    // Try to get from local storage first
    const savedConfigs = localStorage.getItem('soundConfigurations');
    
    if (savedConfigs) {
      const configs = JSON.parse(savedConfigs) as SoundConfig[];
      const config = configs.find(c => c.name === soundName);
      
      if (config) {
        return config.path;
      }
    }
    
    // Fall back to default configuration
    return defaultSoundConfigs[soundName] || `/sounds/${soundName}.mp3`;
  } catch (error) {
    console.error('Error loading sound configuration:', error);
    return `/sounds/${soundName}.mp3`;
  }
};

/**
 * Save a sound configuration
 */
export const saveSoundConfig = (name: string, path: string): void => {
  try {
    // Get existing configs or initialize with defaults
    const savedConfigs = localStorage.getItem('soundConfigurations');
    let configs: SoundConfig[] = [];
    
    if (savedConfigs) {
      configs = JSON.parse(savedConfigs);
    } else {
      // Initialize with defaults
      configs = Object.entries(defaultSoundConfigs).map(([name, path]) => ({
        name,
        path,
        description: `Sound effect for ${name}`
      }));
    }
    
    // Update or add the configuration
    const existingIndex = configs.findIndex(c => c.name === name);
    
    if (existingIndex >= 0) {
      configs[existingIndex].path = path;
    } else {
      configs.push({
        name,
        path,
        description: `Sound effect for ${name}`
      });
    }
    
    // Save to local storage
    localStorage.setItem('soundConfigurations', JSON.stringify(configs));
  } catch (error) {
    console.error('Error saving sound configuration:', error);
  }
};

/**
 * Get all sound configurations
 */
export const getAllSoundConfigs = (): SoundConfig[] => {
  try {
    const savedConfigs = localStorage.getItem('soundConfigurations');
    
    if (savedConfigs) {
      return JSON.parse(savedConfigs);
    }
    
    // Initialize with defaults
    return Object.entries(defaultSoundConfigs).map(([name, path]) => ({
      name,
      path,
      description: `Sound effect for ${name}`
    }));
  } catch (error) {
    console.error('Error getting sound configurations:', error);
    return [];
  }
}; 