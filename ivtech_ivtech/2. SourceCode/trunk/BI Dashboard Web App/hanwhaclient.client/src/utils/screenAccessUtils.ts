

// export const filterByScreenName = (children: any[], screenName: string) => {
//   return children.filter((child) => child.screenName.trim() === screenName);
// };


import { usePermissions } from "../context/PermissionsContext";

const HasPermission = (screenKey: string): boolean => {
  const { permissions } = usePermissions(); // ✅ Allowed inside a custom hook

  return permissions.some((perm: any) => perm?.screenName === screenKey);

};

export const useHasPermission = (screenKey: string): boolean => {
  const { permissions } = usePermissions();

  return Array.isArray(permissions) 
    ? permissions.some((perm: any) => perm?.screenName === screenKey)
    : false;
};

const HasWidgetPermission = (widgetKey: string): boolean => {
  const { widgetPermissions } = usePermissions();

  return widgetPermissions.some((perm: any) => perm?.widgetName === widgetKey);
};

 const checkWidgetPermission = () => {
  const { widgetPermissions } = usePermissions();

  return (widgetKey: string): boolean => {
    return widgetPermissions.some((perm: any) => perm?.widgetName === widgetKey);
  };


}

export { HasPermission, HasWidgetPermission, checkWidgetPermission };