"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { type UserSettingsData } from "@/lib/auth/user-profile-service";

interface SettingsContextType {
  settings: UserSettingsData;
  updateSettings: (newSettings: Partial<UserSettingsData>) => void;
  isLoading: boolean;
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
  const [settings, setSettings] = useState<UserSettingsData>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load settings from localStorage or API
    const loadSettings = async () => {
      try {
        const savedSettings = localStorage.getItem("userSettings");
        if (savedSettings) {
          setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
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
    setSettings(updatedSettings);
    
    // Save to localStorage
    try {
      localStorage.setItem("userSettings", JSON.stringify(updatedSettings));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
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
