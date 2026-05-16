"use client";

import { useState, useEffect, useCallback } from "react";
import { IoTData, normalizeIoTData } from "@/utils/iot-data";

export function useFirebaseStatus(deviceId: string | null) {
  const [historyData, setHistoryData] = useState<IoTData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!deviceId) {
      setHistoryData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/iot?deviceId=${deviceId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rawData = await response.json();
      const dataArray = Array.isArray(rawData)
        ? rawData
        : (rawData?.sensor || []);

      const normalizedData = dataArray
        .map(normalizeIoTData)
        .sort((a: IoTData, b: IoTData) => b.timestampValue - a.timestampValue);
      setHistoryData(normalizedData);
    } catch (err: any) {
      console.error("Gagal mengambil riwayat data:", err);
      setError(err.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setIsLoading(false);
    }
  }, [deviceId]);

  // Reset and refetch when deviceId changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistoryData([]);
    setError(null);
  }, [deviceId]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await fetchHistory();
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [fetchHistory]);

  return { historyData, isLoading, error, refetch: fetchHistory };
}