export const formatNum = (v: any, digits = 1): string | null => {
    if (v === undefined || v === null || Number.isNaN(Number(v))) return null;
    return Number(v).toFixed(digits);
};