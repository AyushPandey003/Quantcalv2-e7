"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSettings } from "@/contexts/settings-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  User,
  Settings,
  Bell,
  Database,
  Shield,
  Palette,
  Accessibility,
  Download,
  Upload,
  Save,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { 
  getUserProfileAction, 
  updateUserProfileAction, 
  updateUserSettingsAction, 
  changePasswordAction,
  exportUserDataAction,
  type ProfileActionResult 
} from "@/actions/profile"
import { type UserSettingsData } from "@/lib/auth/user-profile-service"

interface UserProfileProps {
  onNavigate: (view: "home" | "calendar" | "dashboard" | "profile") => void
}

export function UserProfile({ onNavigate }: UserProfileProps) {
  const { toast } = useToast()
  const { settings, updateSettings } = useSettings()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phoneNumber: "",
    dateOfBirth: "",
    bio: "",
    location: "",
    website: "",
    twitter: "",
    profileImage: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  })

  // Load user data on component mount
  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      const result = await getUserProfileAction()
      
      if (result.success && result.data) {
        const { user, preferences } = result.data
        
        // Set profile data
        setProfile({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          username: user.username || "",
          phoneNumber: user.phoneNumber || "",
          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
          bio: user.bio || "",
          location: user.location || "",
          website: user.website || "",
          twitter: user.twitter || "",
          profileImage: user.profileImage || "",
        })

        // Set settings data if preferences exist
        if (preferences) {
          setSettings({
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
          })
        }

        setUserData(user)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to load user data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key: string, value: any) => {
    updateSettings({ [key]: value })
  }

  const handleProfileChange = (key: string, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  const handlePasswordChange = (key: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      
      const formData = new FormData()
      Object.entries(profile).forEach(([key, value]) => {
        if (value) formData.append(key, value)
      })

      const result = await updateUserProfileAction(formData)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      
      const result = await updateUserSettingsAction(settings)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Settings saved successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      setSaving(true)
      
      const formData = new FormData()
      formData.append('currentPassword', passwordData.currentPassword)
      formData.append('newPassword', passwordData.newPassword)

      const result = await changePasswordAction(formData)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        })
        setPasswordData({ currentPassword: "", newPassword: "" })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to change password",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleExportSettings = async () => {
    try {
      const result = await exportUserDataAction()
      
      if (result.success && result.data) {
        const dataStr = JSON.stringify(result.data, null, 2)
        const dataBlob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = "quantcal-user-data.json"
        link.click()

        toast({
          title: "Settings Exported",
          description: "Your data has been downloaded as a JSON file.",
        })
      } else {
        toast({
          title: "Export Failed",
          description: result.message || "Failed to export data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      })
    }
  }

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string)
          
          // Update settings if imported data contains settings
          if (importedData.settings) {
            setSettings(importedData.settings)
          }
          
          // Update profile if imported data contains profile
          if (importedData.profile) {
            setProfile(importedData.profile)
          }
          
          toast({
            title: "Settings Imported",
            description: "Your settings have been imported successfully.",
          })
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Invalid settings file format.",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate("home")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span className="text-xl font-bold">User Profile</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => onNavigate("calendar")}>
              Calendar
            </Button>
            <Button variant="outline" onClick={() => onNavigate("dashboard")}>
              Trading
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>Manage your personal information and public profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => handleProfileChange("firstName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => handleProfileChange("lastName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => handleProfileChange("username", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={profile.phoneNumber}
                      onChange={(e) => handleProfileChange("phoneNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) => handleProfileChange("dateOfBirth", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={profile.bio}
                    onChange={(e) => handleProfileChange("bio", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => handleProfileChange("location", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={profile.website}
                      onChange={(e) => handleProfileChange("website", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="twitter">Twitter Handle</Label>
                  <Input
                    id="twitter"
                    value={profile.twitter}
                    onChange={(e) => handleProfileChange("twitter", e.target.value)}
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input 
                      id="currentPassword" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input 
                      id="newPassword" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Profile
                  </Button>
                  <Button onClick={handleChangePassword} disabled={saving} variant="outline">
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Display Settings Tab */}
          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Display Settings</span>
                </CardTitle>
                <CardDescription>Customize the appearance and layout of the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={settings.theme} onValueChange={(value) => handleSettingChange("theme", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Font Size: {settings.fontSize}px</Label>
                  <Slider
                    value={[settings.fontSize]}
                    onValueChange={(value) => handleSettingChange("fontSize", value[0])}
                    max={20}
                    min={12}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Chart Height: {settings.chartHeight}px</Label>
                  <Slider
                    value={[settings.chartHeight]}
                    onValueChange={(value) => handleSettingChange("chartHeight", value[0])}
                    max={800}
                    min={200}
                    step={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color Scheme</Label>
                  <Select
                    value={settings.colorScheme}
                    onValueChange={(value) => handleSettingChange("colorScheme", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="colorblind">Colorblind Friendly</SelectItem>
                      <SelectItem value="monochrome">Monochrome</SelectItem>
                      <SelectItem value="vibrant">Vibrant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-grid">Show Grid Lines</Label>
                  <Switch
                    id="show-grid"
                    checked={settings.showGrid}
                    onCheckedChange={(checked) => handleSettingChange("showGrid", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-volume">Show Volume Bars</Label>
                  <Switch
                    id="show-volume"
                    checked={settings.showVolume}
                    onCheckedChange={(checked) => handleSettingChange("showVolume", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accessibility Tab */}
          <TabsContent value="accessibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Accessibility className="h-5 w-5" />
                  <span>Accessibility Settings</span>
                </CardTitle>
                <CardDescription>Configure accessibility features for better usability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="high-contrast">High Contrast Mode</Label>
                    <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => handleSettingChange("highContrast", checked)}
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
                    onCheckedChange={(checked) => handleSettingChange("reducedMotion", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="screen-reader">Screen Reader Support</Label>
                    <p className="text-sm text-muted-foreground">Enhanced support for screen readers</p>
                  </div>
                  <Switch
                    id="screen-reader"
                    checked={settings.screenReader}
                    onCheckedChange={(checked) => handleSettingChange("screenReader", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="keyboard-nav">Keyboard Navigation</Label>
                    <p className="text-sm text-muted-foreground">Enable full keyboard navigation</p>
                  </div>
                  <Switch
                    id="keyboard-nav"
                    checked={settings.keyboardNav}
                    onCheckedChange={(checked) => handleSettingChange("keyboardNav", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="focus-indicators">Focus Indicators</Label>
                    <p className="text-sm text-muted-foreground">Show clear focus indicators</p>
                  </div>
                  <Switch
                    id="focus-indicators"
                    checked={settings.focusIndicators}
                    onCheckedChange={(checked) => handleSettingChange("focusIndicators", checked)}
                  />
                </div>

                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Toggle Theme</span>
                      <Badge variant="outline">Ctrl + Shift + T</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Open Calendar</span>
                      <Badge variant="outline">Ctrl + 1</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Open Trading</span>
                      <Badge variant="outline">Ctrl + 2</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Search</span>
                      <Badge variant="outline">Ctrl + K</Badge>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Settings</span>
                </CardTitle>
                <CardDescription>Configure how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="price-alerts">Price Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when prices hit your targets</p>
                  </div>
                  <Switch
                    id="price-alerts"
                    checked={settings.priceAlerts}
                    onCheckedChange={(checked) => handleSettingChange("priceAlerts", checked)}
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
                    onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
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
                    onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sound-alerts">Sound Alerts</Label>
                    <p className="text-sm text-muted-foreground">Play sounds for important alerts</p>
                  </div>
                  <Switch
                    id="sound-alerts"
                    checked={settings.soundAlerts}
                    onCheckedChange={(checked) => handleSettingChange("soundAlerts", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Alert Frequency</Label>
                  <Select
                    value={settings.alertFrequency}
                    onValueChange={(value) => handleSettingChange("alertFrequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="5min">Every 5 minutes</SelectItem>
                      <SelectItem value="15min">Every 15 minutes</SelectItem>
                      <SelectItem value="1hour">Every hour</SelectItem>
                      <SelectItem value="daily">Daily digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trading Tab */}
          <TabsContent value="trading" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Trading Settings</span>
                </CardTitle>
                <CardDescription>Configure trading preferences and risk management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="confirm-orders">Confirm Orders</Label>
                    <p className="text-sm text-muted-foreground">Require confirmation before placing orders</p>
                  </div>
                  <Switch
                    id="confirm-orders"
                    checked={settings.confirmOrders}
                    onCheckedChange={(checked) => handleSettingChange("confirmOrders", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Default Leverage: {settings.defaultLeverage}x</Label>
                  <Slider
                    value={[settings.defaultLeverage]}
                    onValueChange={(value) => handleSettingChange("defaultLeverage", value[0])}
                    max={125}
                    min={1}
                    step={1}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="risk-warnings">Risk Warnings</Label>
                    <p className="text-sm text-muted-foreground">Show warnings for high-risk trades</p>
                  </div>
                  <Switch
                    id="risk-warnings"
                    checked={settings.riskWarnings}
                    onCheckedChange={(checked) => handleSettingChange("riskWarnings", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="paper-trading">Paper Trading Mode</Label>
                    <p className="text-sm text-muted-foreground">Practice trading with virtual funds</p>
                  </div>
                  <Switch
                    id="paper-trading"
                    checked={settings.paperTrading}
                    onCheckedChange={(checked) => handleSettingChange("paperTrading", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacy & Security</span>
                </CardTitle>
                <CardDescription>Manage your privacy settings and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="share-data">Share Usage Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve the platform by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch
                    id="share-data"
                    checked={settings.shareData}
                    onCheckedChange={(checked) => handleSettingChange("shareData", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics">Analytics</Label>
                    <p className="text-sm text-muted-foreground">Allow analytics tracking for better user experience</p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={settings.analytics}
                    onCheckedChange={(checked) => handleSettingChange("analytics", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cookies">Cookies</Label>
                    <p className="text-sm text-muted-foreground">Allow cookies for personalization</p>
                  </div>
                  <Switch
                    id="cookies"
                    checked={settings.cookies}
                    onCheckedChange={(checked) => handleSettingChange("cookies", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    id="two-factor"
                    checked={settings.twoFactor}
                    onCheckedChange={(checked) => handleSettingChange("twoFactor", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data Retention</Label>
                  <Select
                    value={settings.dataRetention}
                    onValueChange={(value) => handleSettingChange("dataRetention", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30days">30 Days</SelectItem>
                      <SelectItem value="90days">90 Days</SelectItem>
                      <SelectItem value="6months">6 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Data Management</span>
                </CardTitle>
                <CardDescription>Export, import, and manage your application data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-sync">Auto Sync</Label>
                    <p className="text-sm text-muted-foreground">Automatically sync data across devices</p>
                  </div>
                  <Switch
                    id="auto-sync"
                    checked={settings.autoSync}
                    onCheckedChange={(checked) => handleSettingChange("autoSync", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select
                    value={settings.exportFormat}
                    onValueChange={(value) => handleSettingChange("exportFormat", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xlsx">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleExportSettings} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    Export Settings
                  </Button>
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportSettings}
                      className="hidden"
                      id="import-settings"
                    />
                    <Button asChild variant="outline" disabled={saving}>
                      <label htmlFor="import-settings" className="cursor-pointer">
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                        Import Settings
                      </label>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="api-access">API Access</Label>
                    <p className="text-sm text-muted-foreground">Enable API access for third-party applications</p>
                  </div>
                  <Switch
                    id="api-access"
                    checked={settings.apiAccess}
                    onCheckedChange={(checked) => handleSettingChange("apiAccess", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Save Button */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onNavigate("home")}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save All Settings
            </Button>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
