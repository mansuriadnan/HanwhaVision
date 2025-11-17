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
    saveFTPSettings,
  saveSmtpSettings,
} from "../../services/settingService";
import { IFTPSettings, ISmtpSettings } from "../../interfaces/ISettings";
import { HasPermission } from "../../utils/screenAccessUtils";

type FTPFormValues = {
  host: string;
  port: string;
  username: string;
  password: string;
};

type Props = {
  FTPSettings?: FTPFormValues;
};

export const FTPSetup = ({ FTPSettings }: Props) => {
  const [initialValues, setInitialValues] = useState<FTPFormValues | null>(
    null
  );
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FTPFormValues>({
    defaultValues: {
      host: "",
      port: "",
      username: "",
      password: ""
    },
  });

  useEffect(() => {
    if (FTPSettings) {
      reset({
        host: FTPSettings?.host ?? "",
        port: FTPSettings?.port?.toString() ?? "",
        username: FTPSettings?.username ?? "",
        password: FTPSettings?.password ?? "",
      });
    }
  }, [FTPSettings, reset]);


  const onSubmit = async (data: FTPFormValues) => {
    try {
      const ftpPayload: IFTPSettings = {
        host: data.host,
        port: Number(data.port),
        username: data.username,
        password: data.password,
      };
      const response: any = await saveFTPSettings(ftpPayload);
      if (response?.isSuccess) {
        setInitialValues(data);
        reset(data);
      }
    } catch (err: any) {
      console.error("Failed to update FTP details. Please try again.", err);
    }
  };

  return (
    <Paper elevation={1} className='smtp-setup-wrapper'>
      <Typography variant="h4">
        FTP Setup
      </Typography>

      <Box onSubmit={handleSubmit(onSubmit)} component="form" noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
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
                  value: REGEX.HostOrIP_Regex,
                  message: "Enter a valid hostname (e.g., ftp.example.com) or IPv4 address (e.g., 192.168.1.1)",
                },
              }}
              required
              placeholder="Enter host"
            />
          </Grid>
          <Grid item xs={12} md={6}>
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
          <Grid item xs={12} md={6}>
            <CustomTextField
              control={control}
              name="username"
              label={<span>Username <span className="star-error">*</span></span>}
              rules={{
                required: "Username is required.",
                pattern: {
                  value: REGEX.UserName_Regex,
                  message: "Enter a valid username",
                },
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
          <Grid item xs={12} md={6}>
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
        </Grid>
        {HasPermission(LABELS.View_and_Configure_FTP_Setup_Details) && (
          <CustomButton className="common-btn-design">Save</CustomButton>
        )}
      </Box>
    </Paper>
  );
};
