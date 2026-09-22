import { useCallback, useEffect, useState } from 'react';
import { api } from '../components/axios/Config';
import { toaster } from '../components/ui/toaster';

const ENDPOINTS = {
  dashboard: 'analytics/dashboard',
  byCategory: 'analytics/spending-by-category',
  byAsset: 'analytics/spending-by-asset',
  byTag: 'v2/analytics/spending-by-tag',
  monthly: 'analytics/monthly-comparison',
};

const LIST_KEYS = ['byCategory', 'byAsset', 'byTag', 'monthly'];

/**
 * Fetches all financial analytics for a date range in one pass.
 * Each endpoint fails independently so one error doesn't blank the page.
 */
export function useAnalytics({ startDate, endDate, usePayCycle }) {
  const [data, setData] = useState({ dashboard: null });
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);

    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (usePayCycle) params.use_pay_cycle = 'true';

    let failed = false;
    const results = await Promise.all(
      Object.entries(ENDPOINTS).map(async ([key, url]) => {
        try {
          const reqParams =
            key === 'monthly' && !startDate && !endDate ? { ...params, months: 6 } : params;
          const response = await api.get(url, { params: reqParams });
          return { key, value: response.data.data, periods: response.data.periods };
        } catch (error) {
          console.error(`Error fetching ${key}:`, error);
          failed = true;
          return { key, value: undefined };
        }
      })
    );

    const next = { dashboard: null };
    let nextPeriods;
    for (const { key, value, periods: p } of results) {
      next[key] = value ?? (LIST_KEYS.includes(key) ? [] : null);
      if (p) nextPeriods = p;
    }

    setData(next);
    if (nextPeriods) setPeriods(nextPeriods);
    setLoading(false);

    if (failed) {
      toaster.create({ description: 'Failed to fetch some analytics data', type: 'error' });
    }
  }, [startDate, endDate, usePayCycle]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...data, periods, loading, refetch: fetchAll };
}
