import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { showToast } from "../Reusable/Toast";
import { useNavigate } from "react-router-dom";
import { useLicense } from "../../context/LicenseContext";
import { uploadClientLicense } from "../../services/settingService";

export const UploadClientLicense: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLicenseValid } = useLicense();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      showToast(`Please select a file first!`, "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setUploading(true);
      const response = await uploadClientLicense(formData);
      if (typeof response !== "string" && response?.isSuccess) {
        showToast(response?.message || `File Uploaded Successfully`, "success");
        navigate(`/logout`);
      } else {
        showToast(`Failed to upload the file. Please try again.`, "error");
      }
    } catch (error) {
      showToast(`Failed to upload the file. Please try again.`, "error");
    } finally {
      setUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Upload Client License File
      </Typography>

      {isLicenseValid !== null && (
        <Alert
          severity={isLicenseValid ? "success" : "error"}
          sx={{
            marginBottom: 2,
            backgroundColor: isLicenseValid ? "#e8f5e9" : "#ffebee",
            color: isLicenseValid ? "green" : "red",
          }}
        >
          {isLicenseValid ? "License Validated" : "License Not Validated"}
        </Alert>
      )}

      <input
        type="file"
        accept=".lic,.txt,.json" // Restrict to specific license file types
        onChange={handleFileChange}
        style={{ marginBottom: "1rem" }}
        ref={fileInputRef}
      />

      {selectedFile && (
        <Typography variant="subtitle1" gutterBottom>
          Selected File: {selectedFile.name}
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleFileUpload}
        disabled={uploading}
      >
        {uploading ? <CircularProgress size={24} /> : "Upload License"}
      </Button>
    </Box>
  );
};
