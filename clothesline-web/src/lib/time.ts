export const getMinutesAgo = (timestamp: number | null) => {
  if (!timestamp) return "-";

  const diffMs = Date.now() - timestamp;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "baru saja";
  return `${diffMin} menit lalu`;
};