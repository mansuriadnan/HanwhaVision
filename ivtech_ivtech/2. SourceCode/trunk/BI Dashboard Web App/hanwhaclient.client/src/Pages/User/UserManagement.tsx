import {
  Box,
  Chip,
  Container,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
// import { CommonDialog, CustomButton, UserAddEditForm } from "../../components";
import { CommonDialog } from "../../components/Reusable/CommonDialog";
import { CustomButton } from "../../components/Reusable/CustomButton";
import { UserAddEditForm } from "../../components/Users/UserAddEditForm";
import { DataGrid, GridColDef, GridCloseIcon } from "@mui/x-data-grid";

import {
  DeleteUserService,
  GetAllUsersService,
} from "../../services/userService";
import { IReferenceDatatype, IUsers } from "../../interfaces/IManageUsers";
import { formatDate } from "../../utils/dateUtils";
import { HasPermission } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";
import { ICommonId } from "../../interfaces/ILookup";
import { formatDateToConfiguredTimezone } from "../../utils/formatDateToConfiguredTimezone";
import { useThemeContext } from "../../context/ThemeContext";

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<IUsers[]>([]);
  const [referenceData, setReferenceData] = useState<IReferenceDatatype>();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [openAddUser, setOpenAddUser] = useState<boolean>(false);
  const [openEditUser, setOpenEditUser] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<IUsers | undefined>(
    undefined
  );
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [userToBeDelete, setUserToBeDelete] = useState<ICommonId | null>(null);
  const { theme } = useThemeContext();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const usersData: any = await GetAllUsersService();
      setUsers(usersData.data as IUsers[]);
      setReferenceData(usersData.referenceData);
    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    }
  };

  const handleEdit = (user: IUsers) => {
    const userWithRoleIds = {
      ...user,
    };
    setSelectedUser(userWithRoleIds);
    setOpenEditUser(true);
  };

  const handleAddUser = () => {
    setOpenAddUser(true);
    setSelectedUser(undefined);
  };

  const handleCloseAddDrawer = () => {
    setOpenAddUser(false);
    setSelectedUser(undefined);
  };

  const handleCloseEditDrawer = () => {
    setOpenEditUser(false);
    setSelectedUser(undefined);
  };

  const handleDelete = (userid: string) => {
    setUserToBeDelete({ id: userid });
    setOpenDeleteConfirm(true);
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

  const filteredUsers = searchTerm?.length >= 3 ? users?.filter((user) => {
    const fullName = `${user.firstname ?? ""} ${user.lastname ?? ""
      }`.toLowerCase();

    return (
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.includes(searchTerm.toLowerCase())
    );
  }) : users;

  const columns: GridColDef[] = [
    { field: "username", headerName: "Username", flex: 1 },
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
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "roleIds",
      headerName: "Roles",
      flex: 1,
      renderCell: (params) => {
        return (
          <Box>
            {(params.value as string[]).map((roleId) => {
              const role = referenceData?.roleIds?.find(
                (role) => role.value === roleId
              );
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
        const filteredData = referenceData?.createdBy?.find(
          (item) => item.value === createdByID
        );
        return <Box>{filteredData && <label>{filteredData.label}</label>}</Box>;
      },
    },
    {
      field: "createdOn",
      headerName: "Created On",
      flex: 1,
      renderCell: (params) => {
        const convertedDateTime = formatDateToConfiguredTimezone(params.value);
        return <span>{formatDate(convertedDateTime)}</span>;
      },
    },
    {
      field: "updatedBy",
      headerName: "Last Updated By",
      flex: 1,
      renderCell: (params) => {
        const updatedById = params.row.updatedBy as string;
        const filteredData = referenceData?.updatedBy?.find(
          (item) => item.value === updatedById
        );
        return <Box>{filteredData && <label>{filteredData.label}</label>}</Box>;
      },
    },
    {
      field: "updatedOn",
      headerName: "Last Updated On",
      flex: 1,
      renderCell: (params) => {
        const convertedDateTime = formatDateToConfiguredTimezone(params.value);
        return <span>{formatDate(convertedDateTime)}</span>;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          {HasPermission(LABELS.Can_Add_Update_User) && (
            <Tooltip title="Edit User">
              <IconButton onClick={() => handleEdit(params.row)}>
                <img
                  src={"/images/user-action-edit.svg"}
                  alt="User Action Edit Icon"
                  width={20}
                  height={20}
                />
              </IconButton>
            </Tooltip>
          )}
          {HasPermission(LABELS.Can_Delete_User) && (
            <Tooltip title="Delete User">
              <IconButton onClick={() => handleDelete(params.id as string)}>
                <img
                  src={"/images/user-action-delete.svg"}
                  alt="User Action Delete Icon"
                  width={20}
                  height={20}
                />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const backgroundStyle = {
    backgroundImage: ` url('/images/lines.png'), linear-gradient(287.68deg, #FE6500 -0.05%, #FF8A00 57.77%)`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  };

  const CustomNoRowsOverlay = () => (
    <Box className="no-data-douns"
    >
      <Box sx={{ width: 200, justifyItems: "center", flex: 1, }}>
        <img src={theme === 'light' ? '/images/noData.gif' : '/images/dark-theme/noData.gif'} alt="Animated GIF" width="100" height="100" />
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
      <Container sx={{}} maxWidth={false}>
        <div className="top-orange-head" style={backgroundStyle} >
          <Box className="top-orange-head-left">
            <Typography variant="h4">
              Manage Users
            </Typography>
            <Typography>
              Add, update & delete your users information here..
            </Typography>
          </Box>

          {HasPermission(LABELS.Can_Add_Update_User) && (
            <CustomButton
              size="small"
              variant="outlined"
              customStyles={{
                background: "#FFFFFF",
                color: "#090909",
                borderRadius: 8,
              }}
              onClick={handleAddUser}
            >
              <img src={"/images/adddevice.svg"} alt="Add Devices" /> Add User
            </CustomButton>
          )}
        </div>

        <Box
          className="top-list-bar"
        >


          <h5>List Of Users</h5>
          <div className="top-listing-items">

            <TextField
              variant="outlined"
              placeholder="Search by full name, username, email"
              value={searchTerm}
              onChange={handleSearch}
              sx={{ borderRadius: 8 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <img
                      src={"/images/search.svg"}
                      alt="Search"
                      style={{ cursor: "pointer" }}
                    />
                  </InputAdornment>
                ),
              }}
            />

          </div>

        </Box>

        <DataGrid
          rows={filteredUsers}
          columns={columns}
          getRowId={(row) => row.id}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50, 100]}
          className="user-screen"
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
          }}
          hideFooter={users.length === 0}
        />

        <Drawer
          anchor={"right"}
          open={openAddUser}
          onClose={() => {
            handleCloseAddDrawer();
          }}
          ModalProps={{
            onClose: (event, reason) => {
              if (reason !== 'backdropClick') {
                // onClose(); // only call your close function on non-backdrop events
                handleCloseAddDrawer();
              }
            }
          }}
          className="cmn-pop"
        >
          <Box className="cmn-pop-head">
            <Typography variant="h6">Add User</Typography>
            {/* Close Icon on Right */}
            <IconButton onClick={handleCloseAddDrawer}>
              <GridCloseIcon />
            </IconButton>
          </Box>
          <UserAddEditForm
            onClose={handleCloseAddDrawer}
            refreshData={fetchInitialData}
          />
        </Drawer>

        <Drawer
          anchor={"right"}
          open={openEditUser}
          onClose={() => {
            handleCloseEditDrawer();
          }}
          ModalProps={{
            onClose: (event, reason) => {
              if (reason !== 'backdropClick') {
                // onClose(); // only call your close function on non-backdrop events
                handleCloseEditDrawer();
              }
            }
          }}
          className="cmn-pop"
        >
          <Box className="cmn-pop-head">
            <Typography variant="h6">Edit User</Typography>
            <IconButton onClick={handleCloseEditDrawer}>
              <GridCloseIcon />
            </IconButton>
          </Box>
          <UserAddEditForm
            onClose={handleCloseEditDrawer}
            refreshData={fetchInitialData}
            user={selectedUser}
          />
        </Drawer>
      </Container>

      <CommonDialog
        open={openDeleteConfirm}
        title="Delete Confirmation!"
        customClass="cmn-confirm-delete-icon"
        content="Are you sure you want to continue?"
        onConfirm={() => userToBeDelete && finalDeleteUser(userToBeDelete.id)}
        onCancel={handleCloseConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        titleClass={true}
        showCloseIcon={true}
      />
    </>
  );
};

export default UserManagementPage;
