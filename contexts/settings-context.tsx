"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { type UserSettingsData } from "@/lib/auth/user-profile-service";
import { getUserProfileAction } from "@/actions/profile";

interface SettingsContextType {
  settings: UserSettingsData;
  updateSettings: (newSettings: Partial<UserSettingsData>) => void;
  setSettings: (settings: UserSettingsData) => void;
  isLoading: boolean;
  syncWithBackend: () => Promise<void>;
}

const defaultSettings: UserSettingsData = {
  // Display Settings
  theme: "system",
  fontSize: 14,
  chartHeight: 400,
  colorScheme: "default",
  showGrid: true,
  showVolume: true,

  // Accessibility Settings
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
  keyboardNav: true,
  focusIndicators: true,

  // Notification Settings
  priceAlerts: true,
  emailNotifications: true,
  pushNotifications: false,
  soundAlerts: true,
  alertFrequency: "immediate",

  // Data Settings
  dataRetention: "1year",
  autoSync: true,
  exportFormat: "json",
  apiAccess: false,

  // Trading Settings
  confirmOrders: true,
  defaultLeverage: 1,
  riskWarnings: true,
  paperTrading: false,

  // Privacy Settings
  shareData: true,
  analytics: true,
  cookies: true,
  twoFactor: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettingsState] = useState<UserSettingsData>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from backend on initialization
  const syncWithBackend = async () => {
    try {
      const result = await getUserProfileAction();
      
      if (result.success && result.data?.preferences) {
        const preferences = result.data.preferences;
        
        // Map backend preferences to settings format
        const backendSettings: UserSettingsData = {
          theme: preferences.theme || "system",
          fontSize: preferences.tradingPreferences?.fontSize || 14,
          chartHeight: preferences.tradingPreferences?.chartHeight || 400,
          colorScheme: preferences.tradingPreferences?.colorScheme || "default",
          showGrid: preferences.tradingPreferences?.showGrid ?? true,
          showVolume: preferences.tradingPreferences?.showVolume ?? true,
          highContrast: preferences.accessibilitySettings?.highContrast ?? false,
          reducedMotion: preferences.accessibilitySettings?.reducedMotion ?? false,
          screenReader: preferences.accessibilitySettings?.screenReader ?? false,
          keyboardNav: preferences.accessibilitySettings?.keyboardNav ?? true,
          focusIndicators: preferences.accessibilitySettings?.focusIndicators ?? true,
          priceAlerts: preferences.notifications?.priceAlerts ?? true,
          emailNotifications: preferences.notifications?.email ?? true,
          pushNotifications: preferences.notifications?.push ?? false,
          soundAlerts: preferences.notifications?.soundAlerts ?? true,
          alertFrequency: preferences.notifications?.alertFrequency || "immediate",
          dataRetention: preferences.dataSettings?.dataRetention || "1year",
          autoSync: preferences.dataSettings?.autoSync ?? true,
          exportFormat: preferences.dataSettings?.exportFormat || "json",
          apiAccess: preferences.dataSettings?.apiAccess ?? false,
          confirmOrders: preferences.tradingPreferences?.confirmOrders ?? true,
          defaultLeverage: preferences.tradingPreferences?.defaultLeverage || 1,
          riskWarnings: preferences.tradingPreferences?.riskWarnings ?? true,
          paperTrading: preferences.tradingPreferences?.paperTrading ?? false,
          shareData: preferences.privacySettings?.shareData ?? false,
          analytics: preferences.privacySettings?.analytics ?? true,
          cookies: preferences.privacySettings?.cookies ?? true,
          twoFactor: preferences.privacySettings?.twoFactor ?? false,
        };
        
        setSettingsState(backendSettings);
        
        // Also save to localStorage as backup
        try {
          localStorage.setItem("userSettings", JSON.stringify(backendSettings));
        } catch (error) {
          console.error("Failed to save settings to localStorage:", error);
        }
      }
    } catch (error) {
      console.error("Failed to sync settings with backend:", error);
      
      // Fallback to localStorage if backend fails
      try {
        const savedSettings = localStorage.getItem("userSettings");
        if (savedSettings) {
          setSettingsState({ ...defaultSettings, ...JSON.parse(savedSettings) });
        }
      } catch (localError) {
        console.error("Failed to load settings from localStorage:", localError);
      }
    }
  };

  useEffect(() => {
    // Load settings from backend on mount
    syncWithBackend().finally(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    // Apply accessibility settings to document
    const applyAccessibilitySettings = () => {
      const root = document.documentElement;
      
      // High contrast mode
      if (settings.highContrast) {
        root.classList.add("high-contrast");
      } else {
        root.classList.remove("high-contrast");
      }
      
      // Reduced motion
      if (settings.reducedMotion) {
        root.classList.add("reduce-motion");
      } else {
        root.classList.remove("reduce-motion");
      }
      
      // Focus indicators
      if (settings.focusIndicators) {
        root.classList.add("focus-indicators");
      } else {
        root.classList.remove("focus-indicators");
      }
      
      // Font size
      root.style.setProperty("--font-size-base", `${settings.fontSize}px`);
      
      // Screen reader support
      if (settings.screenReader) {
        root.setAttribute("aria-live", "polite");
      } else {
        root.removeAttribute("aria-live");
      }
    };

    if (!isLoading) {
      applyAccessibilitySettings();
    }
  }, [settings, isLoading]);

  const updateSettings = (newSettings: Partial<UserSettingsData>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettingsState(updatedSettings);
    
    // Save to localStorage as backup
    try {
      localStorage.setItem("userSettings", JSON.stringify(updatedSettings));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  };

  const setSettings = (newSettings: UserSettingsData) => {
    setSettingsState(newSettings);
    
    // Save to localStorage as backup
    try {
      localStorage.setItem("userSettings", JSON.stringify(newSettings));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      setSettings,
      isLoading, 
      syncWithBackend 
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
