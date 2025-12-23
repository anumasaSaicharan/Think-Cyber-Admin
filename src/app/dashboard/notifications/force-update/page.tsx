'use client';

import { useState, useEffect, useCallback } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Smartphone, 
  Loader2, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Shield,
  Zap
} from 'lucide-react';
import { toast } from '@/lib/toast';
import {
  getAppVersionSettings,
  updateAppVersionSettings,
  triggerForceUpdate,
  disableForceUpdate,
  AppVersionSettings
} from '@/services/notifications-api';

export default function ForceUpdatePage() {
  const [settings, setSettings] = useState<AppVersionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(false);
  
  // Form state
  const [latestVersionName, setLatestVersionName] = useState('');
  const [latestVersionCode, setLatestVersionCode] = useState('');
  const [minVersionCode, setMinVersionCode] = useState('');
  const [message, setMessage] = useState('');
  const [androidStoreUrl, setAndroidStoreUrl] = useState('');
  const [iosStoreUrl, setIosStoreUrl] = useState('');
  const [updateRequired, setUpdateRequired] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);

  // Fetch current settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAppVersionSettings();

      if (result.success && result.data) {
        const data = result.data;
        setSettings(data);
        setLatestVersionName(data.latestVersionName || '1.0.0');
        setLatestVersionCode(String(data.latestVersionCode || 1));
        setMinVersionCode(String(data.minVersionCode || data.latestVersionCode || 1));
        setMessage(data.message || '');
        setAndroidStoreUrl(data.androidStoreUrl || '');
        setIosStoreUrl(data.iosStoreUrl || '');
        setUpdateRequired(data.updateRequired || false);
        setForceUpdate(data.forceUpdate || false);
      } else {
        console.error('API error:', result.error);
        toast.error(result.error || 'Failed to load app settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load app settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveSettings = async () => {
    if (!latestVersionName.trim()) {
      toast.error('Please enter version name');
      return;
    }
    if (!latestVersionCode || parseInt(latestVersionCode) < 1) {
      toast.error('Please enter a valid version code');
      return;
    }

    try {
      setSaving(true);
      const result = await updateAppVersionSettings({
        latestVersionName: latestVersionName.trim(),
        latestVersionCode: parseInt(latestVersionCode),
        minVersionCode: minVersionCode ? parseInt(minVersionCode) : parseInt(latestVersionCode),
        message: message.trim(),
        androidStoreUrl: androidStoreUrl.trim(),
        iosStoreUrl: iosStoreUrl.trim(),
        updateRequired,
        forceUpdate
      });

      if (result.success) {
        toast.success('Settings saved successfully!');
        fetchSettings();
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerForceUpdate = async () => {
    if (!latestVersionName.trim()) {
      toast.error('Please enter version name');
      return;
    }
    if (!latestVersionCode || parseInt(latestVersionCode) < 1) {
      toast.error('Please enter a valid version code');
      return;
    }

    try {
      setTriggering(true);
      const result = await triggerForceUpdate({
        latestVersionName: latestVersionName.trim(),
        latestVersionCode: parseInt(latestVersionCode),
        minVersionCode: minVersionCode ? parseInt(minVersionCode) : undefined,
        message: message.trim() || undefined
      });

      if (result.success) {
        toast.success('Force update triggered successfully! All users will be prompted to update.');
        fetchSettings();
      } else {
        toast.error(result.error || 'Failed to trigger force update');
      }
    } catch (error) {
      console.error('Error triggering force update:', error);
      toast.error('Failed to trigger force update');
    } finally {
      setTriggering(false);
    }
  };

  const handleDisableForceUpdate = async () => {
    try {
      setTriggering(true);
      const result = await disableForceUpdate();

      if (result.success) {
        toast.success('Force update disabled!');
        fetchSettings();
      } else {
        toast.error(result.error || 'Failed to disable force update');
      }
    } catch (error) {
      console.error('Error disabling force update:', error);
      toast.error('Failed to disable force update');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <Breadcrumbs />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Force Update</h1>
            <p className="text-muted-foreground">
              Manage app version and force users to update
            </p>
          </div>
          <Button variant="outline" onClick={fetchSettings} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Current Status Card */}
        <Card className={settings?.forceUpdate ? 'border-destructive' : settings?.updateRequired ? 'border-yellow-500' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {settings?.forceUpdate ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : settings?.updateRequired ? (
                <Download className="h-5 w-5 text-yellow-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Current Version</p>
                  <p className="text-xl font-bold">{settings?.latestVersionName || '-'}</p>
                  <p className="text-xs text-muted-foreground">Code: {settings?.latestVersionCode || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Minimum Required</p>
                  <p className="text-xl font-bold">{settings?.minVersionCode || '-'}</p>
                  <p className="text-xs text-muted-foreground">Version code</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Update Available</p>
                  <Badge variant={settings?.updateRequired ? 'default' : 'secondary'}>
                    {settings?.updateRequired ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Force Update</p>
                  <Badge variant={settings?.forceUpdate ? 'destructive' : 'secondary'}>
                    {settings?.forceUpdate ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Version Settings Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Version Settings
              </CardTitle>
              <CardDescription>
                Configure app version and update behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="versionName">Latest Version Name *</Label>
                  <Input
                    id="versionName"
                    placeholder="e.g., 2.0.0"
                    value={latestVersionName}
                    onChange={(e) => setLatestVersionName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="versionCode">Latest Version Code *</Label>
                  <Input
                    id="versionCode"
                    type="number"
                    placeholder="e.g., 30"
                    value={latestVersionCode}
                    onChange={(e) => setLatestVersionCode(e.target.value)}
                    min={1}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minVersionCode">Minimum Required Version Code</Label>
                <Input
                  id="minVersionCode"
                  type="number"
                  placeholder="e.g., 25"
                  value={minVersionCode}
                  onChange={(e) => setMinVersionCode(e.target.value)}
                  min={1}
                />
                <p className="text-xs text-muted-foreground">
                  Users below this version will be forced to update
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Update Message</Label>
                <Textarea
                  id="message"
                  placeholder="A new version is available with exciting features!"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="androidUrl">Android Store URL</Label>
                <Input
                  id="androidUrl"
                  placeholder="https://play.google.com/store/apps/details?id=..."
                  value={androidStoreUrl}
                  onChange={(e) => setAndroidStoreUrl(e.target.value)}
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iosUrl">iOS Store URL</Label>
                <Input
                  id="iosUrl"
                  placeholder="https://apps.apple.com/app/..."
                  value={iosStoreUrl}
                  onChange={(e) => setIosStoreUrl(e.target.value)}
                  type="url"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Update Available</Label>
                  <p className="text-xs text-muted-foreground">
                    Show update prompt to users
                  </p>
                </div>
                <Switch
                  checked={updateRequired}
                  onCheckedChange={setUpdateRequired}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-destructive">Force Update</Label>
                  <p className="text-xs text-muted-foreground">
                    Block app usage until updated
                  </p>
                </div>
                <Switch
                  checked={forceUpdate}
                  onCheckedChange={setForceUpdate}
                />
              </div>

              <Button 
                onClick={handleSaveSettings} 
                disabled={saving || loading}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Quickly trigger or disable force update
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trigger Force Update */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-destructive mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="font-semibold">Trigger Force Update</h3>
                    <p className="text-sm text-muted-foreground">
                      Immediately enable force update for all users. Users will be blocked from using the app until they update to the latest version.
                    </p>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={handleTriggerForceUpdate}
                  disabled={triggering || loading}
                  className="w-full"
                >
                  {triggering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Trigger Force Update Now
                    </>
                  )}
                </Button>
              </div>

              {/* Disable Force Update */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-6 w-6 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="font-semibold">Disable Force Update</h3>
                    <p className="text-sm text-muted-foreground">
                      Turn off force update requirement. Users will be able to continue using older versions of the app.
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleDisableForceUpdate}
                  disabled={triggering || loading || !settings?.forceUpdate}
                  className="w-full"
                >
                  {triggering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Disable Force Update
                    </>
                  )}
                </Button>
              </div>

              {/* Info Box */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">How it works</h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Mobile app checks <code className="bg-muted px-1 rounded">/api/app-settings/version</code> on startup</li>
                  <li>If force update is enabled and user&apos;s version is below minimum, app blocks usage</li>
                  <li>User is shown the update message and redirected to the store</li>
                  <li>Update message supports custom text for different scenarios</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
