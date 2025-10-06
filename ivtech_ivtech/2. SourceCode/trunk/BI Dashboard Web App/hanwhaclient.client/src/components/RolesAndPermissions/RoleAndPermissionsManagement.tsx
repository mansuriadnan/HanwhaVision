import React, { useEffect, useState } from "react";
import {
  FloorZoneRes,
  ISaveFloorZonedata,
  ISaveWidgetData,
  RolePermissionLastResponse,
  WidgetListRes,
} from "../../interfaces/IRolePermission";
import {
  GetAllRolePermission,
  GetFloorZonedataService,
  GetRoleScreenWidgetsService,
  SaveFloorZonedataService,
  SaveRolePermissionService,
  SaveWidgetsDataService,
} from "../../services/roleService";
import { showToast } from "../Reusable/Toast";
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Grid,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { HasPermission } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";
import { usePermissions } from "../../context/PermissionsContext";
import { CustomButton } from "../Reusable/CustomButton";

interface RoleAndPermissionsManagementProps {
  selectedRoleId: string;
}

export const RoleAndPermissionsManagement: React.FC<RoleAndPermissionsManagementProps> =
  React.memo(({ selectedRoleId }) => {
    const [permissions1, setPermissions1] = useState<
      RolePermissionLastResponse[]
    >([]);
    const [isOpenPermissions, setIsOpenPermissions] = useState<boolean>(false);
    const [errors, setErrors] = useState<{
      rolename?: string;
      permission?: string;
    }>({});
    // const [activeTab, setActiveTab] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState();
    const [floorAndZoneData, setFloorAndZoneData] = useState<FloorZoneRes[]>(
      []
    );
    const [widgetsListData, setWidgetsListData] = useState<WidgetListRes[]>([]);
    const [originalScreensPermissions, setOriginalScreensPermissions] =
      useState<RolePermissionLastResponse[]>([]);
    const [originalFloorZonesPermissions, setOriginalFloorZonesPermissions] =
      useState<FloorZoneRes[]>([]);
    const [originalWidgetsPermissions, setOriginalWidgetsPermissions] =
      useState<WidgetListRes[]>([]);

    const { permissions } = usePermissions();

    const hasPermission = (screenKey: string) => {
      return permissions.some((perm: any) => perm?.screenName === screenKey);
    };

    useEffect(() => {
      const availableTabs: number[] = [];

      if (hasPermission(LABELS.View_and_Assign_ScreenLevel_Permissions)) {
        availableTabs.push(0);
      }
      if (hasPermission(LABELS.View_and_Assign_Floor_Zone_Level_Permissions)) {
        availableTabs.push(1);
      }
      if (hasPermission(LABELS.View_and_Assign_Widget_Level_Permissions)) {
        availableTabs.push(2);
      }

      if (availableTabs.length > 0) {
        setActiveTab(availableTabs[0]); // Set the first available tab
      }
    }, []);

    useEffect(() => {
      if (selectedRoleId !== null && selectedRoleId !== "") {
        fetchData();
        fetchFloorZonedata();
        fetchWidgetsData();
      }
    }, [selectedRoleId]);

    const fetchData = async () => {
      const response = await GetAllRolePermission(selectedRoleId);
      if (response != null) {
        const { data, referenceData } = response;
        if (
          referenceData &&
          "screensMapping" in referenceData &&
          Array.isArray(referenceData.screensMapping)
        ) {
          const screensMapping = referenceData.screensMapping;

          // Map the data to construct permissions
          const mappedPermissions: RolePermissionLastResponse[] = data
            .map((item: any): RolePermissionLastResponse => {
              const matchingScreen = screensMapping.find(
                (screen) => screen.value === item.id
              );

              return {
                id: item.id,
                screenName: item.screenName,
                order: item.order,
                // isParent: item.isParent,
                accessAllowed: matchingScreen?.label || false,
                parentsScreenId: item?.parentsScreenId || null,
                screenId: matchingScreen?.value || null,
              };
            })
            .sort((a, b) => a.order - b.order);

          setIsOpenPermissions(true);
          setPermissions1(mappedPermissions);
          setOriginalScreensPermissions(
            JSON.parse(JSON.stringify(mappedPermissions))
          );
        }
      }
    };

    const fetchFloorZonedata = async () => {
      try {
        const response = await GetFloorZonedataService(selectedRoleId);
        if (response != null) {
          setFloorAndZoneData(response as FloorZoneRes[]);
          setIsOpenPermissions(true);
          setOriginalFloorZonesPermissions(
            JSON.parse(JSON.stringify(response))
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchWidgetsData = async () => {
      try {
        const response = await GetRoleScreenWidgetsService(selectedRoleId);
        if (response != null) {
          setWidgetsListData(response as WidgetListRes[]);
          setIsOpenPermissions(true);
          setOriginalWidgetsPermissions(JSON.parse(JSON.stringify(response)));
        }
      } catch (err) {
        console.error(err);
      }
    };

    const handlePermissionToggle = (id: string) => {
      setPermissions1((prevPermissions) => {
        const updatedPermissions = prevPermissions.map((perm) =>
          perm.id === id
            ? { ...perm, accessAllowed: !perm.accessAllowed }
            : perm
        );

        const toggledPermission = updatedPermissions.find(
          (perm) => perm.id === id
        );

        if (toggledPermission) {
          if (toggledPermission.parentsScreenId === null) {
            updatedPermissions.forEach((perm) => {
              if (perm.parentsScreenId === toggledPermission.id) {
                perm.accessAllowed = toggledPermission.accessAllowed;
              }
            });
          } else {
            const parentPermission = updatedPermissions.find(
              (perm) =>
                perm.parentsScreenId === null &&
                perm.id === toggledPermission.parentsScreenId
            );

            if (parentPermission) {
              const siblings = updatedPermissions.filter(
                (perm) =>
                  perm.parentsScreenId !== null &&
                  perm.parentsScreenId === toggledPermission.parentsScreenId
              );

              parentPermission.accessAllowed = siblings.some(
                (sibling) => sibling.accessAllowed
              );
            }
          }
        }

        return updatedPermissions;
      });
    };

    const validateForm = () => {
      const newErrors: typeof errors = {};

      const hasSelectedPermission = permissions1.some(
        (perm) => perm.accessAllowed
      );

      if (!hasSelectedPermission) {
        newErrors.permission = "At least one permission must be selected";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
      try {
        if (!validateForm()) return;

        const mappingsToSave = permissions1.map((perm) => ({
          id: perm.id,
          roleId: selectedRoleId,
          screenId: perm?.screenId ?? perm.id,
          accessAllowed: perm.accessAllowed,
        }));

        const data = await SaveRolePermissionService(mappingsToSave);

        if (typeof data === "string") {
          showToast("Error occurred:", "error");
        } else if (data?.isSuccess) {
          showToast(data.message, "success");
          setIsOpenPermissions(true);
          setOriginalScreensPermissions(
            JSON.parse(JSON.stringify(permissions1))
          );
        } else {
          console.warn("Unexpected response:", data);
        }
      } catch (error) {
        console.error("Error in handleSave:", error);
        showToast("An error occurred while saving the permissions.", "error");
      }
    };

    const handleChange = (event, newValue) => {
      setActiveTab(newValue);
    };

    const isPermissionChanged = () => {
      return (
        JSON.stringify(permissions1) !==
        JSON.stringify(originalScreensPermissions)
      );
    };
    const isFloorZonePermissionChanged = () => {
      return (
        JSON.stringify(floorAndZoneData) !==
        JSON.stringify(originalFloorZonesPermissions)
      );
    };
    const isWidgetPermissionChanged = () => {
      return (
        JSON.stringify(widgetsListData) !==
        JSON.stringify(originalWidgetsPermissions)
      );
    };
    const ScreenPermissionList = () => {
      return (
        <div className="roles_and_permissions_tabs">
          <Box className="roles-and-permissions-content-wrapper">
            {permissions1
              .filter((permission) => permission.parentsScreenId === null)
              .map((parentPermission) => (
                <Card
                  key={parentPermission.id}
                  sx={{ mb: 2, borderRadius: 2, boxShadow: 3 }}
                >
                  <Box className="user-master">
                    <Typography variant="h6" color="white">
                      {parentPermission.screenName}
                    </Typography>
                    <Checkbox
                      checked={parentPermission.accessAllowed}
                      onChange={() =>
                        handlePermissionToggle(parentPermission.id)
                      }
                      // disabled={filteredEdit.length === 0}
                      disabled={
                        !HasPermission(
                          LABELS.View_and_Assign_ScreenLevel_Permissions
                        )
                      }
                      sx={{
                        "& .MuiSvgIcon-root": {
                          color: "white", // Change the check icon color if needed
                        },
                      }}
                    />
                  </Box>
                  <CardContent>
                    {(() => {
                      const childPermissions = permissions1.filter(
                        (childPermission) =>
                          childPermission.parentsScreenId ===
                          parentPermission.id
                      );

                      return childPermissions.length > 0
                        ? childPermissions.map((childPermission) => (
                            <Grid
                              key={childPermission.id}
                              container
                              alignItems="center"
                              justifyContent="space-between"
                              sx={{ mb: 1 }}
                            >
                              <Typography>
                                {childPermission.screenName}
                              </Typography>
                              <Checkbox
                                checked={childPermission.accessAllowed}
                                onChange={() =>
                                  handlePermissionToggle(childPermission.id)
                                }
                                disabled={
                                  !HasPermission(
                                    LABELS.View_and_Assign_Floor_Zone_Level_Permissions
                                  )
                                }
                                sx={{
                                  "& .MuiSvgIcon-root": {
                                    color: "#FE6500",
                                  },
                                }}
                              />
                            </Grid>
                          ))
                        : null;
                    })()}
                  </CardContent>
                </Card>
              ))}

            {errors.permission && (
              <Typography color="error" variant="body2" sx={{ mt: 2, mb: 2 }}>
                {errors.permission}
              </Typography>
            )}
          </Box>
          <CustomButton
            className="common-btn-design"
            onClick={handleSave}
            fullWidth
            customStyles={{ mt: 3, mb: 2 }}
            disabled={
              !isPermissionChanged() ||
              !HasPermission(LABELS.View_and_Assign_ScreenLevel_Permissions)
            }
          >
            Save the changes
          </CustomButton>
        </div>
      );
    };

    const FloorandZoneList = () => {
      return (
        <div className="roles_and_permissions_tabs">
          <Box className="roles-and-permissions-content-wrapper">
            {floorAndZoneData && floorAndZoneData.length > 0 ? (
              floorAndZoneData.map((floor) => (
                <Card
                  key={floor.floorId}
                  sx={{ mb: 2, borderRadius: 2, boxShadow: 3 }}
                >
                  <Box className="user-master">
                    <Typography variant="h6" color="white">
                      {floor.floorPlanName}
                    </Typography>
                    {floor.zones.length > 0 && (
                      <Checkbox
                        checked={floor.accessAllowed}
                        onChange={() => handleFloorToggle(floor.floorId)}
                        // sx={{ color: "white", }}
                        sx={{
                          "& .MuiSvgIcon-root": {
                            color: "white", // Change the check icon color if needed
                          },
                        }}
                      />
                    )}
                  </Box>
                  <CardContent>
                    {floor.zones.length > 0 ? (
                      floor.zones.map((zone) => (
                        <Grid
                          key={zone.zoneId}
                          container
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mb: 1 }}
                        >
                          <Typography>{zone.zoneName}</Typography>
                          <Checkbox
                            checked={zone.accessAllowed}
                            onChange={() =>
                              handleZoneToggle(floor.floorId, zone.zoneId)
                            }
                            // sx={{ color: "orange" }}
                            sx={{
                              "& .MuiSvgIcon-root": {
                                color: "#FE6500",
                              },
                            }}
                          />
                        </Grid>
                      ))
                    ) : (
                      <Typography color="gray">No zones available</Typography>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography
                sx={{
                  textAlign: "center",
                  color: "gray",
                  fontSize: "16px",
                  mt: 2,
                }}
              >
                No data available. Please create a Floor Plan and Zones to
                configure permissions
              </Typography>
            )}
          </Box>
          {floorAndZoneData && floorAndZoneData.length > 0 && (
            <CustomButton
              className="common-btn-design"
              onClick={SaveFloorZonedata}
              fullWidth
              customStyles={{ mt: 3, mb: 2 }}
              disabled={
                !isFloorZonePermissionChanged() ||
                !HasPermission(
                  LABELS.View_and_Assign_Floor_Zone_Level_Permissions
                )
              }
            >
              Save the changes
            </CustomButton>
          )}
        </div>
      );
    };

    const WidgetList = () => {
      return (
        <div className="roles_and_permissions_tabs">
          <Box className="roles-and-permissions-content-wrapper">
            {widgetsListData?.map((category) => (
              <Card
                key={category.id}
                sx={{ mb: 2, borderRadius: 2, boxShadow: 3 }}
              >
                <Box className="user-master">
                  <Typography variant="h6" color="white">
                    {category.categoryName}
                  </Typography>
                  {category.widgets?.length > 0 && (
                    <Checkbox
                      checked={category.accessAllowed}
                      onChange={() => handleWidgetCategoryToggle(category.id)}
                      sx={{
                        "& .MuiSvgIcon-root": {
                          color: "white",
                        },
                      }}
                    />
                  )}
                </Box>
                <CardContent>
                  {category.widgets?.length > 0 ? (
                    category.widgets.map((widget) => (
                      <Grid
                        key={widget.widgetId}
                        container
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mb: 1 }}
                      >
                        <Typography>{widget.widgetName}</Typography>
                        <Checkbox
                          checked={widget.accessAllowed}
                          onChange={() =>
                            handleWidgetToggle(category.id, widget.widgetId)
                          }
                          sx={{
                            "& .MuiSvgIcon-root": {
                              color: "#FE6500",
                            },
                          }}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Typography color="gray">No Widgets available</Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
          <CustomButton
            className="common-btn-design"
            onClick={SaveWidgetsData}
            fullWidth
            customStyles={{ mt: 3, mb: 2 }}
            disabled={
              !isWidgetPermissionChanged() ||
              !HasPermission(LABELS.View_and_Assign_Widget_Level_Permissions)
            }
          >
            Save the changes
          </CustomButton>
        </div>
      );
    };

    const handleWidgetCategoryToggle = (widgetCategoryId: string) => {
      setWidgetsListData((prevWidgetCategory) =>
        prevWidgetCategory.map((category) =>
          category.id === widgetCategoryId
            ? {
                ...category,
                accessAllowed: !category.accessAllowed,
                widgets: category.widgets.map((widget) => ({
                  ...widget,
                  accessAllowed: !category.accessAllowed,
                })),
              }
            : category
        )
      );
    };

    const handleWidgetToggle = (widgetCategoryId: string, widgetId: string) => {
      setWidgetsListData((prevWidgetCategory) =>
        prevWidgetCategory.map((category) => {
          if (category.id === widgetCategoryId) {
            const updatedWidgets = category.widgets.map((widget) =>
              widget.widgetId === widgetId
                ? { ...widget, accessAllowed: !widget.accessAllowed }
                : widget
            );

            const isAnyWidgetSelected = updatedWidgets.some(
              (widget) => widget.accessAllowed
            );

            return {
              ...category,
              accessAllowed: isAnyWidgetSelected,
              widgets: updatedWidgets,
            };
          }
          return category;
        })
      );
    };

    const handleFloorToggle = (floorId: string) => {
      setFloorAndZoneData((prevFloors) =>
        prevFloors.map((floor) =>
          floor.floorId === floorId
            ? {
                ...floor,
                accessAllowed: !floor.accessAllowed,
                zones: floor.zones.map((zone) => ({
                  ...zone,
                  accessAllowed: !floor.accessAllowed,
                })),
              }
            : floor
        )
      );
    };

    const handleZoneToggle = (floorId: string, zoneId: string) => {
      setFloorAndZoneData((prevFloors) =>
        prevFloors.map((floor) => {
          if (floor.floorId === floorId) {
            const updatedZones = floor.zones.map((zone) =>
              zone.zoneId === zoneId
                ? { ...zone, accessAllowed: !zone.accessAllowed }
                : zone
            );

            // If any zone is selected, select the floor; if all are deselected, unselect the floor
            const isAnyZoneSelected = updatedZones.some(
              (zone) => zone.accessAllowed
            );

            return {
              ...floor,
              accessAllowed: isAnyZoneSelected,
              zones: updatedZones,
            };
          }
          return floor;
        })
      );
    };

    const SaveFloorZonedata = async () => {
      const dataAccessPermissions = floorAndZoneData
        .filter((floor) => floor.accessAllowed) // Filter floors with accessAllowed = true
        .map((floor) => ({
          floorId: floor.floorId,
          zoneIds: floor.zones
            .filter((zone) => zone.accessAllowed) // Filter zones with accessAllowed = true
            .map((zone) => zone.zoneId),
        }));

      const param = {
        roleId: selectedRoleId,
        dataAccessPermissions: dataAccessPermissions,
      };

      try {
        await SaveFloorZonedataService(param as ISaveFloorZonedata);
        setOriginalFloorZonesPermissions(
          JSON.parse(JSON.stringify(floorAndZoneData))
        );
      } catch (err) {
        console.error("error", err);
      }
    };

    const SaveWidgetsData = async () => {
      const widgetAccessPermissions = widgetsListData
        .filter((widgetCatergory) => widgetCatergory.accessAllowed)
        .map((widgetCatergory) => ({
          widgetCategoryId: widgetCatergory.id,
          widgetIds: widgetCatergory.widgets
            .filter((widget) => widget.accessAllowed)
            .map((widget) => widget.widgetId),
        }));

      const param = {
        roleId: selectedRoleId,
        widgetAccessPermissions: widgetAccessPermissions,
      };

      try {
        await SaveWidgetsDataService(param as ISaveWidgetData);
        setOriginalWidgetsPermissions(
          JSON.parse(JSON.stringify(widgetsListData))
        );
      } catch (err) {
        console.error("error", err);
      }
    };

    if (activeTab === null) return null;
    return (
      <Box className="roles-permissions-tab-main roles-permissions-no-data">
        {isOpenPermissions && (
          <Box className="roles-permissions-tab-wrapper">
            <Tabs
              value={activeTab}
              onChange={handleChange}
              className="roles-premissons-tabs"
            >
              {HasPermission(
                LABELS.View_and_Assign_ScreenLevel_Permissions
              ) && <Tab label="Screens" sx={{ fontSize: 20 }} />}
              {HasPermission(
                LABELS.View_and_Assign_Floor_Zone_Level_Permissions
              ) && <Tab label="Floor & Zones" sx={{ fontSize: 20 }} />}
              {HasPermission(
                LABELS.View_and_Assign_Widget_Level_Permissions
              ) && <Tab label="Widgets" sx={{ fontSize: 20 }} />}
            </Tabs>
            <Box className="permissions-allow-head">
              <Typography sx={{ fontSize: 20, ml: 5 }}>Permissions</Typography>
              <Typography sx={{ fontSize: 20, mr: 5 }}>Is Allowed</Typography>
            </Box>
            <Box className="roles-premissons-tabs-content">
              {activeTab === 0 && ScreenPermissionList()}
              {activeTab === 1 && FloorandZoneList()}
              {activeTab === 2 && WidgetList()}
            </Box>
          </Box>
        )}
      </Box>
    );
  });
