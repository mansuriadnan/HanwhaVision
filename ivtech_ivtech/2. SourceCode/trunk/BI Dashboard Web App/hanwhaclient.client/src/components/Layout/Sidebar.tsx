import React, { useEffect, useState } from "react";
import { FaUserAlt, FaUndo } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "../../context/ThemeContext";
import { usePermissions } from "../../context/PermissionsContext";
import { useLicense } from "../../context/LicenseContext";
import {
  COMMON_CONSTANTS,
  LABELS,
  SIDEBAR_TITLES,
} from "../../utils/constants";
import { RiArrowUpSLine, RiArrowDownSLine } from "react-icons/ri";
// import { GetClientLogo } from "../../services/settingService";
import {
  IDashboardNamePayload,
  IMonitoringNamePayload,
} from "../../interfaces/IChart";
import {
  DeleteDashboardService,
  GetDashboardDesign,
  SaveDashboardName,
} from "../../services/dashboardService";
import { ApiResponse } from "../../interfaces/IApiResponse";
import { Box, IconButton, ListItemText, Menu, MenuItem } from "@mui/material";
import { CustomTextFieldWithButton } from "../Reusable/CustomTextFieldWithButton";
import { useForm } from "react-hook-form";
import {
  DeleteMonitoringService,
  GetMonitoringDesign,
  SaveMonitoringName,
} from "../../services/monitoringService";
import { MoreVert } from "@mui/icons-material";
import { title } from "process";
import { CommonDialog } from "../Reusable/CommonDialog";
import { HasPermission } from "../../utils/screenAccessUtils";
import SpeechDashboard from "../SpeechDashboard";

const Sidebar: React.FC = () => {
  // console.log(import.meta.env.VITE_REACT_APP_API_BASE_URL);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const {
    control: dashboardControl,
    handleSubmit: handleDashboardSubmit,
    reset: resetDashboard,
  } = useForm<IDashboardNamePayload>({
    defaultValues: {
      dashboardName: "",
    },
  });

  const {
    control: dashboardEditControl,
    handleSubmit: handleDashboardEditSubmit,
    // setValue: setEditDashboardValue,
    reset: resetEditDashboardForm,
  } = useForm<IDashboardNamePayload>({
    defaultValues: {
      dashboardName: "",
    },
  }); // for Edit Dashboard

  const {
    control: monitoringEditControl,
    handleSubmit: handleMonitoringEditSubmit,
    reset: resetEditMonitoringForm,
  } = useForm<IMonitoringNamePayload>({
    defaultValues: {
      monitoringName: "",
    },
  }); // for Edit Monitoring

  const {
    control: monitoringControl,
    handleSubmit: handleMonitoringSubmit,
    reset: resetMonitoring,
  } = useForm<IMonitoringNamePayload>({
    defaultValues: {
      monitoringName: "",
    },
  }); // for Add Monitoring

  const { theme, toggleTheme } = useThemeContext();
  const { permissions } = usePermissions();

  const [clientLogo, setClientLogo] = useState<string>("");
  const [openMenus, setOpenMenus] = useState(() => {
    const storedMenus = localStorage.getItem("openMenus");
    return storedMenus ? JSON.parse(storedMenus) : {};
  });

  const [activeRoute, setActiveRoute] = useState(() => {
    return localStorage.getItem("activeRoute") || window.location.pathname;
  });

  const [customDashboards, setCustomDashboards] = useState([]);
  const [customMonitoring, setCustomMonitoring] = useState([]);
  //const [newDashboardName, setNewDashboardName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingMonitoring, setIsAddingMonitoring] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({
    anchorEl: null,
    dashboardId: null,
    title: null,
  });
  const [editingItem, setEditingItem] = useState({
    id: null,
    title: "",
    type: null,
  });
  const [deletingItem, setDeletingItem] = useState({
    id: null,
    title: "",
    type: null,
  });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    // fetchClientLogo();
    fetchDashboardSubMenus();
    if (userRights(LABELS.View_List_of_Monitorings)) {
      fetchMonitoringSubMenus();
    }
  }, []);

  useEffect(() => {
    if (window.location.pathname === "/login") {
      localStorage.clear();
    } else {
      // setActiveRoute(window.location.pathname);
      // localStorage.setItem("activeRoute", window.location.pathname);

      const fullRoute = window.location.pathname + (window.location.search || "");
      setActiveRoute(fullRoute);
      localStorage.setItem("activeRoute", fullRoute);
    }
  }, [window.location.pathname]);

  useEffect(() => {
    if (editingItem && editingItem.type === "dashboard") {
      resetEditDashboardForm({
        dashboardName: editingItem.title || "", // set the name to edit
      });
    }
  }, [editingItem, resetEditDashboardForm]);

  useEffect(() => {
    if (editingItem && editingItem.type === "monitoring") {
      resetEditMonitoringForm({
        monitoringName: editingItem.title || "", // set the name to edit
      });
    }
  }, [editingItem, resetEditMonitoringForm]);

  // const fetchClientLogo = async () => {
  //   try {
  //     const response = await GetClientLogo();
  //     if (response !== null) {
  //       setClientLogo(response as string);
  //     }
  //   } catch (error) {
  //     console.error("Errror while fetching the logo", error);
  //   }
  // };

  const fetchDashboardSubMenus = async () => {
    try {
      const response: any = await GetDashboardDesign();
      if (Array.isArray(response)) {
        const formattedDashboards = response.map((dashboard, index) => ({
          title: dashboard.dashboardName, // Assuming API returns `dashboardName`
          onClick: () =>
            handleSubmenuClick(
              `/dashboard?id=${dashboard.id}`,
              SIDEBAR_TITLES.Dashboards,
              dashboard.dashboardName
            ),
          route: `/dashboard?id=${dashboard.id}`,
        }));
        setCustomDashboards(formattedDashboards);


        // Reset active route if current one is missing (After delete selected dashboard)
        const storedRoute = localStorage.getItem("activeRoute");

        if (
          storedRoute &&
          storedRoute.startsWith("/dashboard") &&   //added this condition for resolved the issue :with fresh database, when press f5 then navigate to welcome from any route  
          !formattedDashboards.some((d) => d.route === storedRoute)
        ) {
          setActiveRoute(null);
          localStorage.removeItem("activeRoute");
          navigate("/welcome");
          // }
        }
        //end of code
      }
    } catch (error) {
      console.error("Errror while fetching dashboard sub menus", error);
    }
  };

  const fetchMonitoringSubMenus = async () => {
    try {
      const response: any = await GetMonitoringDesign();
      if (Array.isArray(response)) {
        if (response.length > 0) {
          const formattedMonitoringMenu = response.map((monitoring, index) => ({
            title: monitoring.monitoringName,
            onClick: () =>
              handleSubmenuClick(
                `/monitoring?id=${monitoring.id}`,
                SIDEBAR_TITLES.Monitoring,
                monitoring.monitoringName
              ),
            route: `/monitoring?id=${monitoring.id}`,
          }));
          setCustomMonitoring(formattedMonitoringMenu);
        } else {
          setCustomMonitoring([]);
          // navigate("/welcome"); // resolved the issue :with fresh database, when press f5 then navigate to welcome from any route 
        }
      }
    } catch (error) {
      console.error("Errror while fetching Monitoring sub menus", error);
    }
  };

  const userRights = (screen_name) => {
    let filtered = permissions.filter(
      (item: any) => item.screenName === screen_name
    );
    return filtered && filtered.length > 0 ? true : false;
  };

  const handleSubmenuClick = (route, sidebarMenuName, screenName) => {
    setActiveRoute(route);
    localStorage.setItem("activeRoute", route);
    navigate(route, {
      state: { sidebarMenuName: sidebarMenuName, screenName: screenName },
    });
  };

  const addNewDashboard = async (data: any) => {
    if (data.dashboardName.trim() === "") return;

    try {
      const newDashboardPayload: IDashboardNamePayload = {
        dashboardName: data.dashboardName.trim(),
      };
      const response: any = await SaveDashboardName(newDashboardPayload);
      if (response?.isSuccess) {
        const newDashboard = {
          title: data.dashboardName.trim(),
          onClick: () =>
            handleSubmenuClick(
              `/dashboard?id=${response.data}`,
              SIDEBAR_TITLES.Dashboards,
              data.dashboardName.trim()
            ),
          route: `/dashboard?id=${response.data}`,
        };

        setCustomDashboards((prevDashboards) => [
          ...prevDashboards,
          newDashboard,
        ]);
      }
    } catch (error) {
      console.error(`Error while saving the new dashboard name: `, error);
    } finally {
      //setNewDashboardName("");
      resetDashboard();
      setIsAdding(false);
    }
  };

  const editDashboard = async (data: any) => {
    const path = typeof editingItem.id === "string" ? editingItem.id : "";
    const id = path.match(/id=([^&]+)/)?.[1] || "";

    try {
      const payload = {
        id: id,
        dashboardDesignjson: "",
        dashboardName: data.dashboardName,
      };
      const response: any = await SaveDashboardName(payload);
      if (response?.isSuccess) {
        fetchDashboardSubMenus();
        resetDashboard();
        setEditingItem({ id: null, title: "", type: null });
        resetEditDashboardForm(); // Reset after save
      }
    } catch (error) {
      console.error(`Error while saving the Edit dashboard name: `, error);
    } finally {
      //setNewDashboardName("");
      resetDashboard();
      setIsAdding(false);
    }
  };

  const editMonitoring = async (data: any) => {
    const path = typeof editingItem.id === "string" ? editingItem.id : "";
    const id = path.match(/id=([^&]+)/)?.[1] || "";

    try {
      const payload = {
        monitoringId: id,
        monitoringName: data.monitoringName,
      };
      const response: any = await SaveMonitoringName(payload);
      if (response?.isSuccess) {
        fetchMonitoringSubMenus();
        resetMonitoring();
        setEditingItem({ id: null, title: "", type: null });
        resetEditMonitoringForm(); // Reset after save
      }
    } catch (error) {
      console.error(`Error while saving the Edit Monitoring name: `, error);
    } finally {
      resetDashboard();
      setIsAdding(false);
    }
  };

  const addNewMonitoring = async (data: IMonitoringNamePayload) => {
    if (data.monitoringName.trim() === "") return;

    try {
      const newMonitoringPayload: IMonitoringNamePayload = {
        monitoringName: data.monitoringName.trim(),
      };
      const response: any = await SaveMonitoringName(newMonitoringPayload);
      if (response?.isSuccess) {
        const newMonitoring = {
          title: data.monitoringName.trim(),
          onClick: () =>
            handleSubmenuClick(
              `/monitoring?id=${response.data}`,
              SIDEBAR_TITLES.Monitoring,
              data.monitoringName.trim()
            ),
          route: `/monitoring?id=${response.data}`,
        };

        setCustomMonitoring((prevMonitoring) => [
          ...prevMonitoring,
          newMonitoring,
        ]);
      }
    } catch (error) {
      console.error(`Error while saving the new Monitoring name: `, error);
    } finally {
      //setNewDashboardName("");
      resetMonitoring();
      setIsAddingMonitoring(false);
    }
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    setDeletingItem({ id: null, title: "", type: null });
  };

  const handleDeleteSubMenu = async (menu) => {
    const path = menu.id;
    const id = path.match(/id=([^&]+)/)?.[1] || null;
    if (menu.type === "dashboard") {
      try {
        const deleteData = await DeleteDashboardService(id);
        if (deleteData.isSuccess) {
          fetchDashboardSubMenus();
        }
      } catch (err: any) { }
    } else if (menu.type === "monitoring") {
      try {
        const deleteData = await DeleteMonitoringService(id);
        if (deleteData.isSuccess) {
          fetchMonitoringSubMenus();
        }
      } catch (err: any) { }
    }
    setIsConfirmOpen(false);
    setDeletingItem({ id: null, title: "", type: null });
  };

  const dashboardSubMenuList = [
    // {
    //   title: SIDEBAR_TITLES.Retail,
    //   onClick: () =>
    //     handleSubmenuClick(
    //       "/dashboard/retail",
    //       SIDEBAR_TITLES.Dashboards,
    //       SIDEBAR_TITLES.Retail
    //     ),
    //   route: "/dashboard/retail",
    // },
    // {
    //   title: SIDEBAR_TITLES.Traffic,
    //   onClick: () =>
    //     handleSubmenuClick(
    //       "/dashboard/traffic",
    //       SIDEBAR_TITLES.Dashboards,
    //       SIDEBAR_TITLES.Traffic
    //     ),
    //   route: "/dashboard/traffic",
    // },
    ...customDashboards,
  ];

  const monitoringSubMenuList = [
    // {
    //   title: "newMonitoring",
    //   onClick: () =>
    //     handleSubmenuClick(
    //       "/monitoring/newMonitoring",
    //       SIDEBAR_TITLES.Monitoring,
    //       "newMonitoring"
    //     ),
    //   route: "/monitoring/newMonitoring",
    // },
    ...customMonitoring,
  ];
  const menuItems_New = [
    {
      title: SIDEBAR_TITLES.Dashboards,
      icon: (
        <img
          src={"/images/sidebar_dashboard_logo.svg"}
          alt="Sidebar Dashboard Icon"
          width={25}
          height={25}
        />
      ),
      submenu: [...dashboardSubMenuList],
    },

    userRights(LABELS.View_List_of_Devices) ||
      userRights(LABELS.View_List_of_Floors)
      ? {
        title: SIDEBAR_TITLES.Configurations,
        icon: (
          <img
            src={"/images/sidebar_configurations_logo.svg"}
            alt="Sidebar Configurations Icon"
            width={25}
            height={25}
          />
        ),
        submenu: [
          userRights(LABELS.View_List_of_Devices)
            ? {
              title: SIDEBAR_TITLES.ManageDevice,
              onClick: () =>
                handleSubmenuClick(
                  "/manage-devices",
                  SIDEBAR_TITLES.Configurations,
                  SIDEBAR_TITLES.ManageDevice
                ),
              route: "/manage-devices",
            }
            : null,
          userRights(LABELS.View_List_of_Floors)
            ? {
              title: SIDEBAR_TITLES.FloorPlansAndZones,
              onClick: () =>
                handleSubmenuClick(
                  "/floorplans-and-zones",
                  SIDEBAR_TITLES.Configurations,
                  SIDEBAR_TITLES.FloorPlansAndZones
                ),
              route: "/floorplans-and-zones",
            }
            : null,
        ],
      }
      : null,

    userRights(LABELS.View_List_of_Events)
      ? {
        title: SIDEBAR_TITLES.Events,
        icon: (
          <img
            src={"/images/sidebar_events_logo.svg"}
            alt="Sidebar Events Icon"
            width={25}
            height={25}
          />
        ),
        submenu: [
          userRights(LABELS.View_List_of_Events)
            ? {
              title: SIDEBAR_TITLES.EventLogs,
              onClick: () =>
                handleSubmenuClick(
                  "/manage-eventlogs",
                  SIDEBAR_TITLES.Events,
                  SIDEBAR_TITLES.EventLogs
                ),
              route: "/manage-eventlogs",
            }
            : null,
        ],
      }
      : null,

    userRights(LABELS.View_List_of_Reports)
      ? {
        title: SIDEBAR_TITLES.Reports,
        icon: (
          <img
            src={"/images/sidebar_reports_logo.svg"}
            alt="Sidebar Reports Icon"
            width={25}
            height={25}
          />
        ),
        submenu: [
          userRights(LABELS.View_List_of_Reports)
            ? {
              title: SIDEBAR_TITLES.MyReports,
              onClick: () =>
                handleSubmenuClick(
                  "/reports",
                  SIDEBAR_TITLES.Reports,
                  SIDEBAR_TITLES.MyReports
                ),
              route: "/reports",
            }
            : null,
        ],
      }
      : null,

    userRights(LABELS.View_List_of_Monitorings)
      ? {
        title: SIDEBAR_TITLES.Monitoring,
        icon: (
          <img
            src={"/images/sidebar_monitoring_logo.svg"}
            alt="Sidebar Events Icon"
            width={25}
            height={25}
          />
        ),

        submenu: [...monitoringSubMenuList],
      }
      : null,

    userRights(LABELS.View_List_of_Users) ||
      userRights(LABELS.View_List_of_Roles) ||
      userRights(LABELS.View_List_of_Child_SubChild_Sites) ||
      userRights(LABELS.View_and_Configure_SMTP_Setup_Details) ||
      userRights(LABELS.View_and_Configure_Report_Scheduler) ||
      userRights(LABELS.View_and_Configure_FTP_Setup_Details) ||
      userRights(LABELS.CanUploadClientLogo) ||
      userRights(LABELS.CanUploadSSLCertificate) ||
      userRights(LABELS.CanClientOperationalTiming) ||
      userRights(LABELS.CanGoogleMapApiKey) ||
      userRights(LABELS.View_License_Details_and_History) ||
      // userRights(LABELS.Upload_New_License) ||
      userRights(LABELS.CanTakeFullDBBackup) ||
      userRights(LABELS.CanRestoreDatabase)
      ? {
        title: SIDEBAR_TITLES.Settings,
        icon: (
          <img
            src={"/images/sidebar_setting_logo.svg"}
            alt="Sidebar Settings Icon"
            width={25}
            height={25}
          />
        ),
        submenu: [
          userRights(LABELS.View_List_of_Users)
            ? {
              title: SIDEBAR_TITLES.ManageUsers,
              onClick: () =>
                handleSubmenuClick(
                  "/manage-users",
                  SIDEBAR_TITLES.Settings,
                  SIDEBAR_TITLES.ManageUsers
                ),
              route: "/manage-users",
            }
            : null,

          userRights(LABELS.View_List_of_Roles)
            ? {
              title: SIDEBAR_TITLES.RolesAndPermissions,
              onClick: () =>
                handleSubmenuClick(
                  "/roles-and-permissions",
                  SIDEBAR_TITLES.Settings,
                  SIDEBAR_TITLES.RolesAndPermissions
                ),
              route: "/roles-and-permissions",
            }
            : null,

          userRights(LABELS.View_List_of_Child_SubChild_Sites)
            ? {
              title: SIDEBAR_TITLES.MultisiteSetup,
              onClick: () =>
                handleSubmenuClick(
                  "/multisite-setup",
                  SIDEBAR_TITLES.Settings,
                  SIDEBAR_TITLES.MultisiteSetup
                ),
              route: "/multisite-setup",
            }
            : null,

          userRights(LABELS.View_and_Configure_SMTP_Setup_Details) ||
            userRights(LABELS.View_and_Configure_Report_Scheduler) ||
            userRights(LABELS.View_and_Configure_FTP_Setup_Details) ||
            userRights(LABELS.CanUploadClientLogo) ||
            userRights(LABELS.CanUploadSSLCertificate) ||
            userRights(LABELS.CanClientOperationalTiming) ||
            userRights(LABELS.CanGoogleMapApiKey)
            ? {
              title: SIDEBAR_TITLES.SettingsGeneral,
              onClick: () =>
                handleSubmenuClick(
                  "/general-settings",
                  SIDEBAR_TITLES.Settings,
                  SIDEBAR_TITLES.SettingsGeneral
                ),
              route: "/general-settings",
            }
            : null,

          // userRights(LABELS.Upload_New_License)
          //   ? {
          //       title: SIDEBAR_TITLES.SettingsLicense,
          //       onClick: () =>
          //         handleSubmenuClick(
          //           "/license",
          //           SIDEBAR_TITLES.Settings,
          //           SIDEBAR_TITLES.SettingsLicense
          //         ),
          //       route: "/license",
          //     }
          //   : null,
          userRights(LABELS.View_License_Details_and_History)
            ? {
              title: SIDEBAR_TITLES.SettingsLicense,
              onClick: () =>
                handleSubmenuClick(
                  "/license",
                  SIDEBAR_TITLES.Settings,
                  SIDEBAR_TITLES.SettingsLicense
                ),
              route: "/license",
            }
            : null,

          userRights(LABELS.CanTakeFullDBBackup) ||
            userRights(LABELS.CanRestoreDatabase)
            ? {
              title: "Backup & Restore",
              onClick: () =>
                handleSubmenuClick(
                  "/backup-and-restore",
                  SIDEBAR_TITLES.Settings,
                  "Backup & Restore"
                ),
              route: "/backup-and-restore",
            }
            : null,
        ],
      }
      : null,
  ];

  var isLicenseValid = localStorage.getItem("isLicenseValid");
  // console.log("isLicenseValid sidebar", isLicenseValid);
  const menuItemsFiltered =
    isLicenseValid === "true"
      ? menuItems_New
      : [
        {
          title: SIDEBAR_TITLES.Settings,
          icon: (
            <img
              src={"/images/sidebar_setting_logo.svg"}
              alt="Sidebar Settings Icon"
              width={25}
              height={25}
            />
          ),
          submenu: [
            {
              title: SIDEBAR_TITLES.SettingsLicense,
              onClick: () =>
                handleSubmenuClick(
                  "/license",
                  SIDEBAR_TITLES.Settings,
                  SIDEBAR_TITLES.SettingsLicense
                ),
              route: "/license",
            },
          ],
        },
      ];

  const sidebarStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column" as const, // Explicitly typed
    backgroundColor: theme === "light" ? "#ffffff" : "#1a202c",
    color: theme === "light" ? "#000000" : "#ffffff",
    transition: "width 0.3s ease",
    width: isSidebarOpen ? "250px" : "60px",
    height: "100vh",
    boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
  };

  // const toggleMenuu = (title) => {
  //   setOpenMenus((prev) => {
  //     const updatedMenus = { ...prev, [title]: !prev[title] };
  //     localStorage.setItem("openMenus", JSON.stringify(updatedMenus));
  //     return updatedMenus;
  //   });
  // };

  const toggleMenuu = (title) => {
    setOpenMenus((prev) => {
      const updatedMenus = {
        [title]: !prev[title], // toggle current menu
      };
      localStorage.setItem("openMenus", JSON.stringify(updatedMenus));
      return updatedMenus;
    });
  };

  const menuItemGenerator = (menuItems) => {
    return (
      // <div className="sidebar">
      <>
        {/* Logo */}
        {/* <div className="logo-container">
          <img src="/images/logo.svg" alt="Logo" className="logo" />
        </div> */}

        {/* Menu */}
        {/* <div className="menu-container"> */}
        <>
          {menuItems.map((menu) =>
            menu ? (
              <div key={menu.title} className="menu-item">
                <button
                  // className="menu-button"
                  onClick={() => toggleMenuu(menu.title)}
                  className={`menu-button ${menu.submenu?.some((sub) => sub?.route === activeRoute)
                    ? "active"
                    : ""
                    }`}
                >
                  <div className="menu-title">
                    {menu.icon}
                    <span>{menu.title}</span>
                  </div>
                  {openMenus[menu.title] ? (
                    <RiArrowUpSLine />
                  ) : (
                    <RiArrowDownSLine />
                  )}
                </button>
                {openMenus[menu.title] && (
                  <div className="submenu">
                    {menu.submenu
                      ?.filter((sub) => sub != null)
                      .map((sub) => {
                        // console.log("sub=>",sub)

                        // Check if this menu is Dashboards or Monitoring
                        const isSpecialMenu =
                          menu.title === SIDEBAR_TITLES.Dashboards ||
                          menu.title === SIDEBAR_TITLES.Monitoring;
                        return (
                          <div
                            key={sub.title}
                            className="submenu-item-with-menu"
                          >
                            {editingItem.id === sub.route ? (
                              <Box
                                component="form"
                                onSubmit={
                                  editingItem.type === "dashboard"
                                    ? handleDashboardEditSubmit((data) => {
                                      editDashboard(data);
                                      setEditingItem({
                                        id: null,
                                        title: "",
                                        type: null,
                                      });
                                      resetEditDashboardForm(); // Reset after save
                                    })
                                    : handleMonitoringEditSubmit((data) => {
                                      editMonitoring(data);
                                      setEditingItem({
                                        id: null,
                                        title: "",
                                        type: null,
                                      });
                                      resetEditMonitoringForm(); // Reset after save
                                    })
                                }
                              // sx={{ marginTop: 2 }}
                              >
                                {editingItem.type === "dashboard" ? (
                                  <CustomTextFieldWithButton
                                    name="dashboardName"
                                    control={dashboardEditControl}
                                    rules={{
                                      maxLength: {
                                        value:
                                          COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH,
                                        message: `Dashboard name cannot exceed ${COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH} characters`,
                                      },
                                    }}
                                    placeholder="Enter dashboard name"
                                    ShowAddButton={false}
                                    size="small"
                                    autoFocus
                                  />
                                ) : (
                                  <CustomTextFieldWithButton
                                    name="monitoringName"
                                    control={monitoringEditControl}
                                    rules={{
                                      maxLength: {
                                        value:
                                          COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH,
                                        message: `Monitoring name cannot exceed ${COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH} characters`,
                                      },
                                    }}
                                    placeholder="Enter monitoring name"
                                    ShowAddButton={false}
                                    size="small"
                                    autoFocus
                                  />
                                )}
                              </Box>
                            ) : (
                              <>
                                <button
                                  key={sub.title}
                                  // className="submenu-item"
                                  className={`submenu-item ${activeRoute === sub.route ? "active" : ""
                                    }`}
                                  onClick={sub.onClick}
                                >
                                  {sub.title}
                                </button>

                                {isSpecialMenu &&
                                  // Always show for dashboards
                                  (menu.title === SIDEBAR_TITLES.Dashboards ||
                                    // Show for monitoring only if permission exists
                                    (menu.title === SIDEBAR_TITLES.Monitoring &&
                                      (HasPermission(
                                        LABELS.CanAddOrUpdateMonitoring
                                      ) ||
                                        HasPermission(
                                          LABELS.CanDeleteMonitoring
                                        )))) && (
                                    <IconButton
                                      size="small"
                                      onClick={(e) =>
                                        handleMenuOpen(
                                          e,
                                          sub.route,
                                          sub.title,
                                          menu.title ===
                                            SIDEBAR_TITLES.Dashboards
                                            ? "dashboard"
                                            : "monitoring"
                                        )
                                      }
                                    >
                                      <MoreVert fontSize="small" />
                                    </IconButton>
                                  )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    {menu.title === SIDEBAR_TITLES.Dashboards && (
                      <>
                        {isAdding ? (
                          // <input
                          //   type="text"
                          //   placeholder="Enter dashboard name"
                          //   value={newDashboardName}
                          //   onChange={(e) =>
                          //     setNewDashboardName(e.target.value)
                          //   }
                          //   onKeyDown={(e) => {
                          //     e.stopPropagation();
                          //     if (e.key === "Enter") {
                          //       addNewDashboard();
                          //       setIsAdding(false);
                          //     }
                          //   }}
                          //   className="add-dashboard"
                          // />
                          <Box
                            component="form"
                            onSubmit={handleDashboardSubmit((data) => {
                              addNewDashboard(data);
                              setIsAdding(false);
                            })}
                            sx={{ marginTop: 2 }}
                          >
                            <CustomTextFieldWithButton
                              name="dashboardName"
                              control={dashboardControl}
                              rules={{
                                maxLength: {
                                  value: COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH,
                                  message: `Dashboard name cannot exceed ${COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH} characters`,
                                },
                              }}
                              placeholder="Enter dashboard name"
                              ShowAddButton={false}
                              autoFocus
                            />
                          </Box>
                        ) : (
                          // HasPermission(LABELS.can_add_update_dashboard_preference) ? (
                          <button
                            className="add-dashboard"
                            onClick={() => {
                              setIsAdding(true);
                            }}
                          >
                            + Add Dashboard
                          </button>
                          // ) : null
                        )}
                      </>
                    )}

                    {menu.title === SIDEBAR_TITLES.Monitoring && (
                      <>
                        {isAddingMonitoring ? (
                          <Box
                            component="form"
                            onSubmit={handleMonitoringSubmit((data) => {
                              addNewMonitoring(data);
                              setIsAdding(false);
                            })}
                            sx={{ marginTop: 2 }}
                          >
                            <CustomTextFieldWithButton
                              name="monitoringName"
                              control={monitoringControl}
                              rules={{
                                maxLength: {
                                  value: COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH,
                                  message: `Monitoring name cannot exceed ${COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH} characters`,
                                },
                              }}
                              placeholder="Enter Monitoring name"
                              ShowAddButton={false}
                              autoFocus
                            />
                          </Box>
                        ) : HasPermission(LABELS.CanAddOrUpdateMonitoring) ? (
                          <button
                            className="add-dashboard"
                            onClick={() => {
                              setIsAddingMonitoring(true);
                            }}
                          >
                            + Add Monitoring
                          </button>
                        ) : null}
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : null
          )}

          {Boolean(menuAnchor.anchorEl) && (
            <Menu
              anchorEl={menuAnchor.anchorEl}
              open={Boolean(menuAnchor.anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  borderRadius: 2,
                  pl: 1,
                  pr: 1,
                },
              }}
              className="edit-delete-pop"
            >
              {menuAnchor.type === "monitoring" ? (
                <>
                  {HasPermission(LABELS.CanAddOrUpdateMonitoring) && (
                    <MenuItem
                      onClick={() => {
                        // console.log(
                        //   "Edit clicked for",
                        //   menuAnchor.dashboardId,
                        //   menuAnchor.type
                        // );
                        setEditingItem({
                          id: menuAnchor.dashboardId,
                          title: menuAnchor.title,
                          type: menuAnchor.type,
                        });
                        handleMenuClose();
                      }}
                    >
                      <IconButton>
                        <img
                          src="/images/edit.svg"
                          alt="edit"
                          width={20}
                          height={20}
                        />
                      </IconButton>
                      <ListItemText primary="Edit" />
                    </MenuItem>
                  )}

                  {HasPermission(LABELS.CanDeleteMonitoring) && (
                    <MenuItem
                      onClick={() => {
                        setDeletingItem({
                          id: menuAnchor.dashboardId,
                          title: menuAnchor.title,
                          type: menuAnchor.type,
                        });
                        setIsConfirmOpen(true);
                        handleMenuClose();
                      }}
                    >
                      <IconButton>
                        <img
                          src="/images/delete_gray.svg"
                          alt="delete"
                          width={20}
                          height={20}
                        />
                      </IconButton>
                      <ListItemText primary="Delete" />
                    </MenuItem>
                  )}
                </>
              ) : (
                <>
                  <MenuItem
                    onClick={() => {
                      setEditingItem({
                        id: menuAnchor.dashboardId,
                        title: menuAnchor.title,
                        type: menuAnchor.type,
                      });
                      handleMenuClose();
                    }}
                  >
                    <IconButton>
                      <img
                        src="/images/edit.svg"
                        alt="edit"
                        width={20}
                        height={20}
                      />
                    </IconButton>
                    <ListItemText primary="Edit" />
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      setDeletingItem({
                        id: menuAnchor.dashboardId,
                        title: menuAnchor.title,
                        type: menuAnchor.type,
                      });
                      setIsConfirmOpen(true);
                      handleMenuClose();
                    }}
                  >
                    <IconButton>
                      <img
                        src="/images/delete_gray.svg"
                        alt="delete"
                        width={20}
                        height={20}
                      />
                    </IconButton>
                    <ListItemText primary="Delete" />
                  </MenuItem>
                </>
              )}
            </Menu>
          )}

          <CommonDialog
            open={isConfirmOpen}
            title="Delete Confirmation!"
            customClass="cmn-confirm-delete-icon"
            content="Are you sure you want to Continue?"
            onConfirm={() => deletingItem && handleDeleteSubMenu(deletingItem)}
            onCancel={handleCloseConfirm}
            confirmText="Delete"
            cancelText="Cancel"
            type="delete"
            titleClass={true}
          />
        </>
        {/* </div> */}
        {/* </div> */}
      </>
    );
  };

  const handleMenuOpen = (event, dashboardId, title, type) => {
    setMenuAnchor({ anchorEl: event.currentTarget, dashboardId, title, type });
  };

  const handleMenuClose = () => {
    setMenuAnchor({ anchorEl: null, dashboardId: null, title: null });
  };

  return (
    <div className="sidebar-main">
      <div className="sidebar-wrapper">
        <img
          // src={clientLogo || `images/vision_insight_logo.svg`}
          src={`images/vision_insight_logo.svg`}
          alt="Logo"
          className="hanwhaLogo"
          onClick={() =>
            handleSubmenuClick(
              "/welcome",
              SIDEBAR_TITLES.WelcomePage,
              SIDEBAR_TITLES.WelcomePagesubtitle
            )
          }
        />
        {menuItemGenerator(menuItemsFiltered)}
      </div>

      {/* <div className="sidebar-footer"> */}
      <div >
        <SpeechDashboard />
      </div>
      {/* </div> */}
      <div className="sidebar-version">
        Version <strong>3.0.4</strong>
      </div>

    </div>
  );
};

export { Sidebar };
