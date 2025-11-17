import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  LinearProgress,
} from "@mui/material";
import React, { ChangeEvent, useRef, useState } from "react";
import { HasPermission } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";
import {
  databaseBackupService,
  restoreChunkFileService,
  restoreFinalFileService,
  uploadBackupFileService,
} from "../../services/settingService";
import { showToast } from "../../components/Reusable/Toast";

// Type definitions
interface FinalizeUploadRequest {
  uploadId: string;
  fileName: string;
}

interface ChunkUploadResponse {
  chunkIndex: number;
  status: string;
}

interface FinalizeUploadResponse {
  message: string;
  filePath: string;
  fileName: string;
}

const BackupRestorePage: React.FC = () => {
  const backgroundStyle = {
    backgroundImage: ` url('/images/lines.png'), linear-gradient(287.68deg, #FE6500 -0.05%, #FF8A00 57.77%)`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  };

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUploadChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      setFileError("");
    } else {
      // User clicked "Cancel" → clear selection
      setSelectedFile(file);
      setFileError("No file selected");
    }
  };

  const generateUploadId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const uploadFileInChunks = async (file: File): Promise<void> => {
    const chunkSize: number = 10 * 1024 * 1024; // 10MB chunks
    const totalChunks: number = Math.ceil(file.size / chunkSize);
    const uploadId: string = generateUploadId();

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start: number = chunkIndex * chunkSize;
        const end: number = Math.min(start + chunkSize, file.size);
        const chunk: Blob = file.slice(start, end);

        const formData = new FormData();
        formData.append("file", chunk);
        formData.append("chunkIndex", chunkIndex.toString());
        formData.append("totalChunks", totalChunks.toString());
        formData.append("uploadId", uploadId);
        formData.append("fileName", file.name);

        // const response: Response = await fetch(
        //   `${API_BASE_URL}MongoBackupRestore/chunk`,
        //   {
        //     method: "POST",
        //     body: formData,
        //   }
        // );

        const response: any = await restoreChunkFileService(formData);

        if (!response.isSuccess) {
          throw new Error(`Chunk upload failed: ${response.statusText}`);
        }

        const result: ChunkUploadResponse = await response.data;

        // Update progress
        const progress: number = ((chunkIndex + 1) / totalChunks) * 100;
        setUploadProgress(progress);
      }

      // Finalize upload
      const finalizePayload: FinalizeUploadRequest = {
        uploadId,
        fileName: file.name,
      };

      //       const headers = {
      //     'Authorization': `Bearer ${token}`,
      //     // Add any other required headers
      //   };

      //   const finalizeResponse: Response = await fetch(
      //     `${API_BASE_URL}MongoBackupRestore/finalize`,
      //     {
      //       method: "POST",
      //       headers: { "Content-Type": "application/json" },
      //       body: JSON.stringify(finalizePayload),
      //     }
      //   );

      const finalizeResponse: any = await restoreFinalFileService(
        finalizePayload
      );

      if (finalizeResponse.isSuccess) {
        const result: FinalizeUploadResponse = await finalizeResponse.message;
        console.log("Upload completed:", result);

        // Call your restore database function here if needed
        // await handleActualRestoreDatabase(result.filePath);
      } else {
        throw new Error(
          `Finalize upload failed: ${finalizeResponse.statusText}`
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Upload failed:", error);
      setFileError(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRestoreDatabase = async (): Promise<void> => {
    if (!selectedFile) {
      setFileError("Please select a file first");
      return;
    }

    // Validate file type
    if (!selectedFile.name.endsWith(".zip.aes")) {
      setFileError("Please select a valid .zip.aes file");
      return;
    }

    await uploadFileInChunks(selectedFile);
  };

  const handleFullBackup = async () => {
    try {
      await databaseBackupService();
    } catch (err: any) {
      setError(err.message || "An error occurred while taking backup.");
      showToast("An error occurred while taking backup.", "error");
    }
  };
  //   const handleFileUploadChange = async (
  //     e: React.ChangeEvent<HTMLInputElement>
  //   ) => {
  //     const file = e.target.files?.[0];
  //     if (!file) return;
  //     const fileName = file.name;
  //     setSelectedFile(file);
  //     setFileError("");
  //     // Enforce .zip.aes extension check
  //     if (!fileName.endsWith(".zip.aes")) {
  //       setFileError("Only .zip.aes file is allowed.");
  //       return;
  //     }
  //   };

  const handleFileUploadChange1 = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    setSelectedFile(file);
    setFileError("");

    // ✅ Extension check
    if (!fileName.endsWith(".zip.aes")) {
      setFileError("Only .zip.aes file is allowed.");
      return;
    }

    // ✅ Upload the file in chunks
    await uploadLargeFile(file);
  };

  const uploadLargeFile = async (file: File) => {
    const chunkSize = 5 * 1024 * 1024; // 5MB per chunk
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("file", chunk);
      formData.append("fileName", file.name);
      formData.append("chunkIndex", i.toString());
      formData.append("totalChunks", totalChunks.toString());

      //console.log(`Uploaded chunk ${i + 1}/${totalChunks}`);
    }

    // ✅ Tell server to merge chunks
  };

  const handleRestoreDatabase1 = async () => {
    if (!selectedFile) {
      setFileError("Please select file.");
      return;
    }
    if (!selectedFile.name.endsWith(".zip.aes")) {
      setFileError("Only .zip.aes file is allowed.");
      return;
    }

    setFileError("");
    const formData = new FormData();
    formData.append("backupFile", selectedFile);
    try {
      const response: any = await uploadBackupFileService(formData);
      if (response && response?.isSuccess && fileInputRef.current) {
        fileInputRef.current.value = "";
        setSelectedFile(null);
      }
    } catch (error: any) {
      console.error("Restore DB file Upload error:", error);
    }
  };

  return (
    // <div className="floor-plans-zones">
    <Container sx={{}} maxWidth={false}>
      {/* Header */}
      <div className="top-orange-head" style={backgroundStyle}>
        <Box className="top-orange-head-left">
          <Typography variant="h4">Backup & Restore</Typography>
          <Typography>Download your data & restore it..</Typography>
        </Box>
      </div>

      {/* Content Area */}
      <Grid className="backup-restore">
        {/* Backup Section */}
        <Grid item className="backup-restore-box">
          <Paper>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Backup
            </Typography>
            <strong>
              The button below will create a full system backup on your local
              machine. You can use this backup in the future in case of system
              failure or whenever needed.
            </strong>
            <Typography>
              Please click the button below to take a full backup now.
            </Typography>
            {HasPermission(LABELS.CanTakeFullDBBackup) && (
              <Button
                variant="contained"
                className="common-btn-design"
                onClick={() => handleFullBackup()}
              >
                Take Full Backup
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Restore Section */}
        <Grid item className="backup-restore-box">
          <Paper>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Restore
            </Typography>
            <label>
              File Name <span style={{ color: "red" }}>*</span>
            </label>
            <TextField
              type="file"
              fullWidth
              variant="outlined"
              id="back-up-date"
              error={!!fileError}
              helperText={fileError}
              InputProps={{
                inputProps: { accept: ".zip.aes" },
              }}
              inputRef={fileInputRef}
              onChange={handleFileUploadChange}
              disabled={isUploading}
            />

            {isUploading && (
              <div style={{ marginTop: 16, marginBottom: 16 }}>
                <Typography variant="body2">
                  Uploading... {Math.round(uploadProgress)}%
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </div>
            )}

            {HasPermission(LABELS.CanRestoreDatabase) && (
              <Button
                variant="contained"
                className="common-btn-design"
                onClick={handleRestoreDatabase}
                disabled={isUploading || !selectedFile}
              >
                {isUploading ? "Uploading..." : "Restore"}
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
    // </div>
  );
};
export default BackupRestorePage;

function setError(arg0: any) {
  throw new Error("Function not implemented.");
}
