import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { CustomSelect } from "../Reusable/CustomSelect";
import { ILookup } from "../../interfaces/ILookup";
import { GetTimeZoneDropdownData } from "../../services/settingService";
import { LANGUAGE_OPTIONS, themeOptions } from "../../utils/constants";
import {
  IPreferencesFormProps,
  PreferencesForm,
  ThemeOption,
  TimeZoneOption,
} from "../../interfaces/IUserPreferences";
import { CustomButton } from "../Reusable/CustomButton";
import { showToast } from "../Reusable/Toast";
import { SaveUserPreferences } from "../../services/userService";
import CheckIcon from "@mui/icons-material/Check";
import { useThemeContext } from "../../context/ThemeContext";

const UserPreferences: React.FC<IPreferencesFormProps> = ({ onClose }) => {
  const [timeZones, setTimeZones] = useState<ILookup[]>([]);
  const [allTimeZones, setAllTimeZones] = useState([]);
  const { setTheme } = useThemeContext();
  const { control, handleSubmit, watch, setValue } = useForm<PreferencesForm>({
    defaultValues: {
      theme: "light",
      isOsSyncTimeZone: "true",
      timezone: null,
      isDaylightSavings: false,
      language: "english",
      timeFormat: "12h",
    },
  });

  const selectedTheme = watch("theme");
  const isSyncWithOS = watch('isOsSyncTimeZone');


  // Fetch all intial data required
  useEffect(() => {
    fetchTimeZoneOptions();

  }, []);

  useEffect(() => {
    if (selectedTheme === "light" || selectedTheme === "dark") {
      setTheme(selectedTheme);
    }
  }, [selectedTheme, setTheme]);

  useEffect(() => {
    if (isSyncWithOS === "true") {
      setValue("timezone", null);
    }
  }, [isSyncWithOS, setValue]);

  const SetPreferenceDetails = () => {
    const userProfile = localStorage.getItem("userProfile");
    if (userProfile) {
      const userPreferences = JSON.parse(userProfile).userPreferences;
      setValue("theme", userPreferences?.theme || ThemeOption.LIGHT);
      const isOsSync = userPreferences?.isOsSyncTimeZone;
      setValue("isOsSyncTimeZone", (isOsSync == null || isOsSync == undefined || isOsSync === true) ? "true" : "false");
      setValue("timezone", userPreferences?.timezoneId || null);
      setValue("isDaylightSavings", userPreferences?.isDaylightSavings || false);
      setValue("language", userPreferences?.language || LANGUAGE_OPTIONS[0].id);
      setValue("timeFormat", userPreferences?.timeFormat || "12h");
    }
  };
  let timeZoneDataRes: any = [];
  const fetchTimeZoneOptions = async () => {
    try {
      timeZoneDataRes = await GetTimeZoneDropdownData();
      if (timeZoneDataRes) {
        setAllTimeZones(timeZoneDataRes)
      }


      const options =
        timeZoneDataRes?.map((zone: any) => ({
          id: zone.id,
          title: `${zone.name} (UTC ${zone.utcOffset}), ${zone.timeZoneName}`,
        })) ?? [];
      setTimeZones(options);
      SetPreferenceDetails();
    } catch (error) {
      console.error("Error fetching time zones:", error);
    }
  };

  const onSubmit = async (data: PreferencesForm) => {
    try {
      const requestData = {
        ...data,
        isOsSyncTimeZone: data.isOsSyncTimeZone === "true" ? true : false,
      }      
      const response: any = await SaveUserPreferences(requestData);
      if (response.isSuccess) {
        const existingProfile = localStorage.getItem("userProfile");
        let updatedProfile;
        if (existingProfile) {
          const { timezone, ...rest } = requestData;

          const preferenceData = {
            ...rest,
            timezoneId: timezone
          }

          try {
            const parsedProfile = JSON.parse(existingProfile);
            parsedProfile.userPreferences = preferenceData;
            updatedProfile = JSON.stringify(parsedProfile);
            localStorage.setItem("userProfile", updatedProfile);
          } catch (e) {
            console.warn("Invalid JSON in User Preference localStorage:", e);
          }
        }
        const existingTimeZoneDetails = localStorage.getItem("userProfileReferenceData");
        if (existingTimeZoneDetails) {
          try {
            const parsedZoneDetails = JSON.parse(existingTimeZoneDetails);

            const selectedZone: any = requestData.isOsSyncTimeZone
              ? null
              : allTimeZones.find((x: any) => x.id === requestData.timezone) ?? null;

            if (selectedZone) {
              parsedZoneDetails.timeZone = {
                ...(parsedZoneDetails.timeZone ?? {}),
                value: selectedZone?.id,
                label: selectedZone,
              };
            } else {
              parsedZoneDetails.timeZone = {
                ...(parsedZoneDetails.timeZone ?? {}),
                label: null,
              };
            }
            const updatedZoneDetails = JSON.stringify(parsedZoneDetails);
            localStorage.setItem("userProfileReferenceData", updatedZoneDetails);

          } catch (e) {
            console.warn("Invalid JSON in User Preference localStorage:", e);
          }
        }

      }

      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while save preference.");
      showToast("An error occurred while save preference", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="preferences-main">
      {/* Theme  */}
      <div className="preferences-theme">
        <Typography variant="h6" gutterBottom>
          Theme
        </Typography>

        <Controller
          name="theme"
          control={control}
          render={({ field }) => (
            <Box display="flex" gap={2} mt={1}>
              {themeOptions.map((option) => (
                <Box
                  key={option.value}
                  onClick={() => field.onChange(option.value)}
                  className={field.value === option.value ? "selected-theme" : ""}
                  sx={{
                    cursor: "pointer",
                    border:
                      field.value === option.value
                        ? "2px solid #f90"
                        : "2px solid #ccc",
                    borderRadius: 2,
                    padding: 1.5,
                    width: 226,
                    textAlign: "center",
                    transition: "border 0.2s",
                  }}
                >
                  <img
                    //src={"/images/Vision_Insight_Profile_Page_Logo.svg"}
                    src={
                      option?.value === "light"
                        ? `/images/User_Preference_Light_Theme.svg`
                        : `/images/User_Preference_Dark_Theme.svg`
                    }
                    alt={option.label}
                    style={{ width: "100%", borderRadius: 8 }}
                  />
                  <Box
                    display="flex"
                    alignItems="left"
                    justifyContent="left"
                    mt={1}
                    className="theme-label"
                  >
                    {/* <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: "2px solid #f90",
                        backgroundColor:
                          field.value === option.value ? "#f90" : "#fff",
                        marginRight: 1,
                      }}
                    /> */}
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        backgroundColor: field.value === option.value ? "#f90" : "#fff",
                        border: "2px solid #f90",
                        marginRight: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      {field.value === option.value && (<CheckIcon
                        sx={{
                          fontSize: 16,
                          color: "#fff",
                        }}
                      />)}
                    </Box>
                    <Typography variant="body2">{option.label}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        />
      </div>

      {/* Time Zone */}
      <div className="preferences-time-zone">
        <Typography variant="h6" gutterBottom>
          Time Zone
        </Typography>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          className="time-zone-main"
        >
          {/* Time Zone Radio Buttons */}
          <Controller

            name="isOsSyncTimeZone"
            control={control}
            render={({ field }) => {
              return (
                <RadioGroup row
                  value={field.value} //  ensure value is a string
                  onChange={(e) => field.onChange(e.target.value)} //  cast string to boolean
                  className="time-zone-radio"
                >
                  <FormControlLabel
                    value="true"
                    control={
                      <Radio
                        sx={{
                          "&.Mui-checked": {
                            color: "#FFA500",
                          },
                        }}
                      />
                    }
                    label="Sync with OS"
                  />
                  <FormControlLabel
                    value="false"
                    control={
                      <Radio
                        sx={{
                          "&.Mui-checked": {
                            color: "#FFA500",
                          },
                        }}
                      />
                    }
                    label="Manual setup"
                  />
                </RadioGroup>
              )
            }}
          />

          {/* DayLight saving checkbox */}
          <Controller

            name="isDaylightSavings"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label="Daylight Savings"
              />
            )}
          />
        </Stack>

        {isSyncWithOS === "false" && (
          <CustomSelect
            name="timezone"
            control={control}
            //label="Select time zone"
            variant="outlined"
            options={timeZones}
            placeholder="Select time zone"
            rules={{ required: "Please select a time zone" }}
          />
        )}
        
      </div>

      {/* Language */}
      <div className="preferences-time-format">
        <Typography variant="h6" gutterBottom>
          Time Format
        </Typography>
        <Controller
            name="timeFormat"
            control={control}
            render={({ field }) => {
              return (
                <RadioGroup row
                  value={field.value} //  ensure value is a string
                  onChange={(e) => field.onChange(e.target.value)} //  cast string to boolean
                  className="time-zone-radio"
                >
                  <FormControlLabel
                    value="12h"
                    control={
                      <Radio
                        sx={{
                          "&.Mui-checked": {
                            color: "#FFA500",
                          },
                        }}
                      />
                    }
                    label="12 Hrs"
                  />
                  <FormControlLabel
                    value="24h"
                    control={
                      <Radio
                        sx={{
                          "&.Mui-checked": {
                            color: "#FFA500",
                          },
                        }}
                      />
                    }
                    label="24 Hrs"
                  />
                </RadioGroup>
              )
            }}
          />
      </div>
      

      {/* Language */}
      <div className="preferences-landuage">
        <Typography variant="h6" gutterBottom>
          Language
        </Typography>
        <CustomSelect
          name="language"
          control={control}
          //label="Select time zone"
          variant="outlined"
          options={LANGUAGE_OPTIONS}
          rules={{ required: "Language is required" }}
        />
      </div>

      {/* Buttons Section */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
        <Button
          className="common-btn-design common-btn-design-transparent"
          onClick={onClose}
          sx={{
            backgroundColor: "#F9F9FA",
            color: "#424242",
            textTransform: "none",
          }}
        >
          Cancel
        </Button>
        <Button
          className="common-btn-design"
          type="submit"
          sx={{
            background: "linear-gradient(to right, #FF8A00, #FE6500)",
            color: "white",
            textTransform: "none",
          }}
          autoFocus
        >
          Apply
        </Button>
      </Stack>
    </form>
  );
};

export { UserPreferences };
function setError(arg0: any) {
  throw new Error("Function not implemented.");
}

