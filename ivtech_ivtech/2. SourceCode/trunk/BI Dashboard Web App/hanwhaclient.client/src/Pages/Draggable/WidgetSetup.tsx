import React, { useEffect, useState } from "react";
// import {
//   CommonDialog,
//   CustomButton,
//   CustomSelect,
//   CustomEditableWidgetName,
// } from "../../components";
import { CommonDialog } from "../../components/Reusable/CommonDialog";
import { CustomButton } from "../../components/Reusable/CustomButton";
import { CustomSelect } from "../../components/Reusable/CustomSelect";
import { CustomEditableWidgetName } from "../../components/Reusable/CustomEditableWidgetName";
import { Box, Typography } from "@mui/material";
import {
  // ISelectedDevicesHeatmap,
  WidgetSetUpProps,
  IdeviceList,
} from "../../interfaces/IChart";
import CustomMultiSelectList from "../../components/Reusable/CustomMultiSelectList";
// import { useUser } from "../../context/UserContext";
import { GetAllFloorService } from "../../services/floorPlanService";
import { ILookup } from "../../interfaces/ILookup";
import { useForm } from "react-hook-form";
import { useThemeContext } from "../../context/ThemeContext";

const WidgetSetup: React.FC<WidgetSetUpProps> = ({
  item,
  openSetup,
  onClose,
  onApply,
  onChangeWidgetName,
}) => {
  const [selectedSize, setSelectedSize] = useState(
    item?.size ? item?.size : "1x1"
  );
  const [selectedExpanded, setSelectedExpanded] = useState(
    item?.expanded ? item?.expanded : "Option1"
  );
  const [imageErrors, setImageErrors] = useState({});
  const [isImageVisible, setIsImageVisible] = useState(true);

  const [floorList, setFloorList] = useState<ILookup[]>([]);
  const [deivceListforPVCount, setDeivceListforPVCount] = useState<
    IdeviceList[]
  >([]);

  const [deivceListforHeatMap, setDeivceListforHeatMap] = useState<
    IdeviceList[]
  >([]);
  const { theme } = useThemeContext();

  //const [selectedDeviceIds, setSelectedDeviceIds] = useState<{ deviceId: string; channelNo: number }[]>([]);
  // const {
  //   selectedCameraHeatMap,
  //   setSelectedCameraHeatMap,
  //   selectedForkliftHeatMap,
  //   setSelectedForkliftHeatMap,
  //   selectedShoppingHeatMap,
  //   setSelectedShoppingHeatMap,
  //   selectedPeopleCountingHeatMap,
  //   setSelectedPeopleCountingHeatMap,
  // } = useUser();
  //const selectDeviceIds = item.chartName == 'Vehicle Detection Heatmap' ? selectedCameraHeatMap : item.chartName == 'Forklift Heatmap' ? selectedForkliftHeatMap : item.chartName == 'Shopping Cart Heatmap' ? selectedShoppingHeatMap : [];
  // const heatmapMap: Record<string, ISelectedDevicesHeatmap[]> = {
  //   "Vehicle Detection Heatmap": selectedCameraHeatMap,
  //   "Forklift Heatmap": selectedForkliftHeatMap,
  //   "Shopping Cart Heatmap": selectedShoppingHeatMap,
  //   "People Counting Heatmap": selectedPeopleCountingHeatMap,
  // };

  // const selectDeviceIds = heatmapMap[item.chartName] || [];

  //Light theme paths
  const PreviewImgSrc_1x1webp = `/images/dashboard/${item.chartName.replace(
    /[^a-zA-Z0-9]/g,
    "_"
  )}_${selectedSize}.webp`;

  
  const PreviewImgSrcwebp = `/images/dashboard/${item.chartName.replace(
    /[^a-zA-Z0-9]/g,
    "_"
  )}_Selected_${selectedSize}_${selectedExpanded}.webp`;

  //Dark theme paths
  const DarkPreviewImgSrc_1x1webp = `/images/dark-theme/dashboard/${item.chartName.replace(
    /[^a-zA-Z0-9]/g,
    "_"
  )}_${selectedSize}.webp`;
  const DarkPreviewImgSrcwebp = `/images/dark-theme/dashboard/${item.chartName.replace(
    /[^a-zA-Z0-9]/g,
    "_"
  )}_Selected_${selectedSize}_${selectedExpanded}.webp`;

  const { control, watch } = useForm({
    defaultValues: {
      selectedFloor: "",
    },
  });

  const selectedFloor = watch("selectedFloor");

  useEffect(() => {
    if (item.chartName == "People" || item.chartName == "Vehicle") {
      fetchFloorData();
    }
  }, []);

  const fetchFloorData = async () => {
    try {
      const response = await GetAllFloorService();

      const floorData = response?.map((item) => ({
        title: item.floorPlanName,
        id: item.id,
      }));
      setFloorList(floorData as ILookup[]);
    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    }
  };

  //  const handlechangeWidgetName = (widgetName: string, chartID: number) => {
  //     setLayouts((prevLayouts: Layouts) => ({
  //       ...prevLayouts,
  //       lg: prevLayouts?.lg?.map((layout) => {
  //         if (layout.chartID === chartID) {
  //           return {
  //             ...layout,
  //             displayName: widgetName,
  //           };
  //         }
  //         return layout;
  //       }),
  //     }));
  //   };

  return (
    <>
      <CommonDialog
        open={openSetup}
        // title={"hello"}
        // title={item.chartName}
        title={
          <CustomEditableWidgetName
            displayName={item.displayName}
            onChangeWidgetName={(name) => onChangeWidgetName?.(name)}
          />
        }
        fullWidth={true}
        maxWidth={"lg"}
        customClass="custom-setup-main-pop"
        content={
          <Box className="custom-setup-pop-data">
            {/* Left Section */}
            <Box className="custom-setup-pop-data-left">
              <div className="custom-set-pop-left-inner">
                {item.chartName != "Vehicle Detection Heatmap" &&
                  item.chartName != "Forklift Heatmap" &&
                  item.chartName != "Shopping Cart Heatmap" &&
                  item.chartName != "People Counting Heatmap" && (
                    <>
                      <Typography variant="subtitle1" fontWeight={600} mb={2}>
                        Size
                      </Typography>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        {["1x1", "2x1", "3x1"].map((size) => {
                          const isDisabled =
                            size === "3x1" &&
                            item.chartName !== "Average People Counting" &&
                            item.chartName !== "Gender";
                          const sizeImageSrc =
                            theme === "light"
                              ? `/images/dashboard/${size}.webp`
                              : `/images/dark-theme/dashboard/${size}.webp`;
                          const selectedSizeImageSrc =
                            theme === "light"
                              ? `/images/dashboard/Selected_${size}.webp`
                              : `/images/dark-theme/dashboard/Selected_${size}.webp`;

                          return (
                            <Box
                              key={size}
                              onClick={() => {
                                if (isDisabled) return; // prevent click
                                setSelectedSize(size);
                                setSelectedExpanded("Option1");
                                setImageErrors({});
                                setIsImageVisible(true);
                              }}
                              sx={{
                                cursor: isDisabled ? "not-allowed" : "pointer",
                                opacity: isDisabled ? 0.4 : 1,
                                pointerEvents: isDisabled ? "none" : "auto", // optional: disables hover/click
                                // cursor: "pointer",
                                transition: "all 0.2s ease",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                              }}
                            >
                              {selectedSize === size ? (
                                <img
                                  src={selectedSizeImageSrc}
                                  alt={selectedSizeImageSrc}
                                />
                              ) : (
                                <img src={sizeImageSrc} alt={sizeImageSrc} />
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </>
                  )}
                {(item.chartName == "Vehicle Detection Heatmap" ||
                  item.chartName == "Forklift Heatmap" ||
                  item.chartName == "Shopping Cart Heatmap" ||
                  item.chartName == "People Counting Heatmap") && (
                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        mt={4}
                        mb={2}
                      >
                        Select Camera
                      </Typography>
                      <CustomMultiSelectList
                        // initialSelection={selectDeviceIds}
                        initialSelection={item.deivceListforHeatMap}
                        features={"heatmap"}
                        floorId={null}
                        onSelectionChange={(ids) => {
                          setDeivceListforHeatMap(ids);
                          // if (item.chartName == "Vehicle Detection Heatmap")
                          //   setSelectedCameraHeatMap(ids);
                          // if (item.chartName == "Forklift Heatmap")
                          //   setSelectedForkliftHeatMap(ids);
                          // if (item.chartName == "Shopping Cart Heatmap")
                          //   setSelectedShoppingHeatMap(ids);
                          // if (item.chartName == "People Counting Heatmap")
                          //   setSelectedPeopleCountingHeatMap(ids);
                        }}
                        widgetType={
                          item.chartName === "Shopping Cart Heatmap" ? "ShoppingCartHeatMap" :
                            item.chartName === "Forklift Heatmap" ? "ForkliftHeatMap" :
                              item.chartName === "Vehicle Detection Heatmap" ? "VehicleHeatMap" :
                                item.chartName === "People Counting Heatmap" ? "PeopleHeatMap" :
                                  ""
                        }
                      />
                    </Box>
                  )}

                {item.chartName != "Vehicle Detection Heatmap" &&
                  item.chartName != "Forklift Heatmap" &&
                  item.chartName != "Shopping Cart Heatmap" &&
                  item.chartName != "People Counting Heatmap" &&
                  selectedSize != "1x1" && (
                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        mt={4}
                        mb={2}
                      >
                        Expanded
                      </Typography>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        {["Option1", "Option2", "Option3","Option4"].map((key) => {
                          const expandedOptionImageSrc =
                            theme === "light"
                              ? `/images/dashboard/${item.chartName.replace(
                                /[^a-zA-Z0-9]/g,
                                "_"
                              )}_${selectedSize}_${key}.webp`
                              : `/images/dark-theme/dashboard/${item.chartName.replace(
                                /[^a-zA-Z0-9]/g,
                                "_"
                              )}_${selectedSize}_${key}.webp`;

                          const hasError = imageErrors[key];

                          if (hasError) return null;

                          return (
                            <Box
                              key={key}
                              onClick={() => setSelectedExpanded(key)}
                              sx={{
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                border:
                                  selectedExpanded === key
                                    ? "1px solid #FF8A01"
                                    : null,
                                borderRadius: 5,
                                opacity: hasError ? 0.5 : 1,
                                pointerEvents: hasError ? "none" : "auto", // disable interaction
                              }}
                            >
                              <img
                                src={expandedOptionImageSrc}
                                alt={expandedOptionImageSrc}
                                onError={(e) => {
                                  setImageErrors((prev) => ({
                                    ...prev,
                                    [key]: true,
                                  }));
                                }}
                              />
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  )}

                {(item.chartName == "People" ||
                  item.chartName == "Vehicle") && (
                    <Box className="select-floor-wid-pop">
                      <Typography variant="subtitle1">Floor Plan</Typography>
                      <CustomSelect
                        name="selectedFloor"
                        variant="filled"
                        control={control}
                        // label="Feature"
                        options={floorList}
                        placeholder="Select floor plan"
                      />
                      <Box className="select-floor-wid-pop-cameras">
                        <Typography variant="h6">Cameras</Typography>
                        <Box className="select-floor-wid-pop-cameras-select">
                          {selectedFloor && (
                            <CustomMultiSelectList
                              initialSelection={item.deivceListforPVCount}
                              features={`${item.chartName}Count`}
                              floorId={selectedFloor}
                              onSelectionChange={(ids) => {
                                setDeivceListforPVCount(ids as IdeviceList[]);
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )}
              </div>
              <Box className="analysis-buttons">
                <CustomButton
                  variant="outlined"
                  onClick={onClose}
                  className="common-btn-design common-btn-design-transparent"
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  variant="contained"
                  className="common-btn-design"
                  onClick={() =>
                    onApply?.(
                      selectedSize,
                      selectedExpanded,
                      deivceListforPVCount,
                      deivceListforHeatMap
                    )
                  }
                >
                  Apply
                </CustomButton>
              </Box>
            </Box>

            {/* Right Section */}

            <Box className="custom-setup-pop-data-right">
              {selectedSize === "1x1" ? (
                <img
                  src={
                    theme === "light"
                      ? PreviewImgSrc_1x1webp
                      : DarkPreviewImgSrc_1x1webp
                  }
                  alt={
                    theme === "light"
                      ? PreviewImgSrc_1x1webp
                      : DarkPreviewImgSrc_1x1webp
                  }
                  onError={(e) => {
                    e.target.src =
                      theme === "light"
                        ? PreviewImgSrc_1x1webp
                        : DarkPreviewImgSrc_1x1webp;
                  }}
                />
              ) : (
                isImageVisible && (
                  <img
                    src={
                      theme === "light"
                        ? PreviewImgSrcwebp
                        : DarkPreviewImgSrcwebp
                    }
                    alt={
                      theme === "light" ? PreviewImgSrcwebp : DarkPreviewImgSrcwebp
                    }
                    //onError={() => setIsImageVisible(false)}
                    onError={(e) => {
                      e.target.src =
                        theme === "light"
                          ? PreviewImgSrcwebp
                          : DarkPreviewImgSrcwebp;
                    }}
                  />
                )
              )}
            </Box>
          </Box>
        }
        onConfirm={() =>
          onApply?.(
            selectedSize,
            selectedExpanded,
            deivceListforPVCount,
            deivceListforHeatMap
          )
        }
        onCancel={onClose}
        // confirmText="Apply"
        // cancelText="Cancel"

        hideActions={true}
      />
    </>
  );
};

export { WidgetSetup };
