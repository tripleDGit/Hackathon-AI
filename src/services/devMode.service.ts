const DEV_MODE_KEY = 'dev_mode_enabled';

export const isDevModeEnabled = (): boolean => {
  const stored = localStorage.getItem(DEV_MODE_KEY);
  return stored === 'true';
};

export const setDevModeEnabled = (enabled: boolean) => {
  localStorage.setItem(DEV_MODE_KEY, enabled ? 'true' : 'false');
};
