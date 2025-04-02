import { create } from "zustand";

export interface AppSettings {
  maintenance_mode: boolean;
  allow_new_registrations: boolean;
  default_user_role: string;
  notification_frequency: string;
  cache_duration: number;
  api_rate_limit: number;
  content_moderation: boolean;
  auto_backup: boolean;
  theme_color: string;
  app_version: string;
}

interface AdminSettingsState {
  settings: AppSettings;
  loading: boolean;
  saving: boolean;
  error: Error | null;

  // Actions
  loadSettings: () => Promise<void>;
  saveSettings: (settings: AppSettings) => Promise<{ error: Error | null }>;
  resetSettings: () => void;
  exportSettings: () => void;
  importSettings: () => void;
  backupDatabase: () => void;
  clearCache: () => void;
  setSettings: (settings: AppSettings) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: Error | null) => void;
}

// Default settings
const defaultSettings: AppSettings = {
  maintenance_mode: false,
  allow_new_registrations: true,
  default_user_role: "user",
  notification_frequency: "daily",
  cache_duration: 60,
  api_rate_limit: 100,
  content_moderation: true,
  auto_backup: true,
  theme_color: "#8B5CF6",
  app_version: "1.0.0",
};

export const useAdminSettingsStore = create<AdminSettingsState>((set, get) => ({
  settings: { ...defaultSettings },
  loading: false,
  saving: false,
  error: null,

  // Setters
  setSettings: (settings) => set({ settings }),
  setLoading: (loading) => set({ loading }),
  setSaving: (saving) => set({ saving }),
  setError: (error) => set({ error }),

  // Load settings
  loadSettings: async () => {
    set({ loading: true, error: null });
    try {
      // In a real app, you would fetch settings from the database
      // For this demo, we'll just simulate loading
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, we'll just use the default settings
      set({ settings: { ...defaultSettings }, loading: false });
    } catch (err) {
      console.error("Error loading settings:", err);
      set({ error: err as Error, loading: false });
    }
  },

  // Save settings
  saveSettings: async (settings) => {
    set({ saving: true, error: null });
    try {
      // In a real app, you would save settings to the database
      // For this demo, we'll just simulate saving
      await new Promise((resolve) => setTimeout(resolve, 1000));

      set({ settings, saving: false });
      return { error: null };
    } catch (err) {
      console.error("Error saving settings:", err);
      set({ error: err as Error, saving: false });
      return { error: err as Error };
    }
  },

  // Reset settings to defaults
  resetSettings: () => {
    set({ settings: { ...defaultSettings } });
  },

  // Export settings
  exportSettings: () => {
    // In a real app, this would export settings as JSON
    console.log("Exporting settings:", get().settings);
  },

  // Import settings
  importSettings: () => {
    // In a real app, this would import settings from JSON
    console.log("Importing settings");
  },

  // Backup database
  backupDatabase: () => {
    // In a real app, this would trigger a database backup
    console.log("Backing up database");
  },

  // Clear cache
  clearCache: () => {
    // In a real app, this would clear the application cache
    console.log("Clearing cache");
  },
}));
