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
import { 
  Bell, 
  Send, 
  Loader2, 
  RefreshCw, 
  Users, 
  Smartphone, 
  Clock,
  CheckCircle2,
  XCircle,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from '@/lib/toast';
import {
  getNotificationStats,
  getBroadcastHistory,
  sendBroadcastNotification,
  NotificationStats,
  BroadcastNotification
} from '@/services/notifications-api';

export default function SendNotificationPage() {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [history, setHistory] = useState<BroadcastNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Fetch stats and history
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsResult, historyResult] = await Promise.all([
        getNotificationStats(),
        getBroadcastHistory(10)
      ]);

      console.log('Stats result:', statsResult);
      console.log('History result:', historyResult);
      
      if (statsResult.success) {
        // Stats can be in statsResult.stats or statsResult.data.stats
        const statsData = (statsResult as any).stats || statsResult.data?.stats || statsResult.data;
        if (statsData) {
          setStats(statsData);
        }
      }

      if (historyResult.success) {
        // Notifications can be in historyResult.notifications or historyResult.data.notifications
        const notifications = (historyResult as any).notifications || historyResult.data?.notifications || historyResult.data || [];
        console.log('Parsed notifications:', notifications);
        setHistory(Array.isArray(notifications) ? notifications : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load notification data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendNotification = async () => {
    if (!title.trim()) {
      toast.error('Please enter a notification title');
      return;
    }
    if (!body.trim()) {
      toast.error('Please enter a notification message');
      return;
    }

    try {
      setSending(true);
      const result = await sendBroadcastNotification({
        title: title.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim() || undefined
      });

      if (result.success) {
        toast.success(`Notification sent to ${result.data?.totalDevices || 'all'} devices!`);
        setTitle('');
        setBody('');
        setImageUrl('');
        fetchData(); // Refresh history
      } else {
        toast.error(result.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <Breadcrumbs />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Send Notification</h1>
            <p className="text-muted-foreground">
              Send push notifications to all app users
            </p>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '-' : stats?.activeDevices || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Devices registered for notifications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users with Devices</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '-' : stats?.usersWithDevices || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Users who can receive notifications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '-' : stats?.totalDevices || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                All registered devices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Broadcasts Sent</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '-' : stats?.totalBroadcasts || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total broadcast notifications
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Send Notification Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Broadcast Notification
              </CardTitle>
              <CardDescription>
                This notification will be sent to all users with the app installed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Notification Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., New Course Available!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  {title.length}/100 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Message *</Label>
                <Textarea
                  id="body"
                  placeholder="Write your notification message here..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {body.length}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Image URL (Optional)
                </Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  type="url"
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Add an image to your notification
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <Users className="inline h-4 w-4 mr-1" />
                  Will be sent to {stats?.activeDevices || 0} devices
                </div>
                <Button 
                  onClick={handleSendNotification} 
                  disabled={sending || !title.trim() || !body.trim()}
                  className="min-w-[140px]"
                >
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send to All
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Broadcasts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Broadcasts
              </CardTitle>
              <CardDescription>
                Last 10 broadcast notifications sent
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No broadcasts sent yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {history.map((notification) => (
                    <div 
                      key={notification.id}
                      className="border rounded-lg p-3 space-y-1"
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-medium text-sm">{notification.title}</div>
                        <Badge variant={notification.status === 'broadcast' ? 'default' : 'secondary'}>
                          {notification.status === 'broadcast' ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {notification.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.body}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
