import { Box, Grid, IconButton, Paper, Stack, Typography } from "@mui/material";
import React, { useRef, useState } from "react";
import { CustomButton } from "../Reusable/CustomButton";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { showToast } from "../Reusable/Toast";
import {
  uploadClientLicense,
  uploadClientLicenseKey,
  uploadFullLicense,
} from "../../services/settingService";
import { CommonDialog } from "../Reusable/CommonDialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

type UploadClientLicenseAndPemProps = {
  onClose: () => void;
};

const UploadClientLicenseAndPem: React.FC<UploadClientLicenseAndPemProps> = ({
  onClose,
}) => {
  const [pemFile, setPemFile] = useState<File | null>(null);
  const [previewPemFile, setPreviewPemFile] = useState<string | null>(null);
  const pemFileInputRef = useRef<HTMLInputElement | null>(null);

  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [previewLicenseFile, setPreviewLicenseFile] = useState<string | null>(
    null
  );
  const licenseFileInputRef = useRef<HTMLInputElement | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const navigate = useNavigate();
  const { handleLogout } = useAuth();

  const handlePemFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPemFile(file);
      setPreviewPemFile(URL.createObjectURL(file));
    }
  };

  // const handleSaveBothFiles = async () => {
  //   if (!pemFile || !licenseFile) {
  //     showToast("Please upload both PEM and LICENSE files.", "error");
  //     return;
  //   }

  //   const pemFormData = new FormData();
  //   pemFormData.append("file", pemFile);

  //   const licenseFormData = new FormData();
  //   licenseFormData.append("file", licenseFile);

  //   try {
  //     await uploadClientLicenseKey(pemFormData);
  //     await uploadClientLicense(licenseFormData);
  //     setShowLogoutDialog(true);
  //     // onClose();
  //   } catch (error) {
  //     showToast("Failed to upload files. Please try again.", "error");
  //     console.error("Upload Error:", error);
  //   } finally {
  //     setPemFile(null);
  //     setPreviewPemFile(null);
  //     setLicenseFile(null);
  //     setPreviewLicenseFile(null);

  //     if (pemFileInputRef.current) pemFileInputRef.current.value = "";
  //     if (licenseFileInputRef.current) licenseFileInputRef.current.value = "";
  //   }
  // };

  const handleSaveBothFiles = async () => {
    if (!pemFile || !licenseFile) {
      showToast("Please upload both PEM and LICENSE files.", "error");
      return;
    }

    // Validate file extensions
    const pemFileName = pemFile.name.toLowerCase();
    const licenseFileName = licenseFile.name.toLowerCase();

    if (!pemFileName.endsWith(".pem")) {
      showToast("Please upload a valid PEM file (.pem).", "error");
      return;
    }

    if (!licenseFileName.endsWith(".lic")) {
      showToast("Please upload a valid LICENSE file (.lic).", "error");
      return;
    }

    const formData = new FormData();
    formData.append("publicKeyFile", pemFile);
    formData.append("licenseFile", licenseFile);

    try {
      const data = await uploadFullLicense(formData);
      if (
        typeof data === "object" &&
        data !== null &&
        "isSuccess" in data &&
        data.isSuccess
      ) {
        setShowLogoutDialog(true);
      } else {
        const errorMessage =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "Invalid license signature.";
        showToast(errorMessage, "error");
      }
    } catch (error) {
      showToast("Failed to upload files. Please try again.", "error");
      console.error("Upload Error:", error);
    } finally {
      setPemFile(null);
      setPreviewPemFile(null);
      setLicenseFile(null);
      setPreviewLicenseFile(null);

      if (pemFileInputRef.current) pemFileInputRef.current.value = "";
      if (licenseFileInputRef.current) licenseFileInputRef.current.value = "";
    }
  };

  const handlePemFileEdit = () => {
    setPemFile(null);
    setPreviewPemFile(null);
    if (pemFileInputRef.current) {
      pemFileInputRef.current.value = "";
    }
  };

  const handleLicenseFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setLicenseFile(file);
      setPreviewLicenseFile(URL.createObjectURL(file));
    }
  };

  const handleLicenseFileEdit = () => {
    setLicenseFile(null);
    setPreviewLicenseFile(null);
    if (licenseFileInputRef.current) {
      licenseFileInputRef.current.value = "";
    }
  };

  const handleCloseLogoutDialog = () => {
    localStorage.clear();
    setShowLogoutDialog(false);
    handleLogout();
    navigate("/");
  };

  return (
    <Paper className="add-license-pop">
      <Grid className="add-license-pop-wrapper">
        <Grid className="add-license-pop-repeat">
          <Typography variant="h6" fontWeight={600}>
            Upload your publickey.pem file
          </Typography>

          <Box className="upload-your-file">
            {pemFile ? (
              <Box className="upload-your-file-wrapper">
                <div className="upload-your-file-name">
                  <img src="../images/file.png" alt="logo preview" />
                  <Typography variant="subtitle1" gutterBottom>
                    Selected File: {pemFile.name}
                  </Typography>
                </div>
                <IconButton onClick={handlePemFileEdit}>
                  <img src="../images/CTA.png" alt="cta" />
                </IconButton>
              </Box>
            ) : (
              <Box
                // onClick={() =>
                //   document.getElementById("pem-file-upload-input")?.click()
                // }
                onClick={() => {
                  if (pemFileInputRef.current) {
                    pemFileInputRef.current.value = ""; // force reset input
                    pemFileInputRef.current.click();
                  }
                }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                }}
              >
                <CloudUploadOutlinedIcon
                  sx={{ fontSize: 36, color: "#9e9e9e" }}
                />
                <Typography variant="body2" mt={1}>
                  Browse and choose the files you want to <br />
                  Upload from your computer
                </Typography>
                <IconButton
                  sx={{
                    background: "linear-gradient(to right, #FF8A00, #FE6500)",
                    color: "#fff",
                    mt: 1,
                    "&:hover": { background: "#FE6500" },
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            )}
            <input
              type="file"
              accept=".pem"
              id="pem-file-upload-input"
              hidden
              onChange={handlePemFileUpload}
              ref={pemFileInputRef}
            />
          </Box>

          {/* <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-start" }}>
            <CustomButton onClick={handlePemFileSave}>Save</CustomButton>
          </Box> */}
        </Grid>

        <Grid item xs={10} md={10} lg={10}>
          <Typography variant="h6" fontWeight={600}>
            Upload your license.lic file
          </Typography>

          <Box className="upload-your-file">
            {licenseFile ? (
              <Box className="upload-your-file-wrapper">
                <div className="upload-your-file-name">
                  <img src="../images/file.png" alt="logo preview" />
                  <Typography variant="subtitle1" gutterBottom>
                    Selected File: {licenseFile.name}
                  </Typography>
                </div>
                <IconButton onClick={handleLicenseFileEdit}>
                  <img src="../images/CTA.png" alt="cta" />
                </IconButton>
              </Box>
            ) : (
              <Box
                // onClick={() =>
                //   document.getElementById("license-file-upload-input")?.click()
                // }
                onClick={() => {
                  if (licenseFileInputRef.current) {
                    licenseFileInputRef.current.value = ""; // force reset input
                    licenseFileInputRef.current.click();
                  }
                }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                }}
              >
                <CloudUploadOutlinedIcon
                  sx={{ fontSize: 36, color: "#9e9e9e" }}
                />
                <Typography variant="body2" mt={1}>
                  Browse and choose the files you want to <br />
                  Upload from your computer
                </Typography>
                <IconButton
                  sx={{
                    background: "linear-gradient(to right, #FF8A00, #FE6500)",
                    color: "#fff",
                    mt: 1,
                    "&:hover": { background: "#FE6500" },
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            )}
            <input
              type="file"
              accept=".lic"
              id="license-file-upload-input"
              hidden
              onChange={handleLicenseFileUpload}
              ref={licenseFileInputRef}
            />
          </Box>
          {/* <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-start" }}>
            <CustomButton onClick={handleLicenseFileSave}>Save</CustomButton>
          </Box> */}
        </Grid>

        <Grid item xs={10} md={10} lg={10}>
          <CustomButton
            className="common-btn-design"
            onClick={handleSaveBothFiles}
            fullWidth={true}
          >
            Upload
          </CustomButton>
        </Grid>
      </Grid>
      <CommonDialog
        open={showLogoutDialog}
        title={""}
        content={
          "Both license files were uploaded successfully. Please log out and sign in again to apply the changes."
        }
        confirmText="Logout"
        onCancel={handleCloseLogoutDialog}
        onConfirm={handleCloseLogoutDialog}
        type="contactAdministrator"
        customClass="forgot-pass"
        titleClass={true}
      />
    </Paper>
  );
};

export { UploadClientLicenseAndPem };
