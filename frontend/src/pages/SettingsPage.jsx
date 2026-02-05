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
  Check
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useAuthStore, useOrgStore, useUIStore } from '../store';
import { toast } from 'sonner';

export function SettingsPage() {
  const { user } = useAuthStore();
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
  });
  
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    // Simulate API call
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

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl" data-testid="settings-page">
        {/* Header */}
        <div>
          <h1 className="font-barlow text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
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
                  <h4 className="text-sm font-medium">Data Settings</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require GPS</Label>
                      <p className="text-sm text-muted-foreground">
                        All submissions must include GPS coordinates
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-approve Submissions</Label>
                      <p className="text-sm text-muted-foreground">
                        Submissions with 90%+ quality score are auto-approved
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Duplicate Detection</Label>
                      <p className="text-sm text-muted-foreground">
                        Flag potentially duplicate submissions
                      </p>
                    </div>
                    <Switch defaultChecked />
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
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>API Access</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow API access for integrations
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Organization Settings
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
