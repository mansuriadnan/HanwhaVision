import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  // Select,
  // MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  // Button,
  // FormControl,
  // InputLabel,
  // SelectChangeEvent,
} from "@mui/material";
import {
  GetAllRolePermission,
  GetAllRoleService,
  SaveRolePermissionService,
} from "../../services/roleService";
// import { IRoleScreenMapping } from "../../interfaces/IRoleScreenMapping";
import { IRole } from "../../interfaces/IRole";
import { ILookup } from "../../interfaces/ILookup";
import { RolePermissionLastResponse } from "../../interfaces/IRolePermission";
// import { useLocation } from "react-router-dom";
// import { usePermissions } from "../../context/PermissionsContext";
// import { filterByScreenName } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";
import { useForm } from "react-hook-form";
import { CustomButton, CustomSelect } from "../../components/index";
import { HasPermission } from "../../utils/screenAccessUtils";

export const RolePermissionsManagement: React.FC = () => {
  // Initial state for roles and permissions
  // const [roles, setRoles] = useState<IRole[]>([]);
  const [roleList, setroleList] = useState<ILookup[]>([]);
  // const [selectedRole, setSelectedRole] = useState<string>("");
  const [permissions1, setPermissions1] = useState<
    RolePermissionLastResponse[]
  >([]);
  // const [permission, setPermission] = useState<IRoleScreenMapping[]>([]);
  const [isOpenPermissions, setIsOpenPermissions] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    rolename?: string;
    permission?: string;
  }>({});

  // const { permissions }: { permissions: any[] } = usePermissions();
  // const location = useLocation();
  // const label = location.state?.label;
  // const [filteredChildren, setFilteredChildren] = useState<any[]>([]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    // formState: { errors },
  } = useForm({
    defaultValues: {
      selectedRole: "",
    },
  });

  const selectedRoleId = watch("selectedRole");

  useEffect(() => {
    const GetAllRole = async () => {
      try {
        const response = await GetAllRoleService();
        const temproledata = response.data as IRole[];
        const roleData = temproledata?.map((item) => ({
          title: item.roleName,
          id: item.id,
        }));
        setroleList(roleData as ILookup[]);
      } catch (err: any) {
      } finally {
      }
    };
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

  useEffect(() => {
    if (selectedRoleId !== null && selectedRoleId !== "") {
      fetchData();
    }
  }, [selectedRoleId]);

  const fetchData = async () => {
    try {
      const response = await GetAllRolePermission(selectedRoleId);
      if (response != null) {
        const { data, referenceData } = response;

        if (
          referenceData &&
          "screensMapping" in referenceData &&
          Array.isArray(referenceData.screensMapping)
        ) {
          const screensMapping = referenceData.screensMapping;

          // Map the data to construct permissions
          const mappedPermissions: RolePermissionLastResponse[] = data
            .map((item: any): RolePermissionLastResponse => {
              const matchingScreen = screensMapping.find(
                (screen) => screen.value === item.id
              );

              return {
                id: item.id,
                screenName: item.screenName,
                order: item.order,
                // isParent: item.isParent,
                accessAllowed: matchingScreen?.label || false,
                parentsScreenId: item?.parentsScreenId || null,
                screenId: matchingScreen?.value || null,
              };
            })
            .sort((a, b) => a.order - b.order);

          setIsOpenPermissions(true);
          setPermissions1(mappedPermissions);
          // setPermission(data);
        }
      }
    } catch (err: any) {
      console.error("Error fetching permissions:", err);
    }
  };

  const handlePermissionToggle = (id: string) => {
    setPermissions1((prevPermissions) => {
      const updatedPermissions = prevPermissions.map((perm) =>
        perm.id === id ? { ...perm, accessAllowed: !perm.accessAllowed } : perm
      );

      const toggledPermission = updatedPermissions.find(
        (perm) => perm.id === id
      );

      if (toggledPermission) {
        if (toggledPermission.parentsScreenId === null) {
          updatedPermissions.forEach((perm) => {
            if (perm.parentsScreenId === toggledPermission.id) {
              perm.accessAllowed = toggledPermission.accessAllowed;
            }
          });
        } else {
          const parentPermission = updatedPermissions.find(
            (perm) =>
              perm.parentsScreenId === null &&
              perm.id === toggledPermission.parentsScreenId
          );

          if (parentPermission) {
            const siblings = updatedPermissions.filter(
              (perm) =>
                perm.parentsScreenId !== null &&
                perm.parentsScreenId === toggledPermission.parentsScreenId
            );

            parentPermission.accessAllowed = siblings.some(
              (sibling) => sibling.accessAllowed
            );
          }
        }
      }

      return updatedPermissions;
    });
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    const hasSelectedPermission = permissions1.some(
      (perm) => perm.accessAllowed
    );
    // if (!selectedRole) {
    //   newErrors.rolename = "Please select a role.";
    // }

    if (!hasSelectedPermission) {
      newErrors.permission = "At least one permission must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (data) => {
    if (validateForm()) {
      const mappingsToSave = permissions1
        //.filter((perm) => !perm.screen_Master.isParent) // Only include child permissions
        .map((perm) => ({
          id: perm.id,
          roleId: data.selectedRole,
          screenId: perm?.screenId || perm.id,
          accessAllowed: perm.accessAllowed,
        }));
      const res: any = await SaveRolePermissionService(mappingsToSave);
      if (res != null && res?.isSuccess) {
        setIsOpenPermissions(true);
      }
    }
  };

  // const filteredEdit = filterByScreenName(
  //   filteredChildren,
  //   LABELS.Can_Add_Or_Update_Permission
  // );

  return (
    <Box className="permissions-details-main">
      <Box className="permission-detail-wrapper">
      <Box component="form">
        <Typography variant="h5" gutterBottom>
          Permissions Details
        </Typography>

        <CustomSelect
          name="selectedRole"
          variant="filled"
          control={control}
          //label="Select Roles"
          label={<label>Select Roles<span style={{color: "#ff6a00"}}>*</span></label>}
          options={roleList}
          rules={{ required: "Role is required" }}
          hasChip={false}
        />

        {/* <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Roles</InputLabel>
        <Select
          value={selectedRole}
          label="Select Role"
          // onChange={handleRoleChange}
          error={!!errors.rolename}
        >
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.roleName}
            </MenuItem>
          ))}
        </Select>
        {errors.rolename && (
          <Typography variant="caption" color="error">
            {errors.rolename}
          </Typography>
        )}
      </FormControl> */}
        {/* Permissions Table */}
        {isOpenPermissions && (
          <TableContainer className="permissions-detail-table" component={Paper} >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F3F3F3" }}>
                  <TableCell className="permissionTableHeader">Permissions</TableCell>
                  <TableCell className="permissionTableHeader">Is Allowed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permissions1
                  .filter((permission) => permission.parentsScreenId === null) // Filter only parent permissions
                  .map((parentPermission) => {
                    // Find all child permissions for the current parent
                    const childPermissions = permissions1.filter(
                      (childPermission) =>
                        childPermission.parentsScreenId === parentPermission.id
                    );

                    return (
                      <React.Fragment key={parentPermission.id}>
                        {/* Render the parent permission */}
                        <TableRow className="parent-permission-row">
                          <TableCell className="parent-permission-name">
                            {parentPermission.screenName}
                          </TableCell>
                          <TableCell className="parent-permission-name">
                            <Checkbox
                              checked={parentPermission.accessAllowed}
                              onChange={() =>
                                handlePermissionToggle(parentPermission.id)
                              }
                              disabled={!HasPermission(LABELS.Can_View_Permission)}
                              sx={{
                                "&.Mui-checked": {
                                  color: !HasPermission(LABELS.Can_View_Permission) ? "gray" : "#ff7b00",
                                },
                              }}
                            />
                          </TableCell>
                        </TableRow>

                        {/* <Box
                          sx={{
                            border: "1px solid #E0E0E0",  // Creates a border around the section
                            borderTop: "none",            // Removes top border so it connects with the parent
                            borderRadius: "0 0 12px 12px", // Rounded corners at the bottom
                            paddingBottom: 2,              // Adds space after the last child
                          }}
                        > */}
                        {/* Render all child permissions */}
                        {childPermissions.map((childPermission, index) => (
                          <TableRow
                           className={`permission-row ${index === childPermissions.length - 1 ? "last-row" : ""}`}
                            key={childPermission.id}
                            sx={{
                              borderRight: "1px solid #CACACA",
                              borderLeft: "1px solid #CACACA",

                              "&:hover": { backgroundColor: "#f9f9f9" },
                              borderRadius:
                                index === childPermissions.length - 1 ? 0 : "10px",

                            }}

                          >
                            <TableCell className="permission-name">
                              {childPermission.screenName}
                            </TableCell>
                            <TableCell className="permission-name">
                              <Checkbox
                                checked={childPermission.accessAllowed}
                                onChange={() =>
                                  handlePermissionToggle(childPermission.id)
                                }
                                disabled={!HasPermission(LABELS.Can_View_Permission)}
                                sx={{
                                  "&.Mui-checked": {
                                    color:  !HasPermission(LABELS.Can_View_Permission) ? "gray" : "#ff7b00",
                                  },
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* </Box> */}
                        <TableRow sx={{ borderTop: "1px solid #CACACA", mb: '50px' }}>
                          <TableCell colSpan={2} sx={{ height: "10px", }} />
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {/* Validation Error Message */}
        {errors.permission && (
          <Typography color="error" variant="body2" sx={{ mt: 2, mb: 2 }}>
            {errors.permission}
          </Typography>
        )}
        {/* Save Button */}
        {/* <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        sx={{ mt: 3 }}
      >
        Save Permissions
      </Button> */}
        <CustomButton
          onClick={handleSubmit(handleSave)}
          fullWidth
          customStyles={{ mt: 3, mb: 2 }}
         disabled={!HasPermission(LABELS.Can_View_Permission)}
        >
          Save the changes
        </CustomButton>
      </Box>
      </Box>
    </Box>
  );
};
