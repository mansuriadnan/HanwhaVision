import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { LABELS, SIDEBAR_TITLES } from "../../utils/constants";
import CommonDialog from "../Reusable/CommonDialog";
import { useAuth } from "../../hooks/useAuth";

export const Header: React.FC = () => {
  const location = useLocation();
  const { user } = useUser();
  const { handleLogout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [openLogoutConfirm, setOpenLogoutConfirm] = useState<boolean>(false);

  const screenName = location.state?.screenName || "Dashboard";

  // Function to close dropdown on outside click
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

  const handleLogoutConfirm = () => {
    setIsOpen(false);
    setOpenLogoutConfirm(true);
  };

  // Function to handle logout
  const handleLogoutFromHeader = () => {
    setOpenLogoutConfirm(false);
    handleLogout();
    navigate("/");
  };

  // Function to close the confirmation dialog
  const handleCloseConfirm = () => {
    setOpenLogoutConfirm(false);
  };

  const handleProfilePage = () => {
    setIsOpen(false);
    navigate("/profile", {
      state: {
        //label: LABELS.Dashboard_Preference_master,
        screenName: SIDEBAR_TITLES.Profile,
      },
    });
  };

  return (
    <header className="header">
      <h2 className="screenNameHeader">{screenName}</h2>

      <div className="userProfileBox" onClick={() => setIsOpen(!isOpen)}>
        <span className="userNameLabel">{`${user?.firstname} ${user?.lastname}`}</span>
        <img
          src={user?.profileImage || '/images/Super_Admin_User_Profile_Image.png'}
          className="useravatar"
          alt="User Avatar"
        />
      </div>

      {isOpen && (
        <div className="userProfileDropdown" ref={dropdownRef}>
          <div>
            <p>{user?.email}</p>
            <p className="active">
              {user?.username ?? ""}
            </p>
          </div>

          <ul>
            <li
              // onClick={() => alert("Go to Profile")}
              onClick={handleProfilePage}
            >
              Profile
            </li>
            <li
              onClick={() => {
                setIsOpen(false);
                navigate("/changepassword", {
                  state: { label: LABELS.Change_Password },
                });
              }}
            >
              Change Password
            </li>
            <li
              onClick={handleLogoutConfirm}
            >
              Logout
            </li>
          </ul>
        </div>
      )}

      <CommonDialog
        open={openLogoutConfirm}
        title="Logout Confirmation"
        content="Are you sure you want to do logout?"
        onConfirm={handleLogoutFromHeader}
        onCancel={handleCloseConfirm}
        confirmText="Confirm"
        cancelText="Cancel"
        type="logout"
        customClass="common-dialog-with-icon"
      />
    </header>
  );
};
