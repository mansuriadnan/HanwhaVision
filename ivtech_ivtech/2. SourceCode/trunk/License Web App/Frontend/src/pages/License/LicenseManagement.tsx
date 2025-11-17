import {
  Box,
  Button,
  Container,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GetAllLicenceService } from "../../services/licenceService";
import { ILicence, IReferenceData } from "../../interfaces/ILicense";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import moment from "moment";
import { Edit as EditIcon } from "@mui/icons-material";
// import { useThemeContext } from "../../context/ThemeContext";
// import { filterByScreenName } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";
// import { usePermissions } from "../../context/PermissionsContext";
import { HasPermission } from "../../utils/screenAccessUtils";

const LicenseManagement = () => {
  const navigate = useNavigate();
  const [licence, setLicence] = useState<ILicence[]>([]);
  const [referenceData, setReferenceData] = useState<IReferenceData | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  // const { theme, toggleTheme } = useThemeContext();
  // const { permissions }: { permissions: any[] } = usePermissions();
  const location = useLocation();
  // const label = location.state?.label;
  // const [filteredChildren, setFilteredChildren] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // useEffect(() => {
  //   if (label && permissions.length > 0) {
  //     // Find the matching permission by label
  //     const matchingPermission = permissions.find(
  //       (permission: any) => permission.screenName === label
  //     );

  //     if (matchingPermission && matchingPermission.children.length > 0) {
  //       setFilteredChildren(matchingPermission.children);
  //     }
  //   }
  // }, [label, permissions]);

  const fetchInitialData = async () => {
    try {
      const licenceData = await GetAllLicenceService();

      if (licenceData.isSuccess) {
        setLicence(licenceData.data as ILicence[]);
        setReferenceData(licenceData.referenceData as IReferenceData);
      }
    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    }
  };

  const handleEdit = (licencedata: ILicence) => {
    const filteredMachineID =
      referenceData &&
      referenceData?.clientMachineId.find(
        (machine) => machine.value === licencedata.customerId 
      );
    const licence = {
      ...licencedata,
      machineID: filteredMachineID?.label,
    };
    navigate("/licenseaddedit", { state: { licence } });
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredLicense = licence.filter(
    (licence) =>
      licence.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      licence.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: "clientId", headerName: "ClientId", width: 220 },
    {
      field: "ClientName",
      headerName: "ClientName",
      width: 120,
      renderCell: (params) => {
        const clientId = params.row.clientId as string;
        const filteredClient =
          referenceData &&
          referenceData.clientMapping.find(
            (client) => client.value === clientId
          );

        return (
          <Box>{filteredClient && <label>{filteredClient.label}</label>}</Box>
        );
      },
    },
    { field: "cameras", headerName: "Cameras", width: 120 },
    { field: "users", headerName: "Users", width: 120 },
    { field: "status", headerName: "Status", width: 120 },
    {
      field: "expiryDate",
      headerName: "ExpiryDate",
      width: 180,
      // renderCell: (params) => formatDateTime(params.value as string | null),
      renderCell: (params) =>
        moment(params.value as string | null).format("LL"),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params) => {
        if (params.row.status !== "Completed") {
          return (
            <Box>
              {/* {HasPermission(LABELS.Can_Add_Or_Update_License) && (
                <Tooltip title="Edit License">
                  <IconButton onClick={() => handleEdit(params.row)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )} */}

              <Button
                color="primary"
                href={`https://localhost:7259/api/license/GenerateLicense/${params.row.id}`}
                download
              >
                Generate
              </Button>
            </Box>
          );
        }
      },
    },
  ];

  const handleGenerateLicence = () => {
    navigate("/licenseaddedit");
  };

  // const filteredEdit = filterByScreenName(
  //   filteredChildren,
  //   LABELS.Can_Add_Or_Update_License
  // );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        License Management
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <TextField
          label="Search License"
          variant="outlined"
          fullWidth
          sx={{ mr: 2 }}
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search by ClientID, Status"
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateLicence}
        >
          License Request
        </Button>
      </Box>
      <DataGrid
        rows={filteredLicense}
        columns={columns}
        getRowId={(row) => row.id}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
          },
        }}

        // slots={{
        //   toolbar: GridToolbar,
        // }}
        // slotProps={{
        //   toolbar: {
        //     showQuickFilter: true,
        //   },
        // }}

        //   sx={{
        //     '& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': {
        //      backgroundColor: theme === "light"? "white" : "black",
        //      color: theme === "light"? "black" : "white",
        //      fontWeight: 700,
        //   },
        // }}
      />
    </Container>
  );
};

export { LicenseManagement };
