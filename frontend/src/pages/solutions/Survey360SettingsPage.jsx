import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Palette, Shield, Save, Moon, Sun, Monitor, BarChart3, ExternalLink } from 'lucide-react';
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
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const isDark = theme === 'dark';
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [notifications, setNotifications] = useState({ email_responses: true, email_weekly: true });

  const handleSave = () => { toast.success('Settings saved'); };

  return (
    <div className="space-y-6">
      <div><h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</h1><p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Manage your account and preferences</p></div>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className={`grid w-full max-w-lg grid-cols-5 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
          <TabsTrigger value="profile" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"><Palette className="w-4 h-4 mr-2" />Theme</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"><Bell className="w-4 h-4 mr-2" />Alerts</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"><Shield className="w-4 h-4 mr-2" />Security</TabsTrigger>
          <TabsTrigger value="admin" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"><BarChart3 className="w-4 h-4 mr-2" />Admin</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card className={isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}>
            <CardHeader><CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Profile Information</CardTitle><CardDescription className={isDark ? 'text-gray-400' : 'text-gray-500'}>Update your personal details</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Full Name</Label><Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'} /></div>
              <div className="space-y-2"><Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Email</Label><Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className={isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'} /></div>
              <Button onClick={handleSave} className="bg-gradient-to-r from-teal-500 to-teal-600 text-white"><Save className="w-4 h-4 mr-2" />Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card className={isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}>
            <CardHeader><CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Appearance</CardTitle><CardDescription className={isDark ? 'text-gray-400' : 'text-gray-500'}>Customize how Survey360 looks</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[{ value: 'light', label: 'Light', icon: Sun }, { value: 'dark', label: 'Dark', icon: Moon }, { value: 'system', label: 'System', icon: Monitor }].map(({ value, label, icon: Icon }) => (
                  <button key={value} onClick={() => setTheme(value)} className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${theme === value ? 'border-teal-500 bg-teal-500/10' : isDark ? 'border-white/10 hover:border-white/30' : 'border-gray-200 hover:border-gray-300'}`}>
                    <Icon className={`w-6 h-6 ${theme === value ? 'text-teal-400' : isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-sm ${theme === value ? 'text-teal-400 font-medium' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card className={isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}>
            <CardHeader><CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Notifications</CardTitle><CardDescription className={isDark ? 'text-gray-400' : 'text-gray-500'}>Configure how you receive notifications</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between"><div><Label className={isDark ? 'text-white' : 'text-gray-900'}>Response Notifications</Label><p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Get notified when someone submits a response</p></div><Switch checked={notifications.email_responses} onCheckedChange={(checked) => setNotifications({ ...notifications, email_responses: checked })} /></div>
              <Separator className={isDark ? 'bg-white/10' : 'bg-gray-200'} />
              <div className="flex items-center justify-between"><div><Label className={isDark ? 'text-white' : 'text-gray-900'}>Weekly Summary</Label><p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Receive a weekly summary of your survey activity</p></div><Switch checked={notifications.email_weekly} onCheckedChange={(checked) => setNotifications({ ...notifications, email_weekly: checked })} /></div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card className={isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}>
            <CardHeader><CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Change Password</CardTitle><CardDescription className={isDark ? 'text-gray-400' : 'text-gray-500'}>Update your account password</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Current Password</Label><Input type="password" className={isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'} /></div>
              <div className="space-y-2"><Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>New Password</Label><Input type="password" className={isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'} /></div>
              <div className="space-y-2"><Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Confirm Password</Label><Input type="password" className={isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'} /></div>
              <Button onClick={handleSave}>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admin">
          <Card className={isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}>
            <CardHeader>
              <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Admin Tools</CardTitle>
              <CardDescription className={isDark ? 'text-gray-400' : 'text-gray-500'}>Administrative features and analytics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Help Center Analytics</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>View AI Assistant usage, feedback, and insights</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/solutions/survey360/app/help-analytics')} 
                    className="bg-gradient-to-r from-teal-500 to-teal-600 text-white"
                    data-testid="help-analytics-btn"
                  >
                    Open Dashboard
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Survey360SettingsPage;
