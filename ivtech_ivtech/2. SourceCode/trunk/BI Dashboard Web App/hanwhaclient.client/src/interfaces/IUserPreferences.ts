export type PreferencesForm = {
  theme: string;
  isOsSyncTimeZone: string;
  timezone?: string | null;
  isDaylightSavings: boolean;
  language: string;
  timeFormat:string
};

export enum ThemeOption {
  LIGHT = "light",
  DARK = "dark",
}

export enum TimeZoneOption {
  SYNC_WITH_OS = "sync with OS",
  MANUAL_SETUP = "manual setup",
}

export interface IPreferencesFormProps {
    onClose?: () => void;
}

