import React, { useEffect, useState } from "react";
import { FaHome, FaUserAlt } from "react-icons/fa";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useThemeContext } from "../../context/ThemeContext";
import { usePermissions } from "../../context/PermissionsContext";
import { LABELS, SIDEBAR_TITLES } from "../../utils/constants";
import { Button } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { NavLink } from "react-router-dom";
import CommonDialog from "../Reusable/CommonDialog";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const userManagementRoutes = [
    "/screen-management",
    "/roles",
    "/user",
  ];
  const isUserManagementRoute = userManagementRoutes.includes(location.pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(isUserManagementRoute);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeContext();
  const { permissions } = usePermissions();
  const [matchedScreens, setMatchedScreens] = useState<string[]>([]);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleUserManagement = () =>
    setIsUserManagementOpen(!isUserManagementOpen);
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const [openLogoutConfirm, setOpenLogoutConfirm] = useState<boolean>(false);

  useEffect(() => {
    setIsUserManagementOpen(isUserManagementRoute);
  }, [location.pathname]);

  const userRights = (screen_name) => {
    let filtered = permissions.filter(
      (item: any) => item.screenName === screen_name
    );
    return filtered && filtered.length > 0 ? true : false;
    // return filtered;
  };

  const handleLogoutFromSidebar = () => {
    setOpenLogoutConfirm(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("permissions");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userProfileReferenceData");
    navigate("/");
  };

  const handleLogoutConfirm = () => {
    setOpenLogoutConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenLogoutConfirm(false);
  };

  const menuItems = [
    // userRights(LABELS.Dashboard_Preference_master)
    //   ? {
    //       title: SIDEBAR_TITLES.Dashboard,
    //       label: LABELS.Dashboard_Preference_master,
    //       icon: <FaHome />,
    //       onClick: () =>
    //         navigate("/dashboard", {
    //           state: {
    //             label: LABELS.Dashboard_Preference_master,
    //             screenName: SIDEBAR_TITLES.Dashboard,
    //           },
    //         }),
    //     }
    //   : null,
    userRights(LABELS.Can_View_Customer)
      ? {
        title: SIDEBAR_TITLES.CustomerAndLicense,
        label: LABELS.Can_View_Customer,
        icon: (
          <img
            src={"/images/customer.svg"}
            alt="Customer Icon"
            width={25}
            height={25}
          />
        ),
        onClick: () =>
          navigate("/client-management", {
            state: {
              label: LABELS.Can_View_Customer,
              screenName: SIDEBAR_TITLES.CustomerAndLicense,
            },
          }),
      }
      : null,
    userRights(LABELS.Can_View_Distributor)
      ? {
        title: SIDEBAR_TITLES.Distributors,
        label: LABELS.Can_View_Distributor,
        icon: (
          <img
            src={"/images/distributor.svg"}
            alt="Distributor Icon"
            width={25}
            height={25}
          />
        ),
        onClick: () =>
          navigate("/distributer-management", {
            state: {
              label: LABELS.Can_View_Distributor,
              screenName: SIDEBAR_TITLES.Distributors,
            },
          }),
      }
      : null,

    userRights(LABELS.Can_View_User) ||
      userRights(LABELS.Can_View_Role) ||
      userRights(LABELS.Can_View_Permission)
      ? {
        title: SIDEBAR_TITLES.UserManagement,
        icon: (
          <img
            src={"/images/user.svg"}
            alt="User Icon"
            width={25}
            height={25}
          />
        ),
        submenu: [
          userRights(LABELS.Can_View_User)
            ? {
              title: SIDEBAR_TITLES.Users,
              label: LABELS.Can_View_User,
              onClick: () =>
                navigate("/user", {
                  state: {
                    label: LABELS.Can_View_User,
                    screenName: SIDEBAR_TITLES.UserManagement,
                  },
                }),
            }
            : null,
          userRights(LABELS.Can_View_Role)
            ? {
              title: SIDEBAR_TITLES.Roles,
              label: LABELS.Can_View_Role,
              onClick: () =>
                navigate("/roles", {
                  state: {
                    label: LABELS.Can_View_Role,
                    screenName: SIDEBAR_TITLES.UserManagement,
                  },
                }),
            }
            : null,
          userRights(LABELS.Can_View_Permission)
            ? {
              title: SIDEBAR_TITLES.Permissions,
              label: LABELS.Can_View_Permission,
              onClick: () =>
                navigate("/screen-management", {
                  state: {
                    label: LABELS.Can_View_Permission,
                    screenName: SIDEBAR_TITLES.UserManagement,
                  },
                }),
            }
            : null,
        ],
      }
      : null,
    // {
    //   label: LABELS.User_master,
    //   icon: <FaUserAlt />,
    //   onClick: () =>
    //     navigate("/user", { state: { label: LABELS.User_master } }),
    // },
    // {
    //   label: LABELS.Role_master,
    //   icon: <FaUserAlt />,
    //   onClick: () =>
    //     navigate("/roles", { state: { label: LABELS.Role_master } }),
    // },
    // {
    //   label: LABELS.Role_Screen_Mapping_master,
    //   icon: <FaUserAlt />,
    //   onClick: () =>
    //     navigate("/screen-management", {
    //       state: { label: LABELS.Role_Screen_Mapping_master },
    //     }),
    // },
    // {
    //   label: LABELS.Client_master,
    //   icon: <FaUserAlt />,
    //   onClick: () =>
    //     navigate("/client-management", {
    //       state: { label: LABELS.Client_master },
    //     }),
    // },
    // {
    //   label: LABELS.License_master,
    //   icon: <FaUserAlt />,
    //   onClick: () =>
    //     navigate("/license-management", {
    //       state: { label: LABELS.License_master },
    //     }),
    // },
  ];

  // const userManagementItems = [
  //   {
  //     label: "Users",
  //     onClick: () =>
  //       navigate("/user", {
  //         state: { label: LABELS.User_master, screenName: "User Management" },
  //       }),
  //   },
  //   {
  //     label: "Roles",
  //     onClick: () =>
  //       navigate("/roles", {
  //         state: { label: LABELS.Role_master, screenName: "User Management" },
  //       }),
  //   },
  //   {
  //     label: "Permissions",
  //     onClick: () =>
  //       navigate("/screen-management", {
  //         state: {
  //           label: LABELS.Role_Screen_Mapping_master,
  //           screenName: "User Management",
  //         },
  //       }),
  //   },
  // ];

  // useEffect(() => {
  //   if (permissions.length > 0) {
  //     const matchedMenu = menuItems?.filter((menuItem) =>
  //       permissions.some(
  //         (permission: any) => permission.screenName === menuItem?.label
  //       )
  //     );
  //     setMatchedScreens(matchedMenu as any);
  //   }
  // }, [permissions]);

  const sidebarStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme === "light" ? "#FFFFFF" : "#1a202c",
    color: theme === "light" ? "#000000" : "#ffffff",
    transition: "width 0.3s ease",
    width: isSidebarOpen ? "300px" : "80px",
    height: "100vh",
    boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
  };

  // const buttonStyles: React.CSSProperties = {
  //   padding: "1rem",
  //   fontSize: "1.25rem",
  //   border: "none",
  //   background: "none",
  //   cursor: "pointer",
  //   color: theme === "light" ? "#000000" : "#ffffff",
  // };

  const menuItemStyles: React.CSSProperties = {
  };

  const contentStyles: React.CSSProperties = {
    flex: 1,
    padding: "1rem",
    backgroundColor: theme === "light" ? "#f9f9f9" : "#121212",
  };

  const ActiveMenu: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.2s ease",
    backgroundColor: "#FE6500",
  };

  const NormalMenu: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.2s ease",
  };

  // const submenuItemStyles: React.CSSProperties = {
  //   padding: "0.5rem 2rem",
  //   display: "flex",
  //   alignItems: "center",
  //   gap: "1rem",
  //   cursor: "pointer",
  //   transition: "background 0.2s ease",
  // };

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item.title);
    item.onClick();
  };

  let menuIndex = 0;
  const menuItemGenerator = (menuObj, parentIndex = null) => {
    return menuObj.map((singleMenu, index) => {
      menuIndex = menuIndex + 1;
      const isActive = activeMenuItem === singleMenu?.title;

      const isAnySubmenuActive = singleMenu?.submenu?.some(subItem =>
        subItem?.title === activeMenuItem ||
        subItem?.submenu?.some(nestedSubItem => nestedSubItem.title === activeMenuItem)
      );

      const isParentActive = isActive || isAnySubmenuActive;

      if (singleMenu != null && singleMenu.submenu) {
        return (
          <>
            <li
              key={menuIndex}
              className={isUserManagementOpen ? "active" : ""}
            // className={isActive ? "ActiveMenu" : "NormalMenu"}
            // onClick={() => handleMenuItemClick(singleMenu, index)} 
            >
              <div className="menu-itrms-wraper" onClick={toggleUserManagement}>
                {singleMenu.icon}
                <span style={{ display: isSidebarOpen ? "inline" : "none" }}>
                  {singleMenu?.title}
                </span>
                {isUserManagementOpen ?
                  (
                    <img
                      src={"/images/arrow-up.svg"}
                      alt="arrow-up icon"
                      width={25}
                      height={25}
                    />) : 
                    (
                      <img
                        src={"/images/arrow-down.svg"}
                        alt="arrow-down icon"
                        width={25}
                        height={25}
                      />)
                    }
              </div>
              <ul className={isParentActive ? "ActiveMenu" : "NormalMenu"}>
                {isUserManagementOpen &&
                  menuItemGenerator(singleMenu.submenu, index)}
              </ul>
            </li>
          </>
        );
      } else {
        return singleMenu != null ? (
          <li
            className={isActive ? "ActiveMenu active" : "NormalMenu"}
            key={menuIndex}
            onClick={() => handleMenuItemClick(singleMenu)}
          // style={{
          //   ...menuItemStyles,
          //   background: isActive
          //     ? "linear-gradient(to right, #FF8A00, #FE6500)"
          //     : "transparent",
          // }}
          >
            <div className="menu-itrms-wraper">
              {singleMenu.icon}
              <span style={{ display: isSidebarOpen ? "inline" : "none" }}>
                {singleMenu?.title}
              </span>
            </div>
          </li>
        ) : null;
      }
    });
  };
  return (
    <div className="sidebar-main">
      <div className="slidebar-wrapper">
        <div className="sidebar-logo">
          <img src="images/HanwhaLogo.svg" alt="Logo" className="hanwhaLogo" />
        </div>

        <ul className="sidebar-list">
          {/* {matchedScreens &&
            matchedScreens.map((item: any, index) => {
              const isActive = activeMenuItem === index;
              //  menuItems && menuItems.map((item: any, index) => {
              return (
                <li
                  key={index}
                  // style={menuItemStyles}
                  style={{
                    ...menuItemStyles,
                    background: isActive
                      ? "linear-gradient(to right, #FF8A00, #FE6500)" // Apply a linear gradient when active
                      : "transparent", // Transparent when not active
                  }}
                  // onMouseEnter={(e) =>
                  //   (e.currentTarget.style.backgroundColor =
                  //     theme === "light" ? "#f0f0f0" : "#2d3748")
                  // }
                  // onMouseLeave={(e) =>
                  //   (e.currentTarget.style.backgroundColor = "transparent")
                  // }
                  // onClick={(e) => item.onClick()}
                  onClick={() => handleMenuItemClick(item, index)}
                >
                  <div>{item.icon}</div>
                  <span style={{ display: isSidebarOpen ? "inline" : "none" }}>
                    {item.label}
                  </span>
                </li>
              );
            })} */}

          {/* <li style={menuItemStyles} onClick={toggleUserManagement}>
            <div>
              <FaUserAlt />
            </div>
            <span style={{ display: isSidebarOpen ? "inline" : "none" }}>
              User Management
            </span>
            {isUserManagementOpen ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
          </li>
          {isUserManagementOpen &&
            userManagementItems.map((item, index) => (
              <li key={index} style={submenuItemStyles} onClick={item.onClick}>
                <span>{item.label}</span>
              </li>
            ))} */}

          {/* <li
            style={menuItemStyles}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                theme === "light" ? "#f0f0f0" : "#2d3748")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            onClick={() =>
              navigate("/changepassword", {
                state: { label: LABELS.Change_Password },
              })
            }
          >
            <div>
              <FaUserAlt />
            </div>
            <span style={{ display: isSidebarOpen ? "inline" : "none" }}>
              {LABELS.Change_Password}
            </span>
          </li>
          <li
            style={menuItemStyles}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                theme === "light" ? "#f0f0f0" : "#2d3748")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            onClick={toggleTheme}
          >
            <div>
              <FaUndo />
            </div>
            <span style={{ display: isSidebarOpen ? "inline" : "none" }}>
              Toggle Theme
            </span>
          </li> */}
          {/* <li
            style={menuItemStyles}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                theme === "light" ? "#f0f0f0" : "#2d3748")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            onClick={() => navigate("/logout")}
          >
            <div>
              <FaUserAlt />
            </div>
            <span style={{ display: isSidebarOpen ? "inline" : "none" }}>
              Logout
            </span>
          </li> */}

          {menuItemGenerator(menuItems)}


        </ul>

        <Button
          variant="text"
          startIcon={<img src={"/images/sidebar_logout.svg"} alt="User Icon" width={25} height={25} />}
          onClick={handleLogoutConfirm}
          className="logout-btn"
        >
          Log Out
        </Button>

      </div>

      {/* Main Content */}
      {/* <div style={contentStyles}>
        <Outlet />
      </div> */}

      <CommonDialog
        open={openLogoutConfirm}
        title="Logout Confirmation"
        content="Are you sure you want to do logout?"
        onConfirm={handleLogoutFromSidebar}
        onCancel={handleCloseConfirm}
        confirmText="Confirm"
        cancelText="Cancel"
        type="logout"
        customClass="common-dialog-with-icon"
      />
    </div>
  );
};

export { Sidebar };
