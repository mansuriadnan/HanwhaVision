import { useState } from "react";
import { login } from "../services/loginService";
import { usePermissions } from "../context/PermissionsContext";
import { GetUserPermissions, GetUserProfileDetails } from "../services/userService";
import { useUser } from "../context/UserContext";
import { IProfileReferenceData, IUsers } from "../interfaces/IGetAllUsers";

export const useAuth = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { setPermissions } = usePermissions();
  const {setUser, setReferenceData} = useUser();

  // const handleLogin = async (userName: string, password: string) => {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const response = await login(userName, password);

  //     if (response.isSuccess) {
  //       if (response.data) {
  //         localStorage.setItem("accessToken", response.data?.accessToken);
  //         localStorage.setItem("refreshToken", response.data?.refreshToken);

  //         const PermissionData: any = await GetUserPermissions();
  //         if (Array.isArray(PermissionData) && PermissionData.length > 0) {
  //           setPermissions(PermissionData as Object[] || []);
  //           localStorage.setItem("permissions", JSON.stringify(PermissionData)); // Store in localStorage
  //         } else {
  //           setPermissions([]);
  //           localStorage.setItem("permissions", JSON.stringify([])); // Store empty array explicitly
  //         }
          
  //         const userProfileDetails: any = await GetUserProfileDetails();

  //         if(userProfileDetails){
  //           const userData = userProfileDetails.data as IUsers;
  //           const referenceData = userProfileDetails.referenceData as IProfileReferenceData;

  //           setUser(userData);
  //           setReferenceData(referenceData);

  //           localStorage.setItem("userProfile", JSON.stringify(userData));
  //           localStorage.setItem("userProfileReferenceData", JSON.stringify(referenceData));
  //         }
          
  //         // if (PermissionData) {
  //         //   const filteredData = await transformData(PermissionData)
  //         //   console.log("filteredData->",filteredData);
  //         //   setPermissions(filteredData || []);
  //         //   setLoading(false);
  //         // }
  //       }
  //       return { success: true }; // Login was successful
  //     } else {
  //       const errorMessage =
  //         response?.message || "An unknown error occurred. Please try again.";
  //       setError(errorMessage);
  //       return { success: false, errorMessage };
  //     }
  //   } catch (error: any) {
  //     setLoading(false);
  //     const errorMessage =
  //       error?.message || "An unknown error occurred. Please try again.";
  //     setError(errorMessage);
  //     return { success: false, errorMessage }; // Return error message immediately
  //   }
  // };


  // const transformData = (response: any) => {

  //   // Filter parent screens
  //   const parents = response.filter((item) => item.parentsScreenId === null);

  //   // Group children by parent ID
  //   const childrenGroupedByParent = response
  //     .filter((item) => item.parentsScreenId && item.parentsScreenId !== null  )
  //     .reduce((acc, child) => {
  //       if (!acc[child.parentsScreenId]) {
  //         acc[child.parentsScreenId] = [];
  //       }
  //       acc[child.parentsScreenId].push(child);
  //       return acc;
  //     }, {});

  //   // Attach children to their respective parent
  //   const result = parents.map((parent) => ({
  //     ...parent,
  //     children: childrenGroupedByParent[parent.id] || [],
  //   }));

  //   return result;
  // };

  const handleLogin = async (userName: string, password: string) => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await login(userName, password);
  
      if (response.isSuccess && response.data) {
        localStorage.setItem("accessToken", response.data?.accessToken);
        localStorage.setItem("refreshToken", response.data?.refreshToken);
  
        const PermissionData: any = await GetUserPermissions();
        let permissionsArray: Object[] = [];
  
        if (Array.isArray(PermissionData) && PermissionData.length > 0) {
          permissionsArray = PermissionData;
          setPermissions(PermissionData);
        } else {
          setPermissions([]);
        }
        localStorage.setItem("permissions", JSON.stringify(permissionsArray));
  
        const userProfileDetails: any = await GetUserProfileDetails();
        if (userProfileDetails) {
          const userData = userProfileDetails.data as IUsers;
          const referenceData = userProfileDetails.referenceData as IProfileReferenceData;
  
          setUser(userData);
          setReferenceData(referenceData);
  
          localStorage.setItem("userProfile", JSON.stringify(userData));
          localStorage.setItem("userProfileReferenceData", JSON.stringify(referenceData));
        }
  
        return { success: true, permissions: permissionsArray }; // Return permissions here
      } else {
        const errorMessage =
          response?.message || "An unknown error occurred. Please try again.";
        setError(errorMessage);
        return { success: false, errorMessage, permissions: [] };
      }
    } catch (error: any) {
      setLoading(false);
      const errorMessage =
        error?.message || "An unknown error occurred. Please try again.";
      setError(errorMessage);
      return { success: false, errorMessage, permissions: [] };
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
  };

  return { handleLogin, handleLogout, loading, error };
};