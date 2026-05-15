"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Hook that fetches all dashboard data from Supabase RPCs.
 * Each RPC runs server-side with RLS — consultant only sees their own data.
 */
export function useDashboardData() {
  const [data, setData] = useState({
    stats: null,
    allocation: [],
    unbalanced: [],
    commissionHistory: [],
    topClients: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const supabase = getSupabaseBrowserClient();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fire all RPCs in parallel for speed
      const [
        statsRes,
        allocRes,
        unbalancedRes,
        commHistRes,
        topClientsRes,
        activityRes,
      ] = await Promise.all([
        supabase.rpc("get_dashboard_stats"),
        supabase.rpc("get_allocation_by_class"),
        supabase.rpc("get_unbalanced_portfolios"),
        supabase.rpc("get_commissions_last_6_months"),
        supabase.rpc("get_top_clients_by_aum"),
        supabase.rpc("get_recent_activity"),
      ]);

      setData({
        stats: statsRes.data || {
          total_clients: 0,
          total_aum: 0,
          total_portfolios: 0,
          monthly_commissions: 0,
          recent_rebalancings: 0,
        },
        allocation: allocRes.data || [],
        unbalanced: unbalancedRes.data || [],
        commissionHistory: commHistRes.data || [],
        topClients: topClientsRes.data || [],
        recentActivity: activityRes.data || [],
      });
    } catch (err) {
      console.error("Dashboard data error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...data, loading, error, refresh: load };
}
