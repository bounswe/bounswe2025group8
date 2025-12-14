export const urgencyLevels: Record<number, { name: string; color: string }> = {
  1: { name: "Very Low", color: "#7e57c2" },  // Darker purple
  2: { name: "Low", color: "#5c6bc0" },       // Darker indigo
  3: { name: "Medium", color: "#42a5f5" },    // Darker blue
  4: { name: "High", color: "#ff7043" },      // Darker deep orange
  5: { name: "Critical", color: "#e53935" },  // Darker red
};

/**
 * Get localized urgency level name
 * @param {number} level - The urgency level (1-5)
 * @param {Function} t - Optional i18n translation function
 * @returns {string} - The localized urgency level name
 */
export const getUrgencyLevelName = (level: number, t?: (key: string, options?: any) => string): string => {
  if (!level || !urgencyLevels[level]) return t ? t('urgencyLevels.unknown') : 'Unknown';
  
  // If translation function is provided, use it
  if (t) {
    return t(`urgencyLevels.${level}`, { defaultValue: urgencyLevels[level].name });
  }
  
  // Fallback to English
  return urgencyLevels[level].name;
};
