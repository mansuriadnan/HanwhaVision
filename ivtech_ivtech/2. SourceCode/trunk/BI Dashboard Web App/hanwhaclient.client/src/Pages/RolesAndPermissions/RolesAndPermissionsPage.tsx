import React, { useEffect, useMemo, useState } from "react";
import {
  AddRoleService,
  DeleteRole,
  GetAllRoleService,
} from "../../services/roleService";
import { IRole } from "../../interfaces/IRolePermission";
// import {
//   CommonDialog,
//   RoleAndPermissionsManagement,
// } from "../../components/index";
import { RoleAndPermissionsManagement } from "../../components/RolesAndPermissions/RoleAndPermissionsManagement";
import { CommonDialog } from "../../components/Reusable/CommonDialog";

import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { MoreVert, Search } from "@mui/icons-material";
import { HasPermission } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";
import { useForm } from "react-hook-form";
import { useThemeContext } from "../../context/ThemeContext";

const RolesAndPermissionsPage: React.FC = () => {
  //State Vairables

  const [openRoleDeleteConfirm, setOpenRoleDeleteConfirm] =
    useState<boolean>(false);
  const [roleToBeDelete, setRoleToBeDelete] = useState<string>("");
  const [roleName, setRoleName] = useState<string>("");
  const [roleEditItem, setRoleEditItem] = useState<IRole | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [menuAnchor, setMenuAnchor] = useState<{
    anchorEl: HTMLElement | null;
    item: any | null;
  }>({
    anchorEl: null,
    item: null,
  });

  const open = Boolean(menuAnchor.anchorEl);

  const [roles, setRoles] = useState<IRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [error, setError] = useState(false);
  const [editError, setEditError] = useState(false);
  const { theme } = useThemeContext();

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
  } = useForm({
    defaultValues: {
      roleName: "",
    },
  });

  // useEffects methods

  useEffect(() => {
    GetAllRole();
    return () => setRoles([]);
  }, []);

  // methods

  const GetAllRole = async () => {
    try {
      const data = await GetAllRoleService();
      const roles = data as unknown as IRole[];
      setRoles(roles);
      if (roles.length > 0) {
        setSelectedRoleId(roles[0].id); // assuming 'id' is the identifier
      }
    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    }
  };

  const handleSelectRole = (roleId: string) => {
    setSelectedRoleId(roleId);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredRoles = useMemo(
    () => {
      if (searchTerm?.length < 3) return roles;
      return roles.filter((role) =>
        role.roleName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [roles, searchTerm]
  );

  const handleClose = () => {
    setMenuAnchor({ anchorEl: null, item: null });
  };

  const AddRole = async () => {
    if (!roleEditItem && roleName.trim().length === 0) {
      setError(true);
      return;
    } else {
      setError(false);
    }
    if (roleEditItem && roleEditItem.roleName == "") {
      setEditError(true);
      return;
    } else {
      setEditError(false);
    }

    try {
      let param;

      if (roleEditItem != undefined) {
        param = roleEditItem;
      } else {
        param = {
          roleName: roleName.trim(),
        };
      }

      const result: any = await AddRoleService(param as IRole);
      if (result?.isSuccess) {
        await GetAllRole();
        setRoleName("");
        setRoleEditItem(undefined);
        setSearchTerm("");
      }
    } catch (error) {
      console.error("Submission Error:", error);
    } finally {

    }
  };

  const handleDeleteFloor = async (id: string) => {
    try {
      const deleteData = await DeleteRole(id);

      if (deleteData?.isSuccess) {
        await GetAllRole();
      }
    } catch (err: any) {
      console.error("Error deleting role:", err);
    } finally {
      setOpenRoleDeleteConfirm(false);
      handleClose();
      setSearchTerm("");
    }
  };

  return (
    <div className="floor-plans-zones">
      <Box className="floor-plans-zones-left">
        <div className="search-plans-and-jones role-search-plans-and-jones">
          <TextField
            placeholder="Search by role name"
            fullWidth
            onChange={handleSearch}
            variant="outlined"
            value={searchTerm}
            slotProps={{
              input: {
                endAdornment: <Search />,
              },
            }}
            sx={{
              backgroundColor: "white",
              "& fieldset": { border: "none" },
              "& .MuiOutlinedInput-root": {
                borderRadius: "50px",
                backgroundColor: "white",
                paddingRight: "8px",
                border: "1px solid #ddd",
              },
              "& .MuiOutlinedInput-input": {
                padding: "10px 20px",
              },
            }}
          />

          <List>
            {filteredRoles?.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  color: "gray",
                  padding: "10px",
                  fontSize: "16px",
                }}
              >
                No Roles Found
              </Box>
            ) : (
              filteredRoles?.map((item) => (
                <React.Fragment key={item.id}>
                  {roleEditItem?.id === item.id ? (
                    <li
                      style={{
                        backgroundImage:
                          selectedRoleId === item.id
                            ? `url('images/background.svg'), linear-gradient(91.75deg, #FFCD7D -8.36%, #FF8A01 32.16%, #FF8A01 77.32%, #FFCD7D 88.72%, #FF8A01 101.13%)`
                            : `url('images/background.svg')`,
                        bgcolor: "transparent",
                        color:
                          selectedRoleId === item.id ? "#ffffff" : "#090909",
                        border: "1px solid #ddd",
                      }}
                    >
                      <Box
                        key={item.id}
                      >
                        <TextField
                          variant="standard"
                          size="small"
                          value={
                            roleEditItem != undefined
                              ? roleEditItem?.roleName
                              : item.roleName
                          }
                          onChange={(e) => {
                            setRoleEditItem({
                              ...item,
                              id: item.id,
                              roleName: e.target.value,
                            });
                            if (editError && e.target.value.length > 0) {
                              setEditError(false)
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleClose();
                              AddRole();
                            }
                          }}
                          onBlur={() => {
                            AddRole();
                          }}
                          autoFocus
                          slotProps={{
                            input: {
                              disableUnderline: true,
                            },
                          }}
                          sx={{
                            fontSize: "14px",                            
                            "& input": {
                              padding: "2px 0px", // vertical spacing only                             
                            },
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            px: 0.5,
                            py: 0.5,
                            display: "inline-block",
                            "&:hover": {
                              borderColor: "#999",
                            },
                            "&.focused": {
                              borderColor: "#ff8c00",
                            }, 
                          }}

                        />
                        {editError && (
                          <Typography
                            variant="caption"
                            sx={{ color: "red !important", mt: "4px", ml: "0px", fontSize: "12px" }}
                          >
                            Role Name is required
                          </Typography>
                        )}
                      </Box>
                    </li>
                  ) : (
                    <ListItem
                      key={item.id}
                      sx={{
                        backgroundImage:
                          selectedRoleId === item.id
                            ? `url('images/background.svg'), linear-gradient(91.75deg, #FFCD7D -8.36%, #FF8A01 32.16%, #FF8A01 77.32%, #FFCD7D 88.72%, #FF8A01 101.13%)`
                            : `url('images/background.svg')`,
                        bgcolor: "transparent",
                        color:
                          selectedRoleId === item.id ? "#ffffff" : "#090909",
                      }}
                      onClick={() => handleSelectRole(item.id)}
                    >
                      {item.roleName}
                      {(HasPermission(LABELS.Can_Add_Or_Update_Role) ||
                        HasPermission(LABELS.Can_Delete_Role)) && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuAnchor({ anchorEl: e.currentTarget, item });
                            }}
                          >
                            <MoreVert />
                          </IconButton>
                        )}
                    </ListItem>
                  )}

                  {menuAnchor?.item?.id === item.id &&
                    (HasPermission(LABELS.Can_Add_Or_Update_Role) ||
                      HasPermission(LABELS.Can_Delete_Role)) && (
                      <Menu
                        anchorEl={menuAnchor.anchorEl}
                        open={open}
                        onClose={handleClose}
                        PaperProps={{
                          elevation: 3,
                          sx: {
                            borderRadius: 2,
                            pl: 1,
                            pr: 1,
                          },
                        }}
                      >
                        {HasPermission(LABELS.Can_Add_Or_Update_Role) && (
                          <MenuItem
                            onClick={() => {
                              setRoleEditItem(item);
                              handleClose();
                            }}
                          >
                            <IconButton>
                              <img
                                src={"/images/edit.svg"}
                                alt="edit"
                                width={20}
                                height={20}
                              />
                            </IconButton>
                            <ListItemText primary="Edit" />
                          </MenuItem>
                        )}

                        {HasPermission(LABELS.Can_Delete_Role) && (
                          <MenuItem
                            onClick={() => {
                              setRoleToBeDelete(item.id);
                              setOpenRoleDeleteConfirm(true);
                            }}
                          >
                            <IconButton>
                              <img
                                src={"/images/delete_gray.svg"}
                                alt="delete"
                                width={20}
                                height={20}
                              />
                            </IconButton>
                            <ListItemText primary="Delete" />
                          </MenuItem>
                        )}
                      </Menu>
                    )}
                </React.Fragment>
              ))
            )}
          </List>

          {HasPermission(LABELS.Can_Add_Or_Update_Role) && (
            <><Box
              sx={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #ddd",
                borderRadius: "50px",
                mt: "auto",
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter role name"
                value={roleName}
                onChange={(e) => 
                  {
                    setRoleName(e.target.value)
                    if(error && e.target.value.length > 0){
                      setError(false)
                    }
                  }
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); 
                    AddRole();
                  }
                }}
                slotProps={{
                  htmlInput: { maxLength: 30 },
                }}
                sx={{
                  "& fieldset": { border: "none" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "50px",
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "10px 20px",
                  },
                }}
              />
              <Button
                variant="contained"
                sx={{
                  borderRadius: "50px",
                  backgroundColor: "#ff8c00",
                  color: "#fff",
                  minWidth: "80px",
                  height: "40px",
                  textTransform: "none",
                }}
                onClick={() => {
                  AddRole();
                }}
              >
                + Add
              </Button>
            </Box>
              {error ? (
                <Typography
                  variant="body2"
                  sx={{ color: "red", fontSize: "13px", mt: 0.5, ml: 2 }}
                >
                  Role Name is required
                </Typography>
              ) : ""}
            </>
          )}
        </div>
      </Box>

      <CommonDialog
        open={openRoleDeleteConfirm}
        title="Delete Confirmation!"
        customClass="cmn-confirm-delete-icon"
        content="Are you sure you want to continue?"
        onConfirm={() => roleToBeDelete && handleDeleteFloor(roleToBeDelete)}
        onCancel={() => setOpenRoleDeleteConfirm(false)}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        titleClass={true}
      />
      <div className="roles-permissions-tab roles-permissions-no-data">
        {selectedRoleId ? (
          <RoleAndPermissionsManagement selectedRoleId={selectedRoleId} />
        ) : (
          // <Typography mt={2} ml={6} color="textSecondary">
          //   Please select a role to manage permissions.
          // </Typography>

            <Box className="no-data-douns"
            // sx={{height:'450px'}}
              >
                <Box sx={{ width: 300, justifyItems: "center", flex: 1, }}>
                  <img src={theme === 'light' ? '/images/noData.gif' : '/images/dark-theme/noData.gif'} alt="Animated GIF" width="100" height="100" />
                  <Typography
                    sx={{ FontWeight: 600, fontSize: 24, color: "#090909" }}
                  >
                    No data found
                  </Typography>
                  <Typography
                    sx={{ FontWeight: 400, fontSize: "14px !important", color: "#212121" }}
                  >
                   No data available to display Permission. Please add a new Role by clicking the <strong>Add</strong> button.
                  </Typography>
                </Box>
              </Box>
        )}
      </div>
    </div>
  );
};

export default RolesAndPermissionsPage;
