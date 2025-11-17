import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// import {
//   CommonDialog,
//   NotificationDeatil,
//   UserPreferences,
//   UserProfileDetails,
// } from "../index";



import {
  Drawer,
  Typography,
} from "@mui/material";
import { ISite } from "../../interfaces/IMultiSite";
import { useUser } from "../../context/UserContext";
import { useSettingsContext } from "../../context/SettingContext";
import { onReceiveMessage, startSignalRConnection } from '../../utils/signalRService';
import { INotification } from "../../interfaces/Inotifications";
import { GetUserNotificationCount } from "../../services/notificationServices";
import { HasPermission, useHasPermission } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";
import { formatDateToConfiguredTimezone } from "../../utils/formatDateToConfiguredTimezone";
import { formatDate, formatDateToCustomFormat } from "../../utils/dateUtils";
import { CommonDialog } from "../Reusable/CommonDialog";
import { NotificationDeatil } from "../Layout/NotificationDeatil";
import { UserPreferences } from "../Users/UserPreferences";
import { UserProfileDetails } from "../Users/UserProfileDetails";

const Header: React.FC = () => {
  const location = useLocation();
  const { user } = useUser();
  const navigate = useNavigate();
  const { handleLogout } = useAuth();
  const { settings } = useSettingsContext();

  const sidebarMenuName = location.state?.sidebarMenuName || null;
  const screenName = location.state?.screenName || null;

  const [isOpen, setIsOpen] = useState(false);
  const [openLogoutConfirm, setOpenLogoutConfirm] = useState<boolean>(false);
  const [openProfileDialog, setOpenProfileDialog] = useState<boolean>(false);
  const [openPreferencesDialog, setOpenPreferencesDialog] =
    useState<boolean>(false);
  const [openChangePasswordDialog, setOpenChangePasswordDialog] =
    useState<boolean>(false);
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isBouncing, setIsBouncing] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const [currentTime, setCurrentTime] = useState("");
  const [selectedTimeZone, setSelectedTimeZone] = useState("");
  const canViewNotificationPermission = useHasPermission(LABELS.View_List_of_Notifications)
  // useEffect(() => {
  //   fetchInitialData();
  // }, []);

  // const fetchInitialData = async () => {
  //   try {
  //     const siteData: any = await GetAllSiteService();
  //     setSiteList(siteData.data as ISite[]);

  //     // console.log("siteData==>",siteData)
  //   } catch (err: any) {
  //     console.error("Error fetching initial data:", err);
  //   }
  // };

  useEffect(() => {
    const timeout = setTimeout(() => {
      onReceiveMessage("userNotification", handleSignalRMessage);
    }, 5000);

    const handleSignalRMessage = (data: any) => {
      try {
        const liveDataRaw = JSON.parse(data);
        const liveData = {
          notificationId: liveDataRaw.Id,
          title: liveDataRaw.Title,
          content: liveDataRaw.Content,
          isRead: liveDataRaw.IsRead,
          actionName: liveDataRaw.ActionName,
          actionParameter: liveDataRaw.ActionParameter,
          createdOn: liveDataRaw.CreatedOn || new Date().toISOString(),
        };

        if (!liveData.notificationId || !liveData.title || !liveData.content) {
          console.warn("Incomplete notification received:", liveData);
          return;
        }

        setNotifications((prev) => {
          const alreadyExists = prev.some(
            (n) => n.notificationId === liveData.notificationId
          );
          return alreadyExists ? prev : [liveData, ...prev];
        });

        setUnreadCount((prev) => prev + 1);
        setIsBouncing(true); // trigger animation

        // Optional: you can persist latest notification globally or via context
      } catch (e) {
        console.error("Error parsing live notification:", e);
      }
    };

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {

    const updateCurrentTime = () => {
      let configuredZoneLabel: any = null;
      

      const configuredTimeZoneDetails = localStorage.getItem("userProfileReferenceData");

      if (configuredTimeZoneDetails) {
        try {
          const parsedData = JSON.parse(configuredTimeZoneDetails);
          configuredZoneLabel = parsedData?.timeZone?.label ?? null;
        } catch (e) {
          console.warn("Error in format date func()", e);
        }
      }
      const userProfile = localStorage.getItem("userProfile");
      let timeFormat = "hh:mm A";
      if (userProfile) {
        const userPreferences = JSON.parse(userProfile).userPreferences;
        timeFormat = userPreferences?.timeFormat === "12h" ? "hh:mm A" : "HH:mm";
      }
      if (configuredZoneLabel?.timeZoneAbbr) {
        setSelectedTimeZone(configuredZoneLabel?.timeZoneAbbr);
      }
      let formattedCurrentTime = formatDateToCustomFormat(formatDateToConfiguredTimezone(new Date().toISOString()), timeFormat);
      setCurrentTime(formattedCurrentTime);
    };
    updateCurrentTime();
    const timer = setInterval(updateCurrentTime, 60 * 1000);
    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await GetUserNotificationCount();
      setUnreadCount(count as number);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

useEffect(() => {
  if (canViewNotificationPermission) {
    fetchUnreadCount();
  }
}, [canViewNotificationPermission, fetchUnreadCount]);

  const handleProfilePage = () => {
    setIsOpen(false);
    setOpenProfileDialog(true);
  };

  // Method to open Preferences Dialog
  const handlePreferences = () => {
    setIsOpen(false);
    setOpenPreferencesDialog(true);
  };

  const handleChangePassword = () => {
    setIsOpen(false);
    setOpenChangePasswordDialog(true);
  };

  const handleLogoutConfirm = () => {
    setIsOpen(false);
    setOpenLogoutConfirm(true);
  };

  const handleLogoutFromHeader = () => {
    setOpenLogoutConfirm(false);
    handleLogout();
    navigate("/");
  };

  const handleCloseConfirm = () => {
    setOpenLogoutConfirm(false);
  };

  const handleCloseProfileDialog = () => {
    setOpenProfileDialog(false);
  };

  const handleCloseChangePasswordDialog = () => {
    setOpenChangePasswordDialog(false);
  };

  // Method to close Preferences Dialog
  const handleClosePreferencesDialog = () => {
    setOpenPreferencesDialog(false);
  };

  const handleOpenNotificationDrawer = () => {
    setNotifications([]); // reset notifications
    setOpenNotificationDrawer(true);
  };

  const handleCloseNotificationDrawer = () => {
    setOpenNotificationDrawer(false);
  };

  return (
    <>
      <header className="header">
        <div className="header-wrapper">
          <div className="breadcrumbs">
            {/* {sidebarMenuName && screenName && (
              <>
                <span>{sidebarMenuName}</span> <span>{screenName}</span>
              </>
            )} */}
            {window.location.pathname === "/welcome" ? (
              <>
                <span>Dashboards</span> <span>Welcome to BI Dashboard</span>
              </>
            ) : (
              sidebarMenuName &&
              screenName && (
                <>
                  <span>{sidebarMenuName}</span> <span>{screenName}</span>
                </>
              )
            )}
          </div>
          <div className="header-logo">
            {settings?.logo ? (
              <a href="#">
                <img
                  src={settings.logo}
                  alt="logo"
                />
              </a>
            ) : null}
          </div>
          <div className="header-right">


            <Typography style={{ color: "#212121", fontSize: '14px' }}><span style={{ fontWeight: 700 }}>{currentTime}</span> {selectedTimeZone == "" ? "" : <span style={{ fontWeight: 600 }}>({selectedTimeZone})</span>}</Typography>
            {HasPermission(LABELS.View_List_of_Notifications) &&
              <div
                className="notifications"
                onClick={handleOpenNotificationDrawer}
              >
                <img
                  src="/images/bell.png"
                  alt="notification"
                  className={isBouncing ? 'bell-bounce' : ''}
                  onAnimationEnd={() => setIsBouncing(false)} // reset after animation
                />
                {/* {unreadCount > 0 && (
                <span className="notification-count">{unreadCount}</span>
              )} */}

                {unreadCount > 0 && (
                  <span className="notification-count">
                    {unreadCount > 999 ? '999+' : unreadCount}
                  </span>
                )}

              </div>
            }
            <div className="user-pro-wrapper">
              <div
                className="userProfileBox"
                onClick={() => setIsOpen(!isOpen)}
              >
                <img
                  src={
                    user?.profileImage ||
                    "/images/Super_Admin_User_Profile_Image.png"
                  }
                  className="useravatar"
                  alt="User Avatar"
                />
              </div>

              {isOpen && (
                <div className="userProfileDropdown" ref={dropdownRef}>
                  <div className="user-pro-name">
                    <p>
                      {user?.email}
                      {/* johndoe@email.com */}
                    </p>
                    <strong>
                      {user?.username ?? ""}
                      {/* +971-55-1234567 */}
                    </strong>
                  </div>

                  <ul>
                    <li
                      style={{ padding: "10px", cursor: "pointer" }}
                      onClick={handleProfilePage}
                    >
                      Profile
                    </li>
                    <li
                      style={{ padding: "10px", cursor: "pointer" }}
                      onClick={handlePreferences}
                    >
                      Preferences
                    </li>
                    <li
                      style={{ padding: "10px", cursor: "pointer" }}
                      // onClick={() => {
                      //   setIsOpen(false);
                      //   navigate("/changepassword", {
                      //     state: { screenName: LABELS.Change_Password },
                      //   });
                      // }}
                      onClick={handleChangePassword}
                    >
                      Change Password
                    </li>
                    <li
                      style={{ padding: "10px", cursor: "pointer" }}
                      onClick={handleLogoutConfirm}
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <CommonDialog
            open={openLogoutConfirm}
            title="Logout Confirmation"
            // content="Are you sure you want to do logout?"
            content={<p>Are you sure you want to do logout?</p>}
            onConfirm={handleLogoutFromHeader}
            onCancel={handleCloseConfirm}
            confirmText="Confirm"
            cancelText="Cancel"
            type="logout"
            customClass="logout-pop-main"
            titleClass={true}
          />

          {/* Profile Section Dialog */}
          <CommonDialog
            open={openProfileDialog}
            title="Profile"
            content={<UserProfileDetails />}
            onCancel={handleCloseProfileDialog}
            fullWidth={true}
            customClass="profile-pop-main"
          />

          {/* Change Password Dialog */}
          {/* <CommonDialog
        open={openChangePasswordDialog}
        title="Change Password"
        content={<ChangePasswordPage />}
        onCancel={handleCloseChangePasswordDialog}
        fullWidth={true}
      /> */}

          {/* Change Password Dialog */}
          <CommonDialog
            open={openChangePasswordDialog}
            title={"Password changes are restricted."}
            content={
              "Please contact your administrator to update your password."
            }
            confirmText="Okay"
            onCancel={handleCloseChangePasswordDialog}
            onConfirm={handleCloseChangePasswordDialog}
            type="contactAdministrator"
            customClass="forgot-pass"
            titleClass={true}
          />

          {/* Preferences Dialog Box*/}
          <CommonDialog
            open={openPreferencesDialog}
            title="Preferences"
            content={<UserPreferences onClose={handleClosePreferencesDialog} />}
            onCancel={handleClosePreferencesDialog}
            fullWidth={true}
            customClass="preferences-pop-main"
          />
        </div>
      </header>

      <Drawer
        anchor={"right"}
        open={openNotificationDrawer}
        onClose={() => {
          handleCloseNotificationDrawer();
        }}
        className="cmn-pop"
      >
        <NotificationDeatil
          onClose={handleCloseNotificationDrawer}
          unreadCount={unreadCount}
          setUnreadCount={setUnreadCount}
          triggerBellAnimation={() => setIsBouncing(true)}
          notifications={notifications}
          setNotifications={setNotifications}
          isDrawerOpen={openNotificationDrawer}
          fetchUnreadCount={fetchUnreadCount}
        />
      </Drawer>
    </>
  );
};

export { Header };
