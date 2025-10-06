import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Stack,
  Paper,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { CustomButton } from "../Reusable/CustomButton";
import {
  GetClientSettingsData,
  uploadCustomerLogo,
  uploadsslCertificateService,
} from "../../services/settingService";
import { HasPermission } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";
import { CustomTextField } from "../Reusable/CustomTextField";
import { useForm, Controller } from "react-hook-form";
import { set } from "date-fns";

interface UploadSSLCertificateProps {
  sslCertificateFileName: string | null;
}

const UploadSSLCertificate: React.FC<UploadSSLCertificateProps> = ({
  sslCertificateFileName,
}) => {
  const fileInputRefSsl = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  const {
    control,
    formState: { errors },
    watch,
  } = useForm<SmtpFormValues>({
    defaultValues: {
      password: "",
    },
  });

  const password = watch("password");

  useEffect(() => {
    setFileName(sslCertificateFileName);
  }, [sslCertificateFileName]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    const allowedExtensions = [".crt", ".pem", ".pfx", ".cer"];
    const isValid = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setError(true);
      setErrorMsg("Only .crt, .pem, .pfx, .cer files are allowed.");
      e.target.value = "";
      setFile(null); // Clear any previously stored file
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError(false);
    setErrorMsg("");
  };

  const handleSave = async () => {
    // If editing but no new file uploaded → show error
  if (isEdit && !file) {
    setError(true);
    setErrorMsg("Please upload a file first!");
    return;
  }

  // If not editing and no file uploaded → no error, just return
  if (!isEdit && !file) {
    return;
  }
    
    formData.append("password", password);

    //pass the "certificateFile" instead of file on param

    try {
      const response = await uploadsslCertificateService(formData);

      if (typeof response !== "string" && response?.isSuccess) {
        const generalSetting: any = await GetClientSettingsData();
        if (generalSetting != undefined) {
          setFileName(generalSetting.sslCertificateFileName);
          setFile(null);
          setError(false);
          setErrorMsg("");
          setIsEdit(false);
          // setFileName("");
        }
      }
    } catch (error) {
      console.error(
        `Failed to upload the ssl certificate file. Please try again.`,
        error
      );
    } finally {
      if (fileInputRefSsl.current) {
        fileInputRefSsl.current.value = "";
      }
    }
  };

  const handleEdit = () => {
    setIsEdit(true);
    if(error){
      setError(false);
      setErrorMsg("");
    }
    setFile(null);
    setFileName("");

    if (fileInputRefSsl.current) {
      fileInputRefSsl.current.value = "";
    }
  };

  type SmtpFormValues = {
    password: string;
  };

  return (
    <Paper elevation={1} className="smtp-setup-wrapper">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Upload SSL Certificate</Typography>
        {HasPermission(LABELS.CanUploadClientLogo) && (
          <CustomButton onClick={handleSave} className="common-btn-design">
            Save
          </CustomButton>
        )}
      </Stack>

      <Grid className="upload-profile-main" container spacing={2}>
        <Grid className="upload-profile-main-wrapper" item xs={12} md={4} >
          {fileName ? (
            <Box className="upload-your-file">
              <Box className="upload-your-file-wrapper">
                <Box className="upload-your-file-name">
                  <img src="../images/file.png" alt="logo preview" />
                  <Typography variant="h6">{fileName}</Typography>
                </Box>
                <IconButton onClick={handleEdit}>
                  <img src="../images/CTA.png" alt="cta" />
                </IconButton>
              </Box>
            </Box>
          ) : (
            <Box
              onClick={() =>
                document.getElementById("ssl-upload-input")?.click()
              }
              className="upload-pro-inner"
            >
              <CloudUploadOutlinedIcon />
              <Typography variant="body2">
                Browse and choose the files you want to <br />
                Upload from your computer
              </Typography>
              <IconButton>
                <AddIcon />
              </IconButton>
            </Box>
          )}
          <input
            type="file"
            accept=".crt,.pem,.pfx,.cer"
            id="ssl-upload-input"
            hidden
            onChange={handleUpload}
            ref={fileInputRefSsl}
          />
          {error && (
            <Typography
              variant="caption"
              sx={{
                color: "red !important",
                mt: "4px",
                ml: "15px",
                fontSize: "12px",
              }}
            >
              {errorMsg}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomTextField
            control={control}
            name="password"
            label={
              <span>
                Password <span className="star-error">*</span>
              </span>
            }
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
    </Paper>
  );
};

export { UploadSSLCertificate };
