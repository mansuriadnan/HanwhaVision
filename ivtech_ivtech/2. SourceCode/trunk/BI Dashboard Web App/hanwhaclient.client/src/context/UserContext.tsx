// import React, { createContext, useContext, useState, ReactNode } from "react";
// import { LABELS } from "../utils/constants";

// // Define types
// interface User {
//   name: string;
//   profilePic: string;
//   screenName: string;
//   email:string;
//   phone:string;
// }

// // Default values
// const defaultUser: User = {
//   name: "Johndoe Men",
//   email: "johndoe@email.com",
//   phone: "+971-55-1234567",
//   profilePic: "/images/userimage.png", // Replace with actual image URL
//   screenName: LABELS.Dashboard_Preference_master, // Default screen name
// };

// // Create Context
// const UserContext = createContext<{ 
//   user: User; 
//   setUser: (user: User) => void; 
//   setScreenName: (screenName: string) => void; 
// }>({
//   user: defaultUser,
//   setUser: () => {},
//   setScreenName: () => {}, // Function to update screen name
// });

// // Provider Component
// export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User>(defaultUser);

//   // Function to update screen name dynamically
//   const setScreenName = (screenName: string) => {
//     setUser((prevUser) => ({ ...prevUser, screenName }));
//   };

//   return (
//     <UserContext.Provider value={{ user, setUser, setScreenName }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// // Hook for easy usage
// export const useUser = () => useContext(UserContext);

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { IProfileReferenceData, IUsers } from "../interfaces/IUser";
import { ISelectedDevicesHeatmap } from "../interfaces/IChart";


interface UserContextType {
  user: IUsers | null;
  setUser: (user: IUsers | null) => void;
  referenceData:  IProfileReferenceData | null;
  setReferenceData: (data: IProfileReferenceData | null) => void; 
  selectedCameraHeatMap : ISelectedDevicesHeatmap[]
  setSelectedCameraHeatMap:(data: ISelectedDevicesHeatmap[]) => void; 
  selectedForkliftHeatMap : ISelectedDevicesHeatmap[]
  setSelectedForkliftHeatMap:(data: ISelectedDevicesHeatmap[]) => void; 
  selectedShoppingHeatMap : ISelectedDevicesHeatmap[]
  setSelectedShoppingHeatMap:(data: ISelectedDevicesHeatmap[]) => void; 
  selectedPeopleCountingHeatMap : ISelectedDevicesHeatmap[]
  setSelectedPeopleCountingHeatMap:(data: ISelectedDevicesHeatmap[]) => void; 
  openExportWidget: boolean;
  setOpenExportWidget: (open: boolean) => void;
}
// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUsers | null>(null);
  const [referenceData, setReferenceData] = useState<IProfileReferenceData | null>(null);
  const [selectedCameraHeatMap, setSelectedCameraHeatMap] = useState<ISelectedDevicesHeatmap[] | []>([]);
  const [selectedForkliftHeatMap, setSelectedForkliftHeatMap] = useState<ISelectedDevicesHeatmap[] | []>([]);
  const [selectedShoppingHeatMap, setSelectedShoppingHeatMap] = useState<ISelectedDevicesHeatmap[] | []>([]);
  const [selectedPeopleCountingHeatMap, setSelectedPeopleCountingHeatMap] = useState<ISelectedDevicesHeatmap[] | []>([]);
  const [openExportWidget, setOpenExportWidget] = useState<boolean>(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("userProfile");
    const storedReferenceData = localStorage.getItem("userProfileReferenceData");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedReferenceData) {
      setReferenceData(JSON.parse(storedReferenceData));
    }
  }, []);
  return (
    <UserContext.Provider value={{ user, setUser, referenceData, setReferenceData, selectedCameraHeatMap, setSelectedCameraHeatMap,selectedForkliftHeatMap,setSelectedForkliftHeatMap,selectedShoppingHeatMap,setSelectedShoppingHeatMap,selectedPeopleCountingHeatMap, setSelectedPeopleCountingHeatMap, openExportWidget, setOpenExportWidget}}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};