import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { createAdminDashboardService } from '../services/admin-dashboard.service';

/**
 * @name loadAdminDashboard
 * @description Load the admin dashboard data.
 * @param params
 */
export const loadAdminDashboard = cache(adminDashboardLoader);

function adminDashboardLoader() {
  const client = getSupabaseServerClient();
  const service = createAdminDashboardService(client);

  return service.getDashboardData();
}
