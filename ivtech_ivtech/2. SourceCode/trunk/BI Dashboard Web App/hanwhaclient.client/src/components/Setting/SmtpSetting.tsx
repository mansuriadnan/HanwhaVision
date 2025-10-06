import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
} from "@mui/material";
import { CustomTextField } from "../Reusable/CustomTextField";
import { COMMON_CONSTANTS, LABELS, REGEX } from "../../utils/constants";
import { CustomButton } from "../Reusable/CustomButton";
import {
  GetClientSettingsData,
  saveSmtpSettings,
} from "../../services/settingService";
import { ISmtpSettings } from "../../interfaces/ISettings";
import { HasPermission } from "../../utils/screenAccessUtils";

type SmtpFormValues = {
  host: string;
  port: string;
  fromEmail: string;
  username: string;
  password: string;
  enableSsl: boolean;
};

type Props = {
  smtpSettings?: SmtpFormValues;
};

export const SmtpSetting = ({ smtpSettings }: Props) => {
  const [initialValues, setInitialValues] = useState<SmtpFormValues | null>(
    null
  );
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SmtpFormValues>({
    defaultValues: {
      host: "",
      port: "",
      fromEmail: "",
      username: "",
      password: "",
      enableSsl: false,
    },
  });

  useEffect(() => {
    if (smtpSettings) {
      reset({
        host: smtpSettings?.host ?? "",
        port: smtpSettings?.port?.toString() ?? "",
        fromEmail: smtpSettings?.fromEmail ?? "",
        username: smtpSettings?.username ?? "",
        password: smtpSettings?.password ?? "",
        enableSsl: smtpSettings?.enableSsl ?? false,
      });
    }
  }, [smtpSettings, reset]);

  // useEffect(() => {
  //   const fetchSmtpSettings = async () => {
  //     try {
  //       const response: any = await GetClientSettingsData();
  //       if (
  //         response !== null &&
  //         response !== undefined &&
  //         response?.isSuccess !== false
  //       ) {
  //         const prefilledValues: SmtpFormValues = {
  //           host: response?.smtpSettings?.host ?? "",
  //           port: response?.smtpSettings?.port.toString() ?? "",
  //           fromEmail: response?.smtpSettings?.fromEmail ?? "",
  //           username: response?.smtpSettings?.username ?? "",
  //           password: response?.smtpSettings?.password ?? "",
  //           enableSsL: response?.smtpSettings?.enableSsl ?? false,
  //         };
  //         setInitialValues(prefilledValues);
  //         reset(prefilledValues); // Reinitialize form with data
  //       }
  //     } catch (err) {
  //       console.error("Failed to fetch SMTP settings", err);
  //     }
  //   };

  //   fetchSmtpSettings();
  // }, [reset]);

  const onSubmit = async (data: SmtpFormValues) => {
    try {
      const smtpPayload: ISmtpSettings = {
        host: data.host,
        port: Number(data.port),
        enableSsl: data.enableSsl,
        username: data.username,
        password: data.password,
        fromEmail: data.fromEmail,
      };
      const response: any = await saveSmtpSettings(smtpPayload);
      if (response?.isSuccess) {
        setInitialValues(data);
        reset(data);
      }
    } catch (err: any) {
      console.error("Failed to update SMTP details. Please try again.", err);
    }
  };

  return (
    <Paper elevation={1} className='smtp-setup-wrapper'>
      <Typography variant="h4">
        SMTP Setup
      </Typography>

      <Box onSubmit={handleSubmit(onSubmit)} component="form" noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <CustomTextField
              control={control}
              name="host"
              label={<span>Host <span className="star-error">*</span></span>}
              rules={{
                required: "Host is required",
                maxLength: {
                  value: COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH,
                  message: `Host cannot exceed ${COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH} characters`,
                },
                pattern: {
                  value: REGEX.Host_Regex,
                  message: "Enter a valid host (e.g., smtp.example.com)",
                },
              }}
              required
              placeholder="Enter host"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CustomTextField
              control={control}
              name="port"
              label={<span>Port <span className="star-error">*</span></span>}
              type="number"
              rules={{
                required: "Port is required",
                validate: (value: string) => {
                  const port = parseInt(value, 10);
                  if (isNaN(port) || port < 1 || port > 65535) {
                    return "Port must be between 1 and 65535";
                  }
                  return true;
                },
              }}
              required
              placeholder="Enter port"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CustomTextField
              control={control}
              name="fromEmail"
              label={<span>From Email Address <span className="star-error">*</span></span>}
              rules={{
                required: "From Email Address is required",
                pattern: {
                  value: REGEX.Email_Regex,
                  message: "Enter a valid email address",
                },
                maxLength: {
                  value: COMMON_CONSTANTS.MAX_EMAIL_FIELD_LENGTH,
                  message: `From Email Address cannot exceed ${COMMON_CONSTANTS.MAX_EMAIL_FIELD_LENGTH} characters`,
                },
              }}
              required
              placeholder="Enter from email address"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CustomTextField
              control={control}
              name="username"
              label={<span>Username <span className="star-error">*</span></span>}
              rules={{
                required: "Username is required.",
                // pattern: {
                //   value: REGEX.UserName_Regex,
                //   message: "Enter a valid username",
                // },
                maxLength: {
                  value: COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH,
                  message: `Username cannot exceed ${COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH} characters`,
                },
              }}
              required
              placeholder="Enter username"
              autoComplete="off"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CustomTextField
              control={control}
              name="password"
              label={<span>Password <span className="star-error">*</span></span>}
              type="password"
              rules={{
                required: "Password is required",
                // pattern: {
                //   value: REGEX.Password_Regex,
                //   message:
                //     "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character (excluding *)",
                // },
                // maxLength: {
                //   value: COMMON_CONSTANTS.MAX_PASSWORD_FIELD_LENGTH,
                //   message: `Password cannot exceed ${COMMON_CONSTANTS.MAX_PASSWORD_FIELD_LENGTH} characters`,
                // },
              }}
              required
              placeholder="Enter password"
              autoComplete="new-password"              
            />
          </Grid>
          <Grid item xs={12} md={4} display="flex" alignItems="center" className="enable-ssl-wrapper">
            <Controller
              control={control}
              name="enableSsl"
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label="Enable SSL"
                />
              )}
            />
          </Grid>
        </Grid>
        {HasPermission(LABELS.View_and_Configure_SMTP_Setup_Details) && (
          <CustomButton className="common-btn-design">Save</CustomButton>
        )}
      </Box>
    </Paper>
  );
};
