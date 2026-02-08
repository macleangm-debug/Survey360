import React, { useState } from 'react';
import { User, Bell, Palette, Shield, Save, Moon, Sun, Monitor } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuthStore, useUIStore } from '../../store';
import { toast } from 'sonner';

export function Survey360SettingsPage() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [notifications, setNotifications] = useState({ email_responses: true, email_weekly: true });

  const handleSave = () => { toast.success('Settings saved'); };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-white">Settings</h1><p className="text-gray-400">Manage your account and preferences</p></div>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-4 bg-white/5">
          <TabsTrigger value="profile" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"><Palette className="w-4 h-4 mr-2" />Theme</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"><Bell className="w-4 h-4 mr-2" />Alerts</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"><Shield className="w-4 h-4 mr-2" />Security</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white">Profile Information</CardTitle><CardDescription className="text-gray-400">Update your personal details</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label className="text-gray-300">Full Name</Label><Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
              <div className="space-y-2"><Label className="text-gray-300">Email</Label><Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
              <Button onClick={handleSave} className="bg-gradient-to-r from-teal-500 to-teal-600 text-white"><Save className="w-4 h-4 mr-2" />Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white">Appearance</CardTitle><CardDescription className="text-gray-400">Customize how Survey360 looks</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[{ value: 'light', label: 'Light', icon: Sun }, { value: 'dark', label: 'Dark', icon: Moon }, { value: 'system', label: 'System', icon: Monitor }].map(({ value, label, icon: Icon }) => (
                  <button key={value} onClick={() => setTheme(value)} className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${theme === value ? 'border-teal-500 bg-teal-500/10' : 'border-white/10 hover:border-white/30'}`}>
                    <Icon className={`w-6 h-6 ${theme === value ? 'text-teal-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${theme === value ? 'text-teal-400 font-medium' : 'text-gray-500'}`}>{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white">Notifications</CardTitle><CardDescription className="text-gray-400">Configure how you receive notifications</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between"><div><Label className="text-white">Response Notifications</Label><p className="text-sm text-gray-500">Get notified when someone submits a response</p></div><Switch checked={notifications.email_responses} onCheckedChange={(checked) => setNotifications({ ...notifications, email_responses: checked })} /></div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between"><div><Label className="text-white">Weekly Summary</Label><p className="text-sm text-gray-500">Receive a weekly summary of your survey activity</p></div><Switch checked={notifications.email_weekly} onCheckedChange={(checked) => setNotifications({ ...notifications, email_weekly: checked })} /></div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white">Change Password</CardTitle><CardDescription className="text-gray-400">Update your account password</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label className="text-gray-300">Current Password</Label><Input type="password" className="bg-white/5 border-white/10 text-white" /></div>
              <div className="space-y-2"><Label className="text-gray-300">New Password</Label><Input type="password" className="bg-white/5 border-white/10 text-white" /></div>
              <div className="space-y-2"><Label className="text-gray-300">Confirm Password</Label><Input type="password" className="bg-white/5 border-white/10 text-white" /></div>
              <Button onClick={handleSave}>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Survey360SettingsPage;
