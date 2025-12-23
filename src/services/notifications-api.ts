'use client';

import { apiService, ApiResponse } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

// Admin API Key for protected endpoints
const ADMIN_API_KEY = 'thinkCyberAdminKey2024';

// Admin headers for protected endpoints
const adminHeaders = {
  'X-Admin-Api-Key': ADMIN_API_KEY,
};

// App Settings Types
export interface AppVersionSettings {
  updateRequired: boolean;
  forceUpdate: boolean;
  latestVersionName: string;
  latestVersionCode: number;
  minVersionCode?: number;
  message: string;
  androidStoreUrl?: string;
  iosStoreUrl?: string;
}

export interface NotificationStats {
  totalDevices: number;
  activeDevices: number;
  totalBroadcasts: number;
  usersWithDevices: number;
}

export interface BroadcastNotification {
  id: number;
  user_id: number | null;
  title: string;
  body: string;
  data: Record<string, any>;
  status: string;
  error_message?: string;
  sent_at?: string;
  created_at: string;
}

export interface SendNotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, any>;
}

export interface SendToUserPayload extends SendNotificationPayload {
  userId: number;
}

export interface SendToMultiplePayload extends SendNotificationPayload {
  userIds: number[];
}

export interface TriggerForceUpdatePayload {
  latestVersionName: string;
  latestVersionCode: number;
  minVersionCode?: number;
  message?: string;
}

export interface UpdateVersionSettingsPayload {
  updateRequired?: boolean;
  forceUpdate?: boolean;
  latestVersionName?: string;
  latestVersionCode?: number;
  minVersionCode?: number;
  message?: string;
  androidStoreUrl?: string;
  iosStoreUrl?: string;
}

// ==================== App Settings API ====================

/**
 * Get current app version settings (public endpoint - no auth needed)
 */
export async function getAppVersionSettings(): Promise<ApiResponse<AppVersionSettings>> {
  return apiService.get<AppVersionSettings>(API_ENDPOINTS.APP_SETTINGS.VERSION);
}

/**
 * Update app version settings (protected - requires admin key)
 */
export async function updateAppVersionSettings(
  data: UpdateVersionSettingsPayload
): Promise<ApiResponse<AppVersionSettings>> {
  return apiService.put<AppVersionSettings>(API_ENDPOINTS.APP_SETTINGS.VERSION, data, {
    headers: adminHeaders,
  });
}

/**
 * Trigger force update for all users (protected - requires admin key)
 */
export async function triggerForceUpdate(
  data: TriggerForceUpdatePayload
): Promise<ApiResponse<AppVersionSettings>> {
  return apiService.post<AppVersionSettings>(
    API_ENDPOINTS.APP_SETTINGS.TRIGGER_FORCE_UPDATE,
    data,
    {
      headers: adminHeaders,
    }
  );
}

/**
 * Disable force update (protected - requires admin key)
 */
export async function disableForceUpdate(): Promise<ApiResponse<AppVersionSettings>> {
  return apiService.post<AppVersionSettings>(
    API_ENDPOINTS.APP_SETTINGS.DISABLE_FORCE_UPDATE,
    {},
    {
      headers: adminHeaders,
    }
  );
}

// ==================== Notifications API ====================

/**
 * Get notification statistics (protected - requires admin key)
 */
export async function getNotificationStats(): Promise<ApiResponse<{ stats: NotificationStats }>> {
  return apiService.get<{ stats: NotificationStats }>(API_ENDPOINTS.NOTIFICATIONS.STATS, {
    headers: adminHeaders,
  });
}

/**
 * Get broadcast notification history (protected - requires admin key)
 */
export async function getBroadcastHistory(
  limit: number = 50,
  offset: number = 0
): Promise<ApiResponse<{ notifications: BroadcastNotification[]; total: number }>> {
  return apiService.get<{ notifications: BroadcastNotification[]; total: number }>(
    `${API_ENDPOINTS.NOTIFICATIONS.BROADCAST_HISTORY}?limit=${limit}&offset=${offset}`,
    {
      headers: adminHeaders,
    }
  );
}

/**
 * Send broadcast notification to all users (protected - requires admin key)
 */
export async function sendBroadcastNotification(
  data: SendNotificationPayload
): Promise<ApiResponse<any>> {
  return apiService.post(API_ENDPOINTS.NOTIFICATIONS.BROADCAST, data, {
    headers: adminHeaders,
  });
}

/**
 * Send notification to a specific user (protected - requires admin key)
 */
export async function sendNotificationToUser(
  data: SendToUserPayload
): Promise<ApiResponse<any>> {
  return apiService.post(API_ENDPOINTS.NOTIFICATIONS.SEND, data, {
    headers: adminHeaders,
  });
}

/**
 * Send notification to multiple users (protected - requires admin key)
 */
export async function sendNotificationToMultiple(
  data: SendToMultiplePayload
): Promise<ApiResponse<any>> {
  return apiService.post(API_ENDPOINTS.NOTIFICATIONS.SEND_MULTIPLE, data, {
    headers: adminHeaders,
  });
}
