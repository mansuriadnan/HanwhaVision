import { useThemeContext } from "../../context/ThemeContext";
// import CameraStream from "./CameraStream";

const WelcomePage = () => {
  const { theme } = useThemeContext();

  return (
    <div className="welcome-image">
      <h1>Welcome to</h1>

      <span>BI DASHBOARD</span>
      <img
        src={
          theme === "light"
            ? "/images/welcome-back.png"
            : "/images/dark-theme/welcome-back.png"
        }
        dark-themealt="welcome image"
      />
      {/* <CameraStream /> */}
    </div>
  );
};

export default WelcomePage;
