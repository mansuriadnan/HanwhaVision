import React, { useRef, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useUser } from "../../context/UserContext";
import { GetUserProfileDetails, uploadUserProfileImageService } from "../../services/userService";
import { IProfileReferenceData, IUsers } from "../../interfaces/IUser";
// import { GetUserProfileDetails, uploadUserProfileImageService } from "../../services/userService";
// import { IProfileReferenceData, IUsers } from "../../interfaces/IGetAllUsers";

const UserProfileDetails = () => {
  const { user, setUser, referenceData, setReferenceData } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredUserRoles = referenceData?.roleIds
    .filter((role) => user?.roleIds.includes(role.value))
    .map((role) => role.label);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const preview = URL.createObjectURL(file);
      await uploadFile(file, preview); // Automatically upload after file selection
    }
  };

  const uploadFile = async (file: File, preview: string) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await uploadUserProfileImageService(formData);
      if (typeof response !== "string" && response?.isSuccess) {
        const userProfileDetails: any = await GetUserProfileDetails();

        if (userProfileDetails) {
          const userData = userProfileDetails.data as IUsers;
          const referenceData = userProfileDetails.referenceData as IProfileReferenceData;

          setUser(userData);
          setReferenceData(referenceData);

          localStorage.setItem("userProfile", JSON.stringify(userData));
          localStorage.setItem("userProfileReferenceData", JSON.stringify(referenceData));
        }
      }
    } catch (error) {
      console.error(`Failed to upload the file. Please try again.`, "error");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  return (
    // <Box component="section" sx={{ p: 2, border: '1px dashed grey' }}>
    //   This Box renders as an HTML section element.
    // </Box>
    <Box className="profile-page-main">
      {/* <Card> */}
        <Box className="profile-header">
          <img src="/images/Vision_Insight_Profile_Page_Logo.svg" alt="Logo" width={"25px"} height={"25px"} />
        </Box>
        <Box className="profile-content">
          <CardContent sx={{ backgroundColor: "white" }}>
            <Box className="profile-avtar-details">
              <Box className="profile-avtar-wraper">
                <Avatar src={`${user?.profileImage}` || "/images/Super_Admin_User_Profile_Image.png"} className="profile-avtar" />
                {/* <Avatar src={"/images/Super_Admin_User_Profile_Image.png"} className="profile-avtar" /> */}
                <Tooltip title="Edit Profile">
                  <IconButton onClick={handleIconClick}>
                    <img
                      src={"/images/profile_edit.svg"}
                      alt="profileEditIcon"
                      width={2}
                      height={2}
                    />
                  </IconButton>
                </Tooltip>
              </Box>


              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <Typography variant="h6">
                {`${user?.firstname} ${user?.lastname}`}
              </Typography>
            </Box>
            <Box className="profile-detail-wrapper">
              <Box className="profile-details-repeat">
                <Typography variant="body2" color="textSecondary">
                  User Name
                </Typography>
                <Typography variant="h6">{user?.username}</Typography>
                {/* <Typography variant="h6"></Typography> */}
              </Box>
              <Box className="profile-details-repeat">
                <Typography variant="body2" color="textSecondary">
                  Email Address
                </Typography>
                <Typography variant="h6">{user?.email}</Typography>
                {/* <Typography variant="h6"></Typography> */}
              </Box>
            </Box>
            <Box className="profile-roles">
              <Typography variant="body2" color="textSecondary">
                Roles
              </Typography>
              <Box className="profile-roles-bottom">
                {filteredUserRoles?.map((userRole, index) => (
                  <Chip key={index} label={userRole} />
                ))}
              </Box>
            </Box>
          </CardContent>
        </Box>
      {/* </Card> */}
    </Box>
  );
};

export {UserProfileDetails};