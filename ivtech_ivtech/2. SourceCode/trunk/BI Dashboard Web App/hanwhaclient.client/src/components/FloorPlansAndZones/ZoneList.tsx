import React, { useEffect, useState } from "react";
import { Box, Drawer, Grid, IconButton } from "@mui/material";
import { useForm } from "react-hook-form";
import { GridCloseIcon } from "@mui/x-data-grid";
import { COMMON_CONSTANTS, REGEX } from "../../utils/constants";
// import { REGEX } from "../../utils/constants";
import {
  IZoneList,
  XyPosition,
  ZoneListProps,
} from "../../interfaces/IFloorAndZone";
import {
  GetAllZoneByFloorIdService,
  AddZoneService,
  DeleteZoneService,
} from "../../services/floorPlanService";
import { HasPermission } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";
import { CommonDialog } from "../Reusable/CommonDialog";
import { CustomButton } from "../Reusable/CustomButton";
import { CustomTextField } from "../Reusable/CustomTextField";
import { showToast } from "../Reusable/Toast";

const ZoneList: React.FC<ZoneListProps> = ({
  selectedFloorId,
  onSelectZone,
  reFreshZoneList,
  onDeleteZone,
  isFileUploaded,
}) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [zoneData, setZoneData] = useState<IZoneList[] | undefined>();
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>("");
  const [isZoneEditMode, setIsZoneEditMode] = useState(false);
  const [openZoneDeleteConfirm, setOpenZoneDeleteConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    getValues,
    // formState: { errors },
  } = useForm<IZoneList>({
    defaultValues: {
      name: "",
      peopleOccupancy: null,
      peopleDefaultOccupancy: null,
      vehicleOccupancy: null,
      vehicleDefaultOccupancy: null,
      // resetAt: "",
    },
  });

  useEffect(() => {
    GetAllZoneDataByFloorId(selectedFloorId);
  }, [selectedFloorId, reFreshZoneList]);

  const GetAllZoneDataByFloorId = async (id: string) => {
    if (id != "" && id != undefined) {
      const response = await GetAllZoneByFloorIdService(id);
      setZoneData(response);
      if (
        response != undefined &&
        response != null &&
        response?.length &&
        response?.length > 0
      ) {
        const prevSelectedZoneId = selectedZoneId;
        const zoneToSelect =
          prevSelectedZoneId &&
          response.some((z) => z.id === prevSelectedZoneId)
            ? prevSelectedZoneId
            : response[0].id;

        // console.log("zoneToSelect->", zoneToSelect);

        setSelectedZoneId(zoneToSelect as string);

        const zoneDetails = response.find((z) => z.id === zoneToSelect);
        onSelectZone &&
          onSelectZone(
            zoneDetails?.id as string,
            zoneDetails?.zoneArea as XyPosition[],
            zoneDetails?.mappedDevices as any
          );

        // let tempZoneDetails = response[0];
        // console.log("tempZoneDetails->",tempZoneDetails.mappedDevices);
        // const prevZone = selectedZoneId;
        // if (prevZone && response.some(z => z.id === prevZone)) {
        //   setSelectedZoneId(prevZone);
        // } else if (response.length > 0) {
        //   setSelectedZoneId(tempZoneDetails?.id as string);
        // }
        // setSelectedZoneId((prev) => prev);
        // setSelectedZoneId(tempZoneDetails?.id as string);
        // onSelectZone &&
        //   onSelectZone(
        //     tempZoneDetails?.id as string,
        //     tempZoneDetails?.zoneArea,
        //     tempZoneDetails?.mappedDevices
        //   );
      } else {
        setSelectedZoneId(null);
        onSelectZone && onSelectZone("", [], null);
      }
    }
  };

  const AddZone = async (data: IZoneList) => {
    if (data.peopleOccupancy || data.vehicleOccupancy) {
      const cleanNumber = (value: any) =>
        value === "" || value === undefined ? null : Number(value);

      const zoneParams: IZoneList = {
        ...data,
        floorId: selectedFloorId,
        name: data.name,
        peopleOccupancy: cleanNumber(data.peopleOccupancy),
        peopleDefaultOccupancy: cleanNumber(data.peopleDefaultOccupancy),
        vehicleOccupancy: cleanNumber(data.vehicleOccupancy),
        vehicleDefaultOccupancy: cleanNumber(data.vehicleDefaultOccupancy),
        // resetAt: data.resetAt,
        id: isZoneEditMode && selectedZoneId ? selectedZoneId : "",
      };

      try {
        var res = await AddZoneService(zoneParams);
        if (
          typeof res === "object" &&
          res !== null &&
          "isSuccess" in res &&
          res.isSuccess
        ) {
          setOpenDrawer(false);
          reset();
          GetAllZoneDataByFloorId(selectedFloorId);
        }
      } catch (err) {
        console.error("Error saving in zone:", err);
      }
    } else {
      showToast(
        "Either people occupancy or vehicle occupancy is required.",
        "error"
      );
      return;
    }
  };

  const DeleteZone = async (id: string) => {
    try {
      const deleteData = await DeleteZoneService(id);
      if (deleteData?.isSuccess) {
        setOpenZoneDeleteConfirm(false);
        GetAllZoneDataByFloorId(selectedFloorId);
        onDeleteZone();
      }
    } catch (err: any) {
      console.error("Error deleting role:", err);
    }
  };

  return (
    <>
      <CommonDialog
        customClass="cmn-confirm-delete-icon"
        open={openZoneDeleteConfirm}
        title="Delete Confirmation!"
        content="Are you sure you want to continue?"
        onConfirm={() => selectedZoneId && DeleteZone(selectedZoneId)}
        onCancel={() => setOpenZoneDeleteConfirm(false)}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        titleClass={true}
      />

      {isFileUploaded && (
        <Box className="add-zone-head">
          {zoneData?.map((item) => (
            <Box
              // className="add-zone-list"
              className={
                selectedZoneId === item.id
                  ? "add-zone-list active"
                  : "add-zone-list"
              }
              key={item.id}
              onClick={() => {
                if (selectedZoneId !== item.id) {
                  setSelectedZoneId(item.id as string);
                  onSelectZone &&
                    onSelectZone(
                      item.id as string,
                      item.zoneArea,
                      item?.mappedDevices
                    );
                }
              }}
            >
              <Box className="add-zone-button">{item.name}</Box>

              <Box className="edit-delete-icons">
                {HasPermission(LABELS.CanAddUpdateZone) && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      // console.log("item->", item);
                      setSelectedZoneId(item.id as string);
                      setValue("name", item.name || "");
                      setValue("peopleOccupancy", item.peopleOccupancy || null);
                      setValue(
                        "peopleDefaultOccupancy",
                        item.peopleDefaultOccupancy || null
                      );
                      setValue(
                        "vehicleOccupancy",
                        item.vehicleOccupancy || null
                      );
                      setValue(
                        "vehicleDefaultOccupancy",
                        item.vehicleDefaultOccupancy || null
                      );
                      // if (item?.resetAt) {
                      //   const temresetAt = format(item.resetAt as string, "HH:mm");
                      //   setValue("resetAt", temresetAt || "");
                      // }

                      setOpenDrawer(true);
                      setIsZoneEditMode(true);
                    }}
                  >
                    <img src={"/images/edit_new.svg"} alt="edit" />
                  </IconButton>
                )}
                {HasPermission(LABELS.CanDeleteZone) && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedZoneId(item.id as string);
                      setOpenZoneDeleteConfirm(true);
                    }}
                  >
                    <img src={"/images/delete_new.svg"} alt="delete" />
                  </IconButton>
                )}
              </Box>
            </Box>
          ))}

          {HasPermission(LABELS.CanAddUpdateZone) && (
            <IconButton
              onClick={() => {
                setIsZoneEditMode(false);
                setOpenDrawer(true);
              }}
            >
              <img
                src={"/images/add_Zone.svg"}
                alt="add"
                width={50}
                height={50}
              />
            </IconButton>
          )}
        </Box>
      )}

      <Drawer
        anchor={"right"}
        open={openDrawer}
        onClose={() => {
          reset();
          setOpenDrawer(false);
        }}
        className="cmn-pop"
      >
        <Box component="form" onSubmit={handleSubmit(AddZone)}>
          <Box className="cmn-pop-head">
            {/* Title on Left */}
            <h6>{isZoneEditMode ? "Edit Zone" : "Add Zone"}</h6>

            {/* Close Icon on Right */}
            {/* <IconButton onClick={() => setOpenAddCamera(false)}> */}
            <IconButton
              onClick={() => {
                reset();
                setOpenDrawer(false);
              }}
            >
              <GridCloseIcon />
            </IconButton>
          </Box>
          <div className="cmn-pop-form">
            <div className="cmn-pop-form-wrapper">
              <div className="cmn-pop-form-inner">
                <Grid item xs={12} md={12}>
                  <CustomTextField
                    name="name"
                    control={control}
                    label={
                      <span>
                        Name <span className="star-error">*</span>
                      </span>
                    }
                    fullWidth
                    rules={{
                      required: "Zone Name is required",
                      pattern: {
                        value: REGEX.Floor_Zone_Name_Regex,
                        message:
                          "Zone name must only contain letters and numbers. Special characters are not allowed.",
                      },
                      maxLength: {
                        value: COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH,
                        message: "Zone name must be at most 20 characters",
                      },
                      minLength: {
                        value: COMMON_CONSTANTS.MIN_TEXT_FIELD_LENGTH,
                        message: "Zone name must have atleast 3 characters.",
                      },
                    }}
                    placeholder="Enter zone name"
                  />
                </Grid>
                <div className="half-pop-field-wrapper">
                  <Grid item className="main-pop-har-column">
                    <CustomTextField
                      name="peopleOccupancy"
                      control={control}
                      label="People Occupancy"
                      type="number"
                      rules={
                        {
                          // required: "People Occupancy of Zone is required",
                          // pattern: {
                          //   value: REGEX.Name_Regex,
                          //   message: "Enter a valid People Occupancy of Zone",
                          // },
                        }
                      }
                      placeholder="Enter max occupancy"
                      // required
                    />
                  </Grid>
                  <Grid item className="main-pop-har-column">
                    <CustomTextField
                      name="peopleDefaultOccupancy"
                      control={control}
                      label=" "
                      type="number"
                      rules={{
                        // required: "People Default Occupancy is required",
                        validate: (value: number) => {
                          const peopleOccupancy = Number(
                            getValues("peopleOccupancy")
                          );
                          const peopleDefault = Number(value);
                          if (!peopleOccupancy || isNaN(peopleOccupancy))
                            return true;
                          return peopleDefault < peopleOccupancy
                            ? true
                            : "People default occupancy must be less than to People Occupancy";
                        },
                        // pattern: {
                        //   value: REGEX.Name_Regex,
                        //   message: "Enter a valid People Default Occupancy",
                        // },
                      }}
                      placeholder="Enter default occupancy"
                      // required
                    />
                  </Grid>
                  <Grid item className="main-pop-har-column">
                    <CustomTextField
                      name="vehicleOccupancy"
                      control={control}
                      label="Vehicle Occupancy"
                      type="number"
                      rules={
                        {
                          // required: "Vehicle Occupancy is required",
                          // pattern: {
                          //   value: REGEX.Name_Regex,
                          //   message: "Enter a valid Vehicle Occupancy of Zone",
                          // },
                        }
                      }
                      placeholder="Enter max occupancy"
                      // required
                    />
                  </Grid>
                  <Grid item className="main-pop-har-column">
                    <CustomTextField
                      name="vehicleDefaultOccupancy"
                      control={control}
                      label=" "
                      type="number"
                      rules={{
                        // required: "Vehicle Default Occupancy is required",
                        validate: (value: number) => {
                          const vehicleOccupancy = Number(
                            getValues("vehicleOccupancy")
                          );
                          const vehicleDefault = Number(value);
                          if (!vehicleOccupancy || isNaN(vehicleOccupancy))
                            return true;
                          return vehicleDefault < vehicleOccupancy
                            ? true
                            : "Vehicle default occupancy must be less than Veople Occupancy";
                        },
                        // pattern: {
                        //   value: /^[0-9]+$/,
                        //   message: "Enter a valid Vehicle Default Occupancy of Zone",
                        // },
                      }}
                      placeholder="Enter default occupancy"
                      // required
                    />
                  </Grid>
                  {/* <Grid item className="main-pop-har-column">
                    <CustomTextField
                      name="resetAt"
                      control={control}
                      label="Reset At"
                      fullWidth
                      rules={{
                        required: "Reset At is required",
                        pattern: {
                          // value: REGEX.Name_Regex,
                          message: "Enter a valid Reset At",
                        },
                      }}
                      placeholder="--:-- --"
                      type="time"
                      required
                    />
                  </Grid> */}
                </div>
              </div>

              <CustomButton
                className="common-btn-design"
                fullWidth={true}
                customStyles={{ mt: 2 }}
              >
                {isZoneEditMode ? "Save" : "Add"}
              </CustomButton>
            </div>
          </div>
        </Box>
      </Drawer>
    </>
  );
};

export { ZoneList };
