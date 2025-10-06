import {
  Box,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import CommonDialog from "../../components/Reusable/CommonDialog";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { formatDate } from "../../utils/dateUtils";
// import { useLocation } from "react-router-dom";
// import { usePermissions } from "../../context/PermissionsContext";
import {
  GetAllDistributorService,
  DeleteDistributorService,
} from "../../services/distributorService";
import { DistributorAddEditPage } from "./DistributorAddEditPage";
import {
  Idistributor,
  referenceDatatype,
  IDistributorDelete,
} from "../../interfaces/IDistributor";
import { LABELS } from "../../utils/constants";
import { CustomButton } from "../../components";
import { HasPermission } from "../../utils/screenAccessUtils";

export const DistributorManagement = () => {
  // const location = useLocation();
  // const label = location.state?.label;
  const [distributors, setDistributors] = useState<Idistributor[]>([]);
  const [referenceData, setReferenceData] = useState<referenceDatatype>();
  const [selectedDistributor, setSelectedDistributor] = useState<
    Idistributor | undefined
  >(undefined);
  const [openAddDistributor, setOpenAddDistributor] = useState(false);
  const [openEditDistributor, setOpenEditDistributor] =
    useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [distributorToBeDelete, setdistributorToBeDelete] =
    useState<IDistributorDelete | null>();
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10, // Default page size
    page: 0, // Default page index
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const distributorsData = await GetAllDistributorService();
      setDistributors(distributorsData.data as Idistributor[]);
      setReferenceData(distributorsData.referenceData as any);
    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    }
  };

  const columns: GridColDef[] = [
    { field: "distributorName", headerName: "Distributor Name", width: 150 },
    {
      field: "countryId",
      headerName: "Country",
      width: 150,
      renderCell: (params) => {
        const countryId = params.row.countryId as string;
        const filteredCountyData =
          referenceData &&
          referenceData.countryId.find((item) => item.value === countryId);
        return (
          <Box>
            {filteredCountyData && <label>{filteredCountyData.label}</label>}
          </Box>
        );
      },
    },
    { field: "email", headerName: "Email", width: 200 },
    { field: "contactPerson", headerName: "Contact Person", width: 150 },
    {
      field: "createdBy",
      headerName: "Created By",
      width: 150,
      renderCell: (params) => {
        const createdByID = params.row.createdBy as string;
        const filteredData =
          referenceData &&
          referenceData.createdBy.find((item) => item.value === createdByID);
        return <Box>{filteredData && <label>{filteredData.label}</label>}</Box>;
      },
    },
    {
      field: "createdOn",
      headerName: "Created On",
      width: 180,
      renderCell: (params) => {
        return <span>{formatDate(params.value)}</span>;
      },
    },
    {
      field: "updatedBy",
      headerName: "Last Updated By",
      width: 150,
      renderCell: (params) => {
        const updatedByID = params.row.updatedBy as string;
        const filteredData =
          referenceData &&
          referenceData.updatedBy.find((item) => item.value === updatedByID);
        return <Box>{filteredData && <label>{filteredData.label}</label>}</Box>;
      },
    },
    {
      field: "updatedOn",
      headerName: "Last Updated On",
      width: 180,
      renderCell: (params) => {
        return <span>{formatDate(params.value)}</span>;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      headerClassName: "sticky-column",
      cellClassName: "sticky-column",
      renderCell: (params) => (
        <Box>
          {HasPermission(LABELS.Can_Add_Or_Update_Distributor) && (
            <Tooltip title="Edit Distributor">
              <IconButton onClick={() => handleEdit(params.row)}>
                <img
                  src={"/images/edit.svg"}
                  alt="Distributor Icon"
                  width={22}
                  height={22}
                />
              </IconButton>
            </Tooltip>
          )}
          {HasPermission(LABELS.Can_Delete_the_Distributor) && (
            <Tooltip title="Delete Distributor">
              <IconButton onClick={() => handleDelete(params.id as string)}>
                <img
                  src={"/images/trash.svg"}
                  alt="Distributor Icon"
                  width={22}
                  height={22}
                />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredDistributors = distributors.filter(
    (distributor) =>
      distributor.distributorName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      distributor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      distributor.contactPerson
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleEdit = (distributor: Idistributor) => {
    setSelectedDistributor(distributor);
    setOpenEditDistributor(true);
  };

  const handleDelete = (distributorId: string) => {
    setdistributorToBeDelete({ id: distributorId });
    setOpenDeleteConfirm(true);
  };

  const handleAddDistributor = () => {
    setOpenAddDistributor(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddDistributor(false);
  };

  const handleCloseEditModal = () => {
    setOpenEditDistributor(false);
  };

  const handleCloseConfirm = () => {
    setOpenDeleteConfirm(false);
  };

  const finalDeleteUser = async (id: string) => {
    try {
      const deleteData = await DeleteDistributorService(id);
      if (deleteData.isSuccess) {
        setOpenDeleteConfirm(false);
        fetchInitialData();
      }
    } catch (err: any) {}
  };

    const CustomNoRowsOverlay = () => (
      <Box
        className="no-data-douns"
      >
        <Box sx={{ width: 200, justifyItems: "center", flex: 1 }}>
          <img src={'/images/noData.gif'} alt="Animated GIF" width="100" height="100" />
          <Typography
            sx={{ FontWeight: 600, fontSize: 24, color: "#090909" }}
          >
            No data found
          </Typography>       
        </Box>
      </Box>
    );

  return (
    <>
      <Box className="rightbar-main-content">
        <Box className="top-dash-details">
          <Typography variant="h5">List of Distributors</Typography>
          <Box className="top-dash-details-right">
            <TextField
              variant="outlined"
              fullWidth
              sx={{ mr: 2, ml: 2 }}
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by Distributor Name, Contact Person or Email"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <img
                      src={"/images/search.svg"}
                      alt="Search"
                    />
                  </InputAdornment>
                ),
              }}
            />

            {HasPermission(LABELS.Can_Add_Or_Update_Distributor) && (
              <CustomButton onClick={handleAddDistributor}>
                Add New Distributor
              </CustomButton>
            )}
            </Box>
        </Box>
        <DataGrid
        className="main-table"
          rows={filteredDistributors}
          columns={columns}
          getRowId={(row) => row.id}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50, 100]}
          // sx={{
          //   '& .MuiDataGrid-columnHeader': {
          //     backgroundColor: '#FDF1E8',
          //   }
          // }}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
          }}
        />
      </Box>

      <CommonDialog
        open={openDeleteConfirm}
        title="Delete Confirmation!"
        content="Are you sure you want to continue?"
        onConfirm={() =>
          distributorToBeDelete && finalDeleteUser(distributorToBeDelete.id)
        }
        onCancel={handleCloseConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        customClass="common-dialog-with-icon"
      />
      <CommonDialog
        open={openAddDistributor}
        title={"Add New Distributor"}
        content={
          <DistributorAddEditPage
            onClose={handleCloseAddModal}
            refreshData={fetchInitialData}
          />
        }
        onCancel={handleCloseAddModal}
        customClass="add-edit-dialog"
      />
      <CommonDialog
        open={openEditDistributor}
        title={"Edit Distributor"}
        content={
          <DistributorAddEditPage
            distributor={selectedDistributor}
            onClose={handleCloseEditModal}
            refreshData={fetchInitialData}
          />
        }
        onCancel={handleCloseEditModal}
        customClass="add-edit-dialog"
      />
    </>
  );
};
