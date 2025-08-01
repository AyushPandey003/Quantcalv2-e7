"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Settings, Bell, Shield, Palette, Eye, Download, Upload, Save } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface UserProfileProps {
  onNavigate: (view: "home" | "dashboard" | "profile") => void
}

export function UserProfile({ onNavigate }: UserProfileProps) {
  const [settings, setSettings] = useState({
    // Display Settings
    fontSize: [16],
    chartHeight: [400],
    colorScheme: "default",
    showGrid: true,
    showVolume: true,

    // Accessibility Settings
    screenReader: false,
    keyboardNav: true,
    highContrast: false,
    reducedMotion: false,
    focusIndicators: true,

    // Notification Settings
    priceAlerts: true,
    emailNotifications: false,
    pushNotifications: true,
    soundEnabled: true,
    alertVolume: [70],

    // Data Settings
    autoRefresh: true,
    refreshInterval: 5,
    dataCaching: true,
    dataRetention: 30,

    // Trading Settings
    confirmOrders: true,
    defaultLeverage: [1],
    riskWarnings: true,

    // Privacy Settings
    shareData: false,
    analytics: true,
    cookies: true,
  })

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = "quantcal-settings.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string)
          setSettings(importedSettings)
        } catch (error) {
          console.error("Error importing settings:", error)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate("home")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <User className="h-6 w-6" />
              <span className="text-xl font-bold">User Profile & Settings</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => onNavigate("dashboard")}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">John Trader</CardTitle>
                <CardDescription>Professional Trader • Member since 2024</CardDescription>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge>Pro Plan</Badge>
                  <Badge variant="outline">Verified</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue="display" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="display" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Access</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Trading</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
          </TabsList>

          {/* Display Settings */}
          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>Customize the appearance of charts and interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Font Size: {settings.fontSize[0]}px</Label>
                  <Slider
                    value={settings.fontSize}
                    onValueChange={(value) => updateSetting("fontSize", value)}
                    max={24}
                    min={12}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Chart Height: {settings.chartHeight[0]}px</Label>
                  <Slider
                    value={settings.chartHeight}
                    onValueChange={(value) => updateSetting("chartHeight", value)}
                    max={800}
                    min={200}
                    step={50}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color Scheme</Label>
                  <Select value={settings.colorScheme} onValueChange={(value) => updateSetting("colorScheme", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="colorblind">Colorblind Friendly</SelectItem>
                      <SelectItem value="monochrome">Monochrome</SelectItem>
                      <SelectItem value="high-contrast">High Contrast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-grid">Show Grid Lines</Label>
                  <Switch
                    id="show-grid"
                    checked={settings.showGrid}
                    onCheckedChange={(checked) => updateSetting("showGrid", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-volume">Show Volume Bars</Label>
                  <Switch
                    id="show-volume"
                    checked={settings.showVolume}
                    onCheckedChange={(checked) => updateSetting("showVolume", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accessibility Settings */}
          <TabsContent value="accessibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Options</CardTitle>
                <CardDescription>Settings to improve accessibility and usability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="screen-reader">Screen Reader Support</Label>
                    <p className="text-sm text-muted-foreground">Enhanced ARIA labels and descriptions</p>
                  </div>
                  <Switch
                    id="screen-reader"
                    checked={settings.screenReader}
                    onCheckedChange={(checked) => updateSetting("screenReader", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="keyboard-nav">Keyboard Navigation</Label>
                    <p className="text-sm text-muted-foreground">Navigate using keyboard shortcuts</p>
                  </div>
                  <Switch
                    id="keyboard-nav"
                    checked={settings.keyboardNav}
                    onCheckedChange={(checked) => updateSetting("keyboardNav", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="high-contrast">High Contrast Mode</Label>
                    <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => updateSetting("highContrast", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reduced-motion">Reduced Motion</Label>
                    <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                  </div>
                  <Switch
                    id="reduced-motion"
                    checked={settings.reducedMotion}
                    onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="focus-indicators">Focus Indicators</Label>
                    <p className="text-sm text-muted-foreground">Show clear focus outlines</p>
                  </div>
                  <Switch
                    id="focus-indicators"
                    checked={settings.focusIndicators}
                    onCheckedChange={(checked) => updateSetting("focusIndicators", checked)}
                  />
                </div>

                {/* Keyboard Shortcuts Reference */}
                <Separator />
                <div className="space-y-2">
                  <Label>Keyboard Shortcuts</Label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Toggle Sidebar:</span>
                      <Badge variant="outline">Ctrl + B</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Search:</span>
                      <Badge variant="outline">Ctrl + K</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Settings:</span>
                      <Badge variant="outline">Ctrl + ,</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Help:</span>
                      <Badge variant="outline">F1</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage alerts and notification settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="price-alerts">Price Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified of significant price changes</p>
                  </div>
                  <Switch
                    id="price-alerts"
                    checked={settings.priceAlerts}
                    onCheckedChange={(checked) => updateSetting("priceAlerts", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Browser push notifications</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sound-enabled">Sound Alerts</Label>
                    <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
                  </div>
                  <Switch
                    id="sound-enabled"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => updateSetting("soundEnabled", checked)}
                  />
                </div>

                {settings.soundEnabled && (
                  <div className="space-y-2">
                    <Label>Alert Volume: {settings.alertVolume[0]}%</Label>
                    <Slider
                      value={settings.alertVolume}
                      onValueChange={(value) => updateSetting("alertVolume", value)}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Settings */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Control data refresh and storage settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-refresh">Auto Refresh</Label>
                    <p className="text-sm text-muted-foreground">Automatically update market data</p>
                  </div>
                  <Switch
                    id="auto-refresh"
                    checked={settings.autoRefresh}
                    onCheckedChange={(checked) => updateSetting("autoRefresh", checked)}
                  />
                </div>

                {settings.autoRefresh && (
                  <div className="space-y-2">
                    <Label>Refresh Interval</Label>
                    <Select
                      value={settings.refreshInterval.toString()}
                      onValueChange={(value) => updateSetting("refreshInterval", Number.parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 second</SelectItem>
                        <SelectItem value="5">5 seconds</SelectItem>
                        <SelectItem value="10">10 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="data-caching">Data Caching</Label>
                    <p className="text-sm text-muted-foreground">Cache data for faster loading</p>
                  </div>
                  <Switch
                    id="data-caching"
                    checked={settings.dataCaching}
                    onCheckedChange={(checked) => updateSetting("dataCaching", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data Retention</Label>
                  <Select
                    value={settings.dataRetention.toString()}
                    onValueChange={(value) => updateSetting("dataRetention", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trading Settings */}
          <TabsContent value="trading" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading Preferences</CardTitle>
                <CardDescription>Configure trading behavior and safety settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="confirm-orders">Confirm Orders</Label>
                    <p className="text-sm text-muted-foreground">Show confirmation dialog before placing orders</p>
                  </div>
                  <Switch
                    id="confirm-orders"
                    checked={settings.confirmOrders}
                    onCheckedChange={(checked) => updateSetting("confirmOrders", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Default Leverage: {settings.defaultLeverage[0]}x</Label>
                  <Slider
                    value={settings.defaultLeverage}
                    onValueChange={(value) => updateSetting("defaultLeverage", value)}
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="risk-warnings">Risk Warnings</Label>
                    <p className="text-sm text-muted-foreground">Show risk warnings for high-leverage trades</p>
                  </div>
                  <Switch
                    id="risk-warnings"
                    checked={settings.riskWarnings}
                    onCheckedChange={(checked) => updateSetting("riskWarnings", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Data</CardTitle>
                <CardDescription>Control your privacy and data sharing preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="share-data">Share Anonymous Data</Label>
                    <p className="text-sm text-muted-foreground">Help improve the platform with anonymous usage data</p>
                  </div>
                  <Switch
                    id="share-data"
                    checked={settings.shareData}
                    onCheckedChange={(checked) => updateSetting("shareData", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics">Analytics</Label>
                    <p className="text-sm text-muted-foreground">Allow analytics tracking for platform improvement</p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={settings.analytics}
                    onCheckedChange={(checked) => updateSetting("analytics", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cookies">Cookies</Label>
                    <p className="text-sm text-muted-foreground">Allow cookies for enhanced functionality</p>
                  </div>
                  <Switch
                    id="cookies"
                    checked={settings.cookies}
                    onCheckedChange={(checked) => updateSetting("cookies", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Settings Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Settings Management</CardTitle>
            <CardDescription>Export, import, or reset your settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={exportSettings} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Settings
              </Button>
              <Button variant="outline" onClick={() => document.getElementById("import-settings")?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Import Settings
              </Button>
              <input id="import-settings" type="file" accept=".json" onChange={importSettings} className="hidden" />
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
