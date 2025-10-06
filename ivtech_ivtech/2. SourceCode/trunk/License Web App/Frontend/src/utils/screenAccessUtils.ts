import { usePermissions } from "../context/PermissionsContext";

export const filterByScreenName = (children: any[], screenName: string) => {
  return children.filter((child) => child.screenName.trim() === screenName);
};

// const hasPermission = (
//   permissions: any[],
//   screenKey: string,
//   screenMappings: Record<string, string>
// ): boolean => {
//   const screenName = screenMappings[screenKey]; // Convert the key to a screen name
//   return permissions.some(
//     (perm) => perm.screenName.toLowerCase() === screenName.toLowerCase()
//   );
// };

const HasPermission = (screenKey: string): boolean => {
  const { permissions } = usePermissions(); // ✅ Allowed inside a custom hook

  return permissions.some((perm: any) => perm?.screenName === screenKey);
};

export  {HasPermission};