import { Grid, Paper, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { CustomButton } from "../Reusable/CustomButton";
import { CustomSelect } from "../Reusable/CustomSelect";
import { useForm } from "react-hook-form";
import {
  GetTimeZoneDropdownData,
  saveTimeZoneSetting,
} from "../../services/settingService";
import { ILookup } from "../../interfaces/ILookup";

type TimeZoneFormValues = {
  timeZone: string;
};

const OperationalTiming = ({ initialTimeZone }) => {
  // console.log(`initialTimeZone => `, initialTimeZone);
  // const [initialValues, setInitialValues] = useState<TimeZoneFormValues>({
  //   timeZone: "",
  // });
  const [timeZones, setTimeZones] = useState<ILookup[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<TimeZoneFormValues>({
    defaultValues: {
      timeZone: initialTimeZone ?? ""
    },
  });

  useEffect(() => {
    fetchTimeZoneOptions();
  }, []);

  useEffect(() => {
    if (initialTimeZone) {
      reset({ timeZone: initialTimeZone });
    }
  }, [initialTimeZone, reset]);

  const fetchTimeZoneOptions = async () => {
    try {
      const response: any = await GetTimeZoneDropdownData();
      const options =
        response?.map((zone: any) => ({
          id: zone.id,
          title: `${zone.name} (UTC ${zone.utcOffset}), ${zone.timeZoneName}`,
        })) ?? [];
      setTimeZones(options);
    } catch (error) {
      console.error("Error fetching time zones:", error);
    }
  };

  const onSubmit = async (data: TimeZoneFormValues) => {
    try {
      const payload = {
        timeZone: data.timeZone,
      };

      const response = await saveTimeZoneSetting(payload);
    } catch (error) {
      console.error("Error during save:", error);
    }
  };

  return (
    <Paper className="smtp-setup-wrapper">
      <Stack>
        <Typography variant="h4">
          Configure Your Time Zone
        </Typography>
        <CustomButton className="common-btn-design" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          Save
        </CustomButton>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <CustomSelect
            name="timeZone"
            control={control}
            label="Select time zone"
            variant="outlined"
            options={timeZones}
            rules={{ required: "Time zone is required" }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export { OperationalTiming };
