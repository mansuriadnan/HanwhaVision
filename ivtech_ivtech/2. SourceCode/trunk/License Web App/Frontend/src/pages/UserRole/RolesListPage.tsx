import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  TextField,
  Tooltip,
  InputAdornment,
} from "@mui/material";
// import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
// import { useLocation, useNavigate } from "react-router-dom";
import { IRole, referenceDatatype } from "../../interfaces/IRole";
import { DeleteRole, GetAllRoleService } from "../../services/roleService";
import { IRoleDelete } from "../../interfaces/IRoleUser";
// import handleResponse from "../../utils/handleResponse";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CommonDialog from "../../components/Reusable/CommonDialog";
// import { filterByScreenName } from "../../utils/screenAccessUtils";
// import { usePermissions } from "../../context/PermissionsContext";
import { LABELS } from "../../utils/constants";
import { formatDate } from "../../utils/dateUtils";
import { CustomButton, showToast } from "../../components";
import { RoleAddEditPage } from "./RoleAddEditPage";
import {HasPermission} from "../../utils/screenAccessUtils";

export const RolesListPage: React.FC = () => {
  // const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [roles, setRoles] = useState<IRole[]>([]);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [roleToBeDelete, setRoleToBeDelete] = useState<IRoleDelete | null>(
    null
  );
  // const { permissions }: { permissions: any[] } = usePermissions();
  // const location = useLocation();
  // const label = location.state?.label;
  // const [filteredChildren, setFilteredChildren] = useState<any[]>([]);
  const [openAddRole, setOpenAddRole] = useState<boolean>(false);
  const [openEditRole, setOpenEditRole] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<IRole | undefined>(
    undefined
  );
  const [referenceData, setReferenceData] = useState<referenceDatatype>();
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10, // Default page size
    page: 0, // Default page index
  });

  useEffect(() => {
    GetAllRole();
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

  const GetAllRole = async () => {
    try {
      const Roledata = await GetAllRoleService();
      setRoles(Roledata.data as IRole[]);
      setReferenceData(Roledata.referenceData as any);
    } catch (err: any) {
      console.error("Error fetching roles:", err);
    }
  };

  const columns: GridColDef[] = [
    // { field: "roleName", headerName: "Role Name", width: 150 },
    { field: "roleName", headerName: "Role Name", flex: 1 },
    // { field: "description", headerName: "Description", width: 250 },
    {
      field: "createdBy",
      headerName: "Created By",
      // width: 150,
      flex: 1,
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
      // width: 250,
      flex: 1,
      renderCell: (params) => {
        return <span>{formatDate(params.value)}</span>;
      },
    },
    {
      field: "updatedBy",
      headerName: "Last Updated By",
      // width: 150,
      flex: 1,
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
      // width: 150,
      flex: 1,
      renderCell: (params) => {
        return <span>{formatDate(params.value)}</span>;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      // width: 150,
      flex: 1,
      sortable: false,
      // headerClassName: "sticky-column",
      // cellClassName: "sticky-column",
      renderCell: (params) => (
        <Box>
          {HasPermission(LABELS.Can_Add_Or_Update_Role)  && (
            <Tooltip title="Edit Role">
            <IconButton onClick={() => handleEditRole(params.row)}>
              <img src={"/images/edit.svg"} alt="edit" width={22} height={22} />
            </IconButton>
            </Tooltip>
          )}

          {HasPermission(LABELS.Can_Delete_Role) && (
            <Tooltip title="Delete Role">
            <IconButton onClick={() => handleDeleteRole(params.id as string)}>
              <img src={"/images/trash.svg"} alt="delete" width={22} height={22} />
            </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const handleEditRole = (role: IRole) => {
    //navigate("/roleaddedit", { state: { role } });
    setOpenEditRole(true);
    setSelectedRole(role);
  };

  const handleCloseEditModal = () => {
    setOpenEditRole(false);
  };

  const handleDeleteRole = (roleId: string) => {
    setRoleToBeDelete({ id: roleId });
    setOpenDeleteConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenDeleteConfirm(false);
  };

  const handleAddRole = () => {
    //navigate("/roleaddedit");
    setOpenAddRole(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddRole(false);
  };

  const finalDeleteRole = async (id: string) => {
    try {
      const deleteData = await DeleteRole(id);

      if (deleteData?.isSuccess) {
        setOpenDeleteConfirm(false);
        GetAllRole();
      }
    } catch (err: any) {
      console.error("Error deleting role:", err);
    }
  };

  // const filteredEdit = filterByScreenName(
  //   filteredChildren,
  //   LABELS.Can_Add_Or_Update_Role
  // );

  // const filteredDelete = filterByScreenName(
  //   filteredChildren,
  //   LABELS.Can_Delete_Role
  // );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.roleName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Typography variant="h5">List of Roles</Typography>
          <Box className="top-dash-details-right">
            <TextField
              variant="outlined"
              fullWidth
              sx={{ mr: 2, ml: 2 }}
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by role name"
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

            {HasPermission(LABELS.Can_Add_Or_Update_Role) && (
              <CustomButton onClick={handleAddRole} customStyles={{ mb: 2 }}>
                Add New Role
              </CustomButton>
            )}
            </Box>
        </Box>

        <DataGrid
          rows={filteredRoles}
          columns={columns}
          getRowId={(row) => row.id}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50, 100]}
          sx={{
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#FDF1E8',
            }
          }}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
          }}
          
        />
      </Box>

      <CommonDialog
        open={openDeleteConfirm}
        title="Delete Confirmation!"
        content="Are you sure you want to continue?"
        onConfirm={() => roleToBeDelete && finalDeleteRole(roleToBeDelete.id)}
        onCancel={handleCloseConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        customClass="common-dialog-with-icon"

      />

      <CommonDialog
        open={openAddRole}
        title={"Add New Role"}
        content={
          <RoleAddEditPage
            onClose={handleCloseAddModal}
            refreshData={GetAllRole}
          />
        }
        onCancel={handleCloseAddModal}
        //cancelText="Cancel"
        customClass="add-edit-dialog"
      />

      <CommonDialog
        open={openEditRole}
        title={"Edit Role"}
        content={
          <RoleAddEditPage
            role={selectedRole}
            onClose={handleCloseEditModal}
            refreshData={GetAllRole}
          />
        }
        onCancel={handleCloseEditModal}
        //cancelText="Cancel"
        customClass="add-edit-dialog"
      />
    </>
  );
};
export default RolesListPage;
