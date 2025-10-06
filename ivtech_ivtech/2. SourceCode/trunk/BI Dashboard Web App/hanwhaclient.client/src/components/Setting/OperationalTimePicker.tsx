import React from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Stack,
  Paper,
  Grid,
} from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useForm, Controller } from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";
import { CustomButton } from "../Reusable/CustomButton";
import { saveOperationTimeSetting } from "../../services/settingService";
import { HasPermission } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";
import { formatDateToConfiguredTimezone } from "../../utils/formatDateToConfiguredTimezone";
import { convertToUTC } from "../../utils/convertToUTC";

type OperationalTimeFormValues = {
  startTime: Dayjs | null;
  endTime: Dayjs | null;
};

type OperationalTimePickerProps = {
  operationalTiming?: {
    startTime: string;
    endTime: string;
  };
};

const OperationalTimePicker: React.FC<OperationalTimePickerProps> = ({ operationalTiming }) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<OperationalTimeFormValues>({
    defaultValues: {
      startTime: dayjs(),
      endTime: dayjs(),
    },
  });

  React.useEffect(() => {
    if (operationalTiming?.startTime && operationalTiming?.endTime) {
      reset({
        startTime: dayjs(formatDateToConfiguredTimezone(operationalTiming.startTime)),
        endTime: dayjs(formatDateToConfiguredTimezone(operationalTiming.endTime)),
      });
    }
  }, [operationalTiming, reset]);

  const onSubmit = async (data: OperationalTimeFormValues) => {
    try {
      const currentDate = dayjs().format("YYYY-MM-DD");

      const formattedStartTime = data.startTime
        ? dayjs(`${currentDate} ${data.startTime.format("HH:mm")}`)
        : null;

      const formattedEndTime = data.endTime
        ? dayjs(`${currentDate} ${data.endTime.format("HH:mm")}`)
        : null;

      if (!formattedStartTime || !formattedEndTime) {
        throw new Error("Start and end time are required");
      }
      
      const payload = {
        startTime: convertToUTC(formattedStartTime.format("YYYY-MM-DDTHH:mm:ss")),
        endTime: convertToUTC(formattedEndTime.format("YYYY-MM-DDTHH:mm:ss")),
      };
      const response = await saveOperationTimeSetting(payload);
    } catch (error) {
      console.error("Error during save:", error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper className="smtp-setup-wrapper">
        <Stack>
          <Typography variant="h4">
            Operational Time
          </Typography>
          {HasPermission(LABELS.CanClientOperationalTiming) && (
            <CustomButton
              className="common-btn-design"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              Save
            </CustomButton>
          )}
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Controller
                name="startTime"
                control={control}
                rules={{ required: "Start time is required" }}
                render={({ field, fieldState }) => (
                  <TimePicker value={field.value} onChange={field.onChange}
                    slotProps={{
                      textField: {
                        error: !!fieldState.error,
                        helperText: fieldState.error?.message,
                      },
                    }}/>
                )}
              />

              <Controller
                name="endTime"
                control={control}
                rules={{ required: "End time is required" }}
                render={({ field, fieldState }) => (
                  <TimePicker value={field.value} onChange={field.onChange} slotProps={{
                      textField: {
                        error: !!fieldState.error,
                        helperText: fieldState.error?.message,
                      },
                    }}/>
                )}
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      
    </LocalizationProvider>
  );
};

export { OperationalTimePicker };
