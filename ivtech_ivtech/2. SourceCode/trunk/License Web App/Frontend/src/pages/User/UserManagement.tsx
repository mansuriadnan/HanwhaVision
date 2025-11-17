import React, { useState, useEffect } from "react";
import {
  Typography,
  Container,
  TextField,
  Box,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
} from "@mui/material";
// import {
//   Edit as EditIcon,
//   Delete as DeleteIcon,
//   Visibility as ViewIcon,
// } from "@mui/icons-material";
// import { useLocation, useNavigate } from "react-router-dom";
import { IUsers, referenceDatatype } from "../../interfaces/IGetAllUsers";
import {
  DeleteUserService,
  GetAllUsersService,
} from "../../services/userService";
import { IRole } from "../../interfaces/IRole";
import { IRoleDelete } from "../../interfaces/IRoleUser";
// import handleResponse from "../../utils/handleResponse";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CommonDialog from "../../components/Reusable/CommonDialog";
// import { usePermissions } from "../../context/PermissionsContext";
// import { filterByScreenName } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";
import { formatDate } from "../../utils/dateUtils";
import { UserAddEditForm } from "./UserAddEditForm";
import { CustomButton } from "../../components/index";
import { HasPermission } from "../../utils/screenAccessUtils";

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<IUsers[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalRoles, setTotalRoles] = useState<IRole[]>([]);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [userToBeDelete, setUserToBeDelete] = useState<IRoleDelete | null>(
    null
  );
  // const { permissions }: { permissions: any[] } = usePermissions();
  // const location = useLocation();
  // const label = location.state?.label;
  // const [filteredChildren, setFilteredChildren] = useState<any[]>([]);
  const [openAddUser, setOpenAddUser] = useState<boolean>(false);
  const [openEditUser, setOpenEditUser] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<IUsers | undefined>(
    undefined
  );
  const [referenceData, setReferenceData] = useState<referenceDatatype>();
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10, // Default page size
    page: 0, // Default page index
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  // useEffect(() => {
  //   if (label && permissions.length > 0) {
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
      const usersData: any = await GetAllUsersService();
      setUsers(usersData.data as IUsers[]);
      setReferenceData(usersData.referenceData as any);
    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCloseConfirm = () => {
    setOpenDeleteConfirm(false);
  };

  const finalDeleteUser = async (id: string) => {
    try {
      const deleteData = await DeleteUserService(id);
      if (deleteData.isSuccess) {
        setOpenDeleteConfirm(false);
        fetchInitialData();
      }
    } catch (err: any) { }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    // Check if any role name matches the search term
    // user.roleIds.some((roleId) => {
    //   const role = totalRoles.find((role) => role.id === roleId);
    //   return role
    //     ? role.roleName.toLowerCase().includes(searchTerm.toLowerCase())
    //     : false;
    // })
  );

  const handleAddUser = () => {
    setOpenAddUser(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddUser(false);
  };

  const handleEdit = (user: IUsers) => {
    const userWithRoleIds = {
      ...user,
    };
    setSelectedUser(userWithRoleIds);
    setOpenEditUser(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditUser(false);
  };

  const handleDelete = (userid: string) => {
    setUserToBeDelete({ id: userid });
    setOpenDeleteConfirm(true);
  };

  // const filteredEdit = filterByScreenName(
  //   filteredChildren,
  //   LABELS.Can_Add_Update_User
  // );

  // const filteredDelete = filterByScreenName(
  //   filteredChildren,
  //   LABELS.Can_Delete_USer
  // );

  const columns: GridColDef[] = [
    { field: "username", headerName: "Username", flex: 1, },
    {
      field: "fullName",
      headerName: "Full Name",
       flex: 1,
      renderCell: (params) => {
        return (
          <Box>
            {params.row.firstname || ""} {params.row.lastname || ""}
          </Box>
        );
      },
    },
    { field: "email", headerName: "Email",  flex: 1, },
    {
      field: "roleIds",
      headerName: "Roles",
      flex: 1,
      renderCell: (params) => {
        return (
          <Box>
            {(params.value as string[]).map((roleId) => {
              const role =
                referenceData &&
                referenceData.roleIds.find((role) => role.value === roleId);
              return role ? (
                <Chip
                  key={role.value}
                  label={role.label}
                  size="small"
                  color="warning"
                  variant="outlined"
                  style={{ margin: 2 }}
                />
              ) : null;
            })}
          </Box>
        );
      },
    },
    {
      field: "createdBy",
      headerName: "Created By",
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
       flex: 1,
      renderCell: (params) => {
        return <span>{formatDate(params.value)}</span>;
      },
    },
    {
      field: "updatedBy",
      headerName: "Last Updated By",
       flex: 1,
      renderCell: (params) => {
        const updatedById = params.row.updatedBy as string;
        const filteredData =
          referenceData &&
          referenceData.updatedBy.find((item) => item.value === updatedById);

        return <Box>{filteredData && <label>{filteredData.label}</label>}</Box>;
      },
    },
    {
      field: "updatedOn",
      headerName: "Last Updated On",
       flex: 1,
      renderCell: (params) => {
        return <span>{formatDate(params.value)}</span>;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
       flex: 1,
      sortable: false,
      headerClassName: "static-column",
      cellClassName: "static-column",
      renderCell: (params) => (
        <Box>
          {HasPermission(LABELS.Can_Add_Update_User) && (
            <Tooltip title="Edit User">
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
          {HasPermission(LABELS.Can_Delete_USer) && (
            <Tooltip title="Delete User">
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

  const CustomNoRowsOverlay = () => (
    <Box className="no-data-douns"
    >
      <Box sx={{ width: 200, justifyItems: "center", flex: 1, }}>
        <img src={'/images/noData.gif'} alt="Animated GIF" width="100" height="100" />
        <Typography
          sx={{ FontWeight: 600, fontSize: 24, color: "#090909" }}
        >
          No data found
        </Typography>
        {/* <Typography
          sx={{ FontWeight: 400, fontSize: 12, color: "#212121" }}
        >
         No data available to display Users. Please add a new user by clicking the <strong>Add New User</strong> button.
        </Typography> */}
      </Box>
    </Box>
  );

  return (
    <>
      <Box className="rightbar-main-content">
        <Box className="top-dash-details">
          <Typography variant="h5">List of Users</Typography>
          <Box className="top-dash-details-right">
            <TextField
              //label="Search"
              variant="outlined"
              // fullWidth
              sx={{ flexGrow: 1, maxWidth: "500px", mr: 2, ml: 2 }}
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by Username or Email"
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
            {HasPermission(LABELS.Can_Add_Update_User) && (
              <CustomButton
                customStyles={{
                  ml: "auto",
                }}
                onClick={handleAddUser}
              >
                Add New User
              </CustomButton>
            )}
          </Box>
        </Box>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          getRowId={(row) => row.id}
          className="custom-grid"
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
        onConfirm={() => userToBeDelete && finalDeleteUser(userToBeDelete.id)}
        onCancel={handleCloseConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        customClass="common-dialog-with-icon"
      />

      <CommonDialog
        open={openAddUser}
        title={"Add New User"}
        content={
          <UserAddEditForm
            onClose={handleCloseAddModal}
            refreshData={fetchInitialData}
          />
        }
        onCancel={handleCloseAddModal}
        //cancelText="Cancel"
        customClass="add-edit-dialog"
      />
      <CommonDialog
        open={openEditUser}
        title={"Edit User"}
        content={
          <UserAddEditForm
            user={selectedUser}
            onClose={handleCloseEditModal}
            refreshData={fetchInitialData}
          />
        }
        onCancel={handleCloseEditModal}
        //cancelText="Cancel"
        customClass="add-edit-dialog"
      />
    </>
  );
};

export { UserManagementPage };
