import React, { useState, useEffect, useRef } from "react";
import { Box, Grid } from "@mui/material";
import { AddUserService, UpdateUserService } from "../../services/userService";
import { GetAllRoleService } from "../../services/roleService";
import { ILookup } from "../../interfaces/ILookup";
import { COMMON_CONSTANTS, REGEX } from "../../utils/constants";
import { SubmitHandler, useForm } from "react-hook-form";
import { IUsers } from "../../interfaces/IManageUsers";
import { IRole } from "../../interfaces/IRolePermission";
import { CustomButton } from "../Reusable/CustomButton";
import { CustomMultiSelect } from "../Reusable/CustomMultiSelect";
import { CustomTextField } from "../Reusable/CustomTextField";

interface UserAddEditFormProps {
  onClose: () => void;
  user?: any;
  refreshData: () => void;
}

interface UserFormInputs {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  roleIds: string[];
  password: string;
  confirmPassword: string;
}

const UserAddEditForm: React.FC<UserAddEditFormProps> = ({
  onClose,
  user,
  refreshData,
}) => {
  const isEditMode = user !== null && user !== undefined;
  const [Rolelist, setRolelist] = useState<ILookup[]>([]);

  const {
    control,
    setValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserFormInputs>({
    defaultValues: {
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      roleIds: [],
      password: "",
      confirmPassword: "",
    },
  });

  const firstNameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (firstNameRef.current) {
      firstNameRef.current.focus();
    }
  }, []);

  const password = watch("password");

  useEffect(() => {
    const initializeData = async () => {
      try {
        const response: any = await GetAllRoleService();
        const temprolelist = response as IRole[];
        const roleData = temprolelist?.map((item) => ({
          title: item.roleName,
          id: item.id,
        }));
        setRolelist(roleData as ILookup[]);
        if (isEditMode) {
          const initialUser = user;
          setValue("firstName", initialUser?.firstname || "");
          setValue("lastName", initialUser?.lastname || "");
          setValue("userName", initialUser?.username || "");
          setValue("email", initialUser?.email || "");
          setValue(
            "roleIds",
            Array.isArray(initialUser.roleIds) ? initialUser.roleIds : []
          );
          setValue("password", "");
          setValue("confirmPassword", "");
        }
      } catch (err) {
        console.error(err);
      }
    };

    initializeData();
  }, [isEditMode, user]);

  const handleAddUser: SubmitHandler<UserFormInputs> = (data) => {
    const userData: Omit<IUsers, "createdDateTime" | "lastUpdatedDateTime"> = {
      firstname: data.firstName,
      lastname: data.lastName,
      username: data.userName,
      email: data.email,
      roleIds: data.roleIds,
      password: data.password,
      ...(isEditMode && user?.id && { id: user.id }),
    };

    if (isEditMode) {
      const Updateuser = async () => {
        try {
          const data = await UpdateUserService(userData);
          if (typeof data === 'object' && data !== null && 'isSuccess' in data && data.isSuccess) {
            reset();
            onClose();
            refreshData();
          }
        } catch (err: any) {
          console.error(err);
        }
      };
      Updateuser();
    } else {
      const Adduser = async () => {
        try {
          const data = await AddUserService(userData);
          if (typeof data === 'object' && data !== null && 'isSuccess' in data && data.isSuccess) {
            reset();
            onClose();
            refreshData();
          }

        } catch (err: any) {
          console.error(err);
        }
      };
      Adduser();
    }
  };

  return (
    <div className="cmn-pop-form">
      <div className="cmn-pop-form-wrapper">
        <Box
          component="form"
          onSubmit={handleSubmit(handleAddUser)}
          noValidate
        >
          <Grid className="cmn-pop-form-inner">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <CustomTextField
                  name="firstName"
                  label={<span>First Name <span className="star-error">*</span></span>}
                  control={control}
                  rules={{
                    required: "First Name is required.",
                    pattern: {
                      value: REGEX.Name_Regex,
                      message: "Enter a valid First Name",
                    },
                    maxLength: {
                      value: COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH,
                      message: `First name cannot exceed ${COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH} characters`,
                    },
                  }}
                  placeholder="Enter first name"
                  required
                  fullWidth
                  // inputProps={{
                  //   maxLength: COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH,
                  // }}
                  inputRef={firstNameRef}
                />

              </Grid>

              <Grid item xs={12} md={6}>
                <CustomTextField
                  name="lastName"
                  label={<span>Last Name <span className="star-error">*</span></span>}
                  control={control}
                  rules={{
                    required: "Last Name is required.",
                    pattern: {
                      value: REGEX.Name_Regex,
                      message: "Enter a valid Last Name",
                    },
                    maxLength: {
                      value: COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH,
                      message: `Last name cannot exceed ${COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH} characters`,
                    },
                  }}
                  placeholder="Enter last name"
                  required
                  fullWidth
                // inputProps={{
                //   maxLength: COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH,
                // }}
                />
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomTextField
                name="userName"
                label={<span>Username <span className="star-error">*</span></span>}
                control={control}
                rules={{
                  required: "Username is required.",
                  pattern: {
                    value: REGEX.UserName_Regex,
                    message: "Enter a valid Username",
                  },
                  maxLength: {
                    value: COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH,
                    message: `Username cannot exceed ${COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH} characters`,
                  },
                }}
                placeholder="Enter username"
                required
                fullWidth
              // inputProps={{
              //   maxLength: COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH,
              // }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomTextField
                name="email"
                label={<span>Email Address <span className="star-error">*</span></span>}
                control={control}
                rules={{
                  required: "Email Address is required",
                  pattern: {
                    value: REGEX.Email_Regex,
                    message: "Enter a valid Email Address",
                  },
                  maxLength: {
                    value: COMMON_CONSTANTS.MAX_EMAIL_FIELD_LENGTH,
                    message: `Email address cannot exceed ${COMMON_CONSTANTS.MAX_EMAIL_FIELD_LENGTH} characters`,
                  },
                }}
                placeholder="Enter email address"
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomTextField
                name="password"
                label={isEditMode ? "Password" : <span>Password <span className="star-error">*</span></span>}
                control={control}
                type={"password"}
                rules={{
                  ...(isEditMode
                    ? {
                      pattern: {
                        value: REGEX.Password_Regex,
                        message: "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character (excluding *)",
                      },
                      maxLength: {
                        value: COMMON_CONSTANTS.MAX_PASSWORD_FIELD_LENGTH,
                        message: `Password cannot exceed ${COMMON_CONSTANTS.MAX_PASSWORD_FIELD_LENGTH} characters`,
                      },
                    }
                    : {
                      required: "Password is required",
                      pattern: {
                        value: REGEX.Password_Regex,
                        message: "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character (excluding *)",
                      },
                      maxLength: {
                        value: COMMON_CONSTANTS.MAX_PASSWORD_FIELD_LENGTH,
                        message: `Password cannot exceed ${COMMON_CONSTANTS.MAX_PASSWORD_FIELD_LENGTH} characters`,
                      },
                    }),
                }}
                placeholder="Enter password"
                required={!isEditMode}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomTextField
                name="confirmPassword"
                label={isEditMode ? "Confirm Password" : <span>Confirm Password <span className="star-error">*</span></span>}
                control={control}
                type={"password"}
                rules={{
                  ...(isEditMode
                    ? {
                      validate: (value: string) =>
                        value === password ||
                        "Password and confirm password must match",
                    }
                    : {
                      required: "Confirm Password is required",
                      validate: (value: string) =>
                        value === password ||
                        "Password and confirm password must match",
                    }),
                }}
                placeholder="Enter confirm password"
                required={!isEditMode}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} className="roles-user">
              <CustomMultiSelect
                name="roleIds"
                control={control}
                label={<span>Roles <span className="star-error">*</span></span>}
                options={Rolelist}
                rules={{ required: "At least one role must be selected" }}
                required
                placeholder="Select role(s)"
              />
            </Grid>

            <CustomButton fullWidth className="common-btn-design">
              {isEditMode ? "Save" : "Add"}
            </CustomButton>

          </Grid>
        </Box>
      </div>
    </div>
  );
};

export { UserAddEditForm };
