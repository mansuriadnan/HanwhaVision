import React, { useState, useEffect } from "react";
import { Typography, Paper, CircularProgress } from "@mui/material";
import { showToast } from "../../components/Reusable/Toast";
import { GetMachineIdService } from "../../services/settingService";

export const MachineIdDisplay: React.FC = () => {
  const [machineId, setMachineId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMachineId = async () => {
      setLoading(true);
      try {
        const response = await GetMachineIdService();
        setMachineId(response);
      } catch (err: any) {
        console.error("Error fetching initial data:", err);
        showToast("An Error Occured while fetching machineId", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchMachineId();
  }, []);

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 2,
        marginBottom: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Typography variant="h6" sx={{ color: "#333" }}>
        Machine ID:
      </Typography>
      {loading ? (
        <CircularProgress size={24} />
      ) : machineId ? (
        <Typography
          variant="subtitle1"
          sx={{
            color: "#007BFF",
            fontWeight: "bold",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {machineId}
        </Typography>
      ) : (
        <Typography variant="subtitle1" sx={{ color: "red" }}>
          Machine ID not available
        </Typography>
      )}
    </Paper>
  );
};
