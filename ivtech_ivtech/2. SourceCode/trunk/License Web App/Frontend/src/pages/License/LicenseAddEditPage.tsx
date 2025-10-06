import React, { useState, useEffect } from "react";
import { Typography, TextField, Button, Container, Box, MenuItem, FormHelperText, Select, InputLabel, FormControl, SelectChangeEvent } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import handleResponse from "../../utils/handleResponse";
// import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import moment from "moment";
import { ILicence } from "../../interfaces/ILicense";
import { AddLicenseService, UpdateLicenseService } from "../../services/licenceService";
import { IClient } from "../../interfaces/IGetAllClients";
import { GetAllClientsService } from "../../services/clientService";
import { LABELS } from "../../utils/constants";


const LicenseAddEditPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [clients, setClients] = useState<IClient[]>([]);
  const [clientID, setClientID] = useState<string>("");
  const [machineID, setMachineID] = useState<string>("");
  const [numOfUsers, setNumOfUsers] = useState<number>(0);
  const [numOfCamera, setNumOfCamera] = useState<number>(0);
  const [expiryDate, setExpiryDate] = useState<Dayjs | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [errors, setErrors] = useState<{
    clientId?: string;
    machineId?: string;
    cameras?: string;
    users?: string;
    expiryDate?: string
  }>({});

  // Determine if we're in edit mode
  const isEditMode = location.state && location.state.licence;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const clientData = await GetAllClientsService();
      setClients(clientData.data as IClient[]);

    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      const initialLicence = location.state.licence;
      setClientID(initialLicence.clientId);
      setNumOfUsers(initialLicence.users);
      setNumOfCamera(initialLicence.cameras);
      setMachineID(initialLicence.machineID);
      setExpiryDate(initialLicence.updatedOn ? dayjs(initialLicence.expiryDate) : null);
    }
  }, [isEditMode, location.state]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (clientID && !clientID.trim()) {
      newErrors.clientId = "Client Name is required";
    }
    if (machineID && !machineID.trim()) {
      newErrors.machineId = "Machine ID is required";
    }

    if (!numOfUsers) {
      newErrors.users = "Number Of Users is required";
    }

    if (!numOfCamera) {
      newErrors.cameras = "Number Of Camera is required";
    }

    if (!expiryDate) {
      newErrors.expiryDate = "ExpiryDate is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const licenseData: ILicence = {
        clientId: clientID,
        cameras: numOfCamera,
        users: numOfUsers,
        expiryDate: expiryDate ? dayjs(expiryDate).toISOString() : "",
        machineId: machineID,
        ...(isEditMode &&
          location.state.licence && { id: location.state.licence.id }),
      };

      const saveLicenseRequest = async () => {
        setError(null);
        try {
          if (isEditMode) {
            const updateLicenseReq = async () => {
              setError(null); // Reset error
              try {
                const data = await UpdateLicenseService(licenseData);
                // navigate("/license-management", { state: { label: LABELS.License_master } });
              } catch (err: any) {
                setError(
                  err.message || "An error occurred while fetching users."
                );
              }
            };
            updateLicenseReq();
          } else {
            const addLicenseReq = async () => {
              setError(null); 
              try {
                const data = await AddLicenseService(licenseData);
                if (data !== null && typeof data !== "string" && data.isSuccess === true) {
                // navigate("/license-management", { state: { label: LABELS.License_master } });
                }
              
              } catch (err: any) {
                setError(
                  err.message || "An error occurred while fetching users."
                );
              }
            };
            addLicenseReq();
          }


        } catch (err: any) {
          setError(err.message || "An error occurred while saving the role");
        }
      };

      saveLicenseRequest();
    }
  };

  const handleClientChange = (event: SelectChangeEvent<string>) => {
    setClientID(event.target.value as string);
    if (!event.target.value) {
      setErrors({ ...errors, clientId: "Please select a client" });
    } else {
      setErrors({ ...errors, clientId: "" });
    }
  };

  return (

    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          {isEditMode ? "Edit License Request" : "Add License Request"}
        </Typography>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mt: 3, width: "100%" }}
        >

          {/* <TextField
            margin="normal"
            required
            fullWidth
            label="Client ID"
            value={clientID}
            onChange={(e) => setClientID(e.target.value)}
            error={!!errors.clientId}
            helperText={errors.clientId}
          /> */}

          <FormControl fullWidth margin="normal" error={!!errors.clientId}>
            <InputLabel>Client Name</InputLabel>
            <Select
              value={clientID}
              onChange={handleClientChange}
              label="Client Name"
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 200,
                  },
                },
              }}
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.customerName}
                </MenuItem>
              ))}
            </Select>
            {errors.clientId && (
              <FormHelperText>{errors.clientId}</FormHelperText>
            )}
          </FormControl>

          <TextField
            margin="normal"
            required
            fullWidth
            label="Machine ID"
            value={machineID}
            onChange={(e) => setMachineID(e.target.value)}
            error={!!errors.machineId}
            helperText={errors.machineId}
            variant="filled"
          />


          <TextField
            margin="normal"
            required
            fullWidth
            label="No. Of Users"
            value={numOfUsers}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              setNumOfUsers(Number.isNaN(value) ? 0 : value); // Default to 0 if invalid
            }}
            error={!!errors.users}
            helperText={errors.users}
            variant="filled"
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="No. Of Cameras"
            value={numOfCamera}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              setNumOfCamera(Number.isNaN(value) ? 0 : value); 
            }}
            error={!!errors.cameras}
            helperText={errors.cameras}
            variant="filled"
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>

            <DatePicker
              label="Expiry Date"
              value={expiryDate}
              onChange={(newValue) => setExpiryDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal",
                  required: true,
                  error: !!errors.expiryDate,
                  helperText: errors.expiryDate || "",
                  variant: "filled",
                },
              }}
            />
          </LocalizationProvider>



          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {
              isEditMode
                ? "Update Licence"
                : "Generate Licence"}
          </Button>
        </Box>
      </Box>
    </Container>

  );
};

export { LicenseAddEditPage }
