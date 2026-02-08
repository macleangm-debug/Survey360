import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Building2,
  Bell,
  Globe,
  Palette,
  Shield,
  Key,
  Save,
  Moon,
  Sun,
  Check,
  Download,
  Database,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  FileText,
  Webhook,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Monitor,
  Smartphone,
  Laptop,
  Lock,
  Unlock,
  HardDrive,
  Wifi,
  WifiOff,
  LogOut,
  UserX,
  Clock,
  Calendar,
  MapPin,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useAuthStore, useOrgStore, useUIStore } from '../store';
import { toast } from 'sonner';

export function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { currentOrg } = useOrgStore();
  const { theme, setTheme, language, setLanguage } = useUIStore();
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  const [notifications, setNotifications] = useState({
    emailSubmissions: true,
    emailReviews: true,
    emailDigest: false,
    pushEnabled: false,
    soundEnabled: true,
  });

  const [orgSettings, setOrgSettings] = useState({
    requireGPS: true,
    autoApprove: false,
    duplicateDetection: true,
    require2FA: false,
    apiAccess: true,
    autoApproveThreshold: 90,
  });

  const [exportSettings, setExportSettings] = useState({
    defaultFormat: 'csv',
    includeMetadata: true,
    dateFormat: 'ISO',
    timezone: 'UTC',
  });

  const [privacySettings, setPrivacySettings] = useState({
    shareUsageData: true,
    allowAnalytics: true,
    showOnlineStatus: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: '30',
    loginAlerts: true,
  });

  // Mock connected devices
  const [connectedDevices, setConnectedDevices] = useState([
    { id: '1', name: 'MacBook Pro', type: 'laptop', location: 'Nairobi, Kenya', lastActive: new Date(), current: true },
    { id: '2', name: 'iPhone 14', type: 'mobile', location: 'Nairobi, Kenya', lastActive: new Date(Date.now() - 86400000), current: false },
    { id: '3', name: 'Windows PC', type: 'desktop', location: 'Mombasa, Kenya', lastActive: new Date(Date.now() - 172800000), current: false },
  ]);

  // Storage info mock
  const [storageInfo, setStorageInfo] = useState({
    used: 256,
    total: 1024,
    unit: 'MB'
  });

  const [apiKey, setApiKey] = useState('dp_sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  const [showApiKey, setShowApiKey] = useState(false);
  
  const [webhooks, setWebhooks] = useState([
    { id: '1', url: 'https://api.example.com/webhook', events: ['submission.created'], active: true, lastTriggered: '2024-01-15T10:30:00Z' },
  ]);
  const [newWebhook, setNewWebhook] = useState({ url: '', events: [] });
  
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Profile updated');
    setSaving(false);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Notification preferences saved');
    setSaving(false);
  };

  const handleSaveOrganization = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Organization settings saved');
    setSaving(false);
  };

  const handleSaveExport = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Export settings saved');
    setSaving(false);
  };

  const handleRegenerateApiKey = () => {
    const newKey = `dp_sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(newKey);
    toast.success('API key regenerated');
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success('API key copied to clipboard');
  };

  const webhookEvents = [
    { value: 'submission.created', label: 'New Submission' },
    { value: 'submission.approved', label: 'Submission Approved' },
    { value: 'submission.rejected', label: 'Submission Rejected' },
    { value: 'form.published', label: 'Form Published' },
    { value: 'case.created', label: 'Case Created' },
    { value: 'case.resolved', label: 'Case Resolved' },
  ];

  const handleAddWebhook = () => {
    if (!newWebhook.url || newWebhook.events.length === 0) {
      toast.error('Please provide a URL and select at least one event');
      return;
    }
    setWebhooks([...webhooks, { ...newWebhook, id: Date.now().toString(), active: true, lastTriggered: null }]);
    setNewWebhook({ url: '', events: [] });
    toast.success('Webhook added');
  };

  const handleDeleteWebhook = (id) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    toast.success('Webhook removed');
  };

  const handleToggleWebhook = (id) => {
    setWebhooks(webhooks.map(w => w.id === id ? { ...w, active: !w.active } : w));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl" data-testid="settings-page">
        {/* Header */}
        <div>
          <h1 className="font-barlow text-3xl font-bold tracking-tight text-white">Settings</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[500px]">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Alerts</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="api">API & Export</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="font-barlow flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Settings
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">Change Avatar</Button>
                    <p className="text-xs text-muted-foreground mt-2">JPG, PNG. Max 2MB</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      data-testid="settings-name-input"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      data-testid="settings-email-input"
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="sw">Kiswahili</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      This affects form labels and system text
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={saving} data-testid="save-profile-btn">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="font-barlow flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Sun className="w-5 h-5" />
                        <span className="font-medium">Light</span>
                        {theme === 'light' && <Check className="w-4 h-4 text-primary ml-auto" />}
                      </div>
                      <div className="mt-3 h-20 rounded bg-white border border-gray-200" />
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5" />
                        <span className="font-medium">Dark</span>
                        {theme === 'dark' && <Check className="w-4 h-4 text-primary ml-auto" />}
                      </div>
                      <div className="mt-3 h-20 rounded bg-gray-900 border border-gray-700" />
                    </button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce spacing for denser information display
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable smooth transitions and animations
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="font-barlow flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Email Notifications</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>New Submissions</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new data is submitted
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.emailSubmissions}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailSubmissions: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Review Requests</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when submissions need your review
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.emailReviews}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailReviews: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">
                        Summary of activity sent every Monday
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.emailDigest}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailDigest: checked })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Push Notifications</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications in your browser
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.pushEnabled}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, pushEnabled: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organization Tab */}
          <TabsContent value="organization">
            <Card>
              <CardHeader>
                <CardTitle className="font-barlow flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Organization Settings
                </CardTitle>
                <CardDescription>Manage {currentOrg?.name || 'organization'} settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Organization Name</Label>
                    <Input value={currentOrg?.name || ''} disabled />
                  </div>
                  <div className="grid gap-2">
                    <Label>Slug</Label>
                    <Input value={currentOrg?.slug || ''} disabled />
                    <p className="text-xs text-muted-foreground">
                      Used in URLs and API calls
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Data Collection Settings</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require GPS</Label>
                      <p className="text-sm text-muted-foreground">
                        All submissions must include GPS coordinates
                      </p>
                    </div>
                    <Switch 
                      checked={orgSettings.requireGPS}
                      onCheckedChange={(checked) => setOrgSettings({ ...orgSettings, requireGPS: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-approve Submissions</Label>
                      <p className="text-sm text-muted-foreground">
                        Submissions with high quality scores are auto-approved
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={orgSettings.autoApprove}
                        onCheckedChange={(checked) => setOrgSettings({ ...orgSettings, autoApprove: checked })}
                      />
                      {orgSettings.autoApprove && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Threshold:</span>
                          <Select 
                            value={String(orgSettings.autoApproveThreshold)} 
                            onValueChange={(v) => setOrgSettings({ ...orgSettings, autoApproveThreshold: Number(v) })}
                          >
                            <SelectTrigger className="w-20 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="80">80%</SelectItem>
                              <SelectItem value="85">85%</SelectItem>
                              <SelectItem value="90">90%</SelectItem>
                              <SelectItem value="95">95%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Duplicate Detection</Label>
                      <p className="text-sm text-muted-foreground">
                        Flag potentially duplicate submissions
                      </p>
                    </div>
                    <Switch 
                      checked={orgSettings.duplicateDetection}
                      onCheckedChange={(checked) => setOrgSettings({ ...orgSettings, duplicateDetection: checked })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Security</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for all organization members
                      </p>
                    </div>
                    <Switch 
                      checked={orgSettings.require2FA}
                      onCheckedChange={(checked) => setOrgSettings({ ...orgSettings, require2FA: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>API Access</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow API access for integrations
                      </p>
                    </div>
                    <Switch 
                      checked={orgSettings.apiAccess}
                      onCheckedChange={(checked) => setOrgSettings({ ...orgSettings, apiAccess: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveOrganization} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Organization Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API & Export Tab */}
          <TabsContent value="api" className="space-y-6">
            {/* API Key Management */}
            <Card>
              <CardHeader>
                <CardTitle className="font-barlow flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Keys
                </CardTitle>
                <CardDescription>Manage API keys for external integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Live API Key</Label>
                      <p className="text-sm text-muted-foreground">
                        Use this key for production integrations
                      </p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Input 
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        readOnly
                        className="font-mono pr-10"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-0 top-0"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <Button variant="outline" size="icon" onClick={handleCopyApiKey}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={handleRegenerateApiKey}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Keep your API key secret. Do not share it in publicly accessible code. 
                      If you believe your key has been compromised, regenerate it immediately.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="font-barlow flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Settings
                </CardTitle>
                <CardDescription>Configure default export preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Default Export Format</Label>
                    <Select 
                      value={exportSettings.defaultFormat} 
                      onValueChange={(v) => setExportSettings({ ...exportSettings, defaultFormat: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV (.csv)</SelectItem>
                        <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                        <SelectItem value="json">JSON (.json)</SelectItem>
                        <SelectItem value="stata">Stata (.dta)</SelectItem>
                        <SelectItem value="spss">SPSS (.sav)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select 
                      value={exportSettings.dateFormat} 
                      onValueChange={(v) => setExportSettings({ ...exportSettings, dateFormat: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ISO">ISO 8601 (2024-01-15T10:30:00Z)</SelectItem>
                        <SelectItem value="US">US Format (01/15/2024)</SelectItem>
                        <SelectItem value="EU">EU Format (15/01/2024)</SelectItem>
                        <SelectItem value="unix">Unix Timestamp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select 
                      value={exportSettings.timezone} 
                      onValueChange={(v) => setExportSettings({ ...exportSettings, timezone: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="local">Local Time</SelectItem>
                        <SelectItem value="EST">Eastern (EST/EDT)</SelectItem>
                        <SelectItem value="PST">Pacific (PST/PDT)</SelectItem>
                        <SelectItem value="EAT">East Africa (EAT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Include Metadata</Label>
                      <p className="text-sm text-muted-foreground">
                        Add submission timestamps, GPS, device info
                      </p>
                    </div>
                    <Switch 
                      checked={exportSettings.includeMetadata}
                      onCheckedChange={(checked) => setExportSettings({ ...exportSettings, includeMetadata: checked })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleSaveExport} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Export Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Webhooks */}
            <Card>
              <CardHeader>
                <CardTitle className="font-barlow flex items-center gap-2">
                  <Webhook className="w-5 h-5" />
                  Webhooks
                </CardTitle>
                <CardDescription>Configure webhook notifications for real-time integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Existing Webhooks */}
                {webhooks.length > 0 && (
                  <div className="space-y-3">
                    {webhooks.map((webhook) => (
                      <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center gap-2 mb-1">
                            {webhook.active ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            )}
                            <p className="font-mono text-sm truncate">{webhook.url}</p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {webhook.events.map((event) => (
                              <Badge key={event} variant="outline" className="text-xs">
                                {webhookEvents.find(e => e.value === event)?.label || event}
                              </Badge>
                            ))}
                          </div>
                          {webhook.lastTriggered && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={webhook.active}
                            onCheckedChange={() => handleToggleWebhook(webhook.id)}
                          />
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteWebhook(webhook.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Add New Webhook */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Add New Webhook</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Endpoint URL</Label>
                      <Input
                        placeholder="https://your-server.com/webhook"
                        value={newWebhook.url}
                        onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Events to Send</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {webhookEvents.map((event) => (
                          <label key={event.value} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted/50">
                            <input
                              type="checkbox"
                              checked={newWebhook.events.includes(event.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event.value] });
                                } else {
                                  setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(ev => ev !== event.value) });
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{event.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <Button onClick={handleAddWebhook} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Webhook
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="font-barlow flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Management
                </CardTitle>
                <CardDescription>Manage your organization&apos;s data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Export All Data</p>
                    <p className="text-sm text-muted-foreground">
                      Download all submissions, forms, and project data
                    </p>
                  </div>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Download Audit Log</p>
                    <p className="text-sm text-muted-foreground">
                      Export activity log for compliance purposes
                    </p>
                  </div>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                  <div>
                    <p className="font-medium text-destructive">Delete All Data</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete all organization data. This cannot be undone.
                    </p>
                  </div>
                  <Button variant="destructive">
                    Delete All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
