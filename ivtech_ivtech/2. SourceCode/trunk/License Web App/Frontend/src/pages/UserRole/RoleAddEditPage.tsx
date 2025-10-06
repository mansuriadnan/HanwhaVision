import React, { useEffect } from "react";
import { Button, Container, Box, Grid } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { IRole } from "../../interfaces/IRole";
import { AddRoleService, UpdateRoleService } from "../../services/roleService";
import { useForm } from "react-hook-form";
import { CustomButton, CustomTextField } from "../../components";
import { REGEX } from "../../utils/constants";

interface RolesAddEditPageProps {
  onClose: () => void;
  refreshData: () => void;
  role?: any;
}

interface RoleFormInputs {
  roleName: string;
  description: string;
}

const RoleAddEditPage: React.FC<RolesAddEditPageProps> = ({
  onClose,
  refreshData,
  role,
}) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RoleFormInputs>({
    defaultValues: {
      roleName: "",
      description: "",
    },
  });

  const isEditMode = role !== null && role !== undefined;

  useEffect(() => {
    if (isEditMode && role) {
      setValue("roleName", role.roleName);
      setValue("description", role.description);
    }
  }, [isEditMode, role]);

  const onSubmit = async (data: RoleFormInputs) => {
    const roleData: IRole = {
      roleName: data.roleName,
      description: data.description,
      ...(isEditMode && role.id && { id: role.id }),
    };

    try {

      if (isEditMode && role?.id) {
        const response: any = await UpdateRoleService(roleData);
        if (response?.isSuccess) {
          onClose();
          refreshData();
        }
      } else {
        const response: any = await AddRoleService(roleData);
        if (response?.isSuccess) {
          onClose();
          refreshData();
        }
      }

    } catch (err: any) {
      console.error("Error saving role:", err.message);
    }
  };

  return (
    // <Box className="comn-pop-up-design">
    //   <Box >
    <Box component="form" noValidate className="comn-pop-up-design">
      <CustomTextField
        name="roleName"
        control={control}
        label="Role"
        rules={{
          required: "Role is required",
          pattern: {
            value: REGEX.Role_Regex,
            message: "Enter a valid Role",
          },
        }}
        fullWidth={true}
        required
        placeholder="Enter role"
      />

      <CustomTextField
        name="description"
        control={control}
        label="Description"
        multiline={true}
        rows={4}
        fullWidth={true}
        placeholder="Enter description"
      />

      <Grid
        item
        xs={12}
        container
        justifyContent="center"
        alignItems="center"
      >
        <CustomButton
          onClick={handleSubmit(onSubmit)}
          className="pop-bottom-cmn-btn"
        >
          {isEditMode ? "Update Role" : "Add Role"}
        </CustomButton>
      </Grid>
    </Box>
    //   </Box>
    // </Box>
  );
};

export { RoleAddEditPage };
