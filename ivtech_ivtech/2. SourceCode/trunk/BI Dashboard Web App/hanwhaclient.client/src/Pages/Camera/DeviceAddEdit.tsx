import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Container,
    Typography,
    Grid,
    FormControl,
    FormControlLabel,
    Checkbox,
    Card
} from "@mui/material";
import { ICamera, IChannel, IDeviceCredentials } from "../../interfaces/ICamera";
import handleResponse from "../../utils/handleResponse";
// import { showToast, CustomTextField, CustomButton,  CustomSelectToggleButton } from "../../components";
import { showToast } from "../../components/Reusable/Toast";
import { CustomTextField } from "../../components/Reusable/CustomTextField";
import { CustomSelectToggleButton } from "../../components/Reusable/CustomSelectToggleButton";
import { CustomButton } from "../../components/Reusable/CustomButton";
import { AddCameraService, getChannelDataService, UpdateCameraService, } from "../../services/cameraService";
import { REGEX } from "../../utils/constants";
import { Controller, SubmitHandler, useForm } from "react-hook-form";



interface CameraAddEditFormProps {
    onClose: () => void;
    cameras?: ICamera;
    refreshData: () => void;
}

interface CameraFormInputs {
    deviceType: string;
    deviceName: string;
    cameraIp: string;
    // noOfLines: number;
    userName: string;
    password: string;
    // cameraType: string[];
    // direction: string[],
    // apiType: string,
    devicePort: string;
    useHttps: boolean;
    location: string;
    description: string;
    // AIcameraIp: string;
    // AIChannelNo: number;
    // AIcameraType: string;
}


const DeviceAddEdit: React.FC<CameraAddEditFormProps> = ({ onClose, cameras, refreshData }) => {
    const [error, setError] = useState<string | null>(null);
    const isEditMode = cameras !== null && cameras !== undefined;
    const {
        control,
        setValue,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<CameraFormInputs>({
        defaultValues: {
            deviceType: "Camera",
            deviceName: "",
            cameraIp: "",
            // noOfLines: 0,
            userName: "",
            password: "",
            // cameraType: [],
            // direction: [],
            // apiType: "wise_api",
            devicePort: "80",
            useHttps: false,
            location: "",
            // description: "",
            // AIcameraIp: "",
            // AIChannelNo: 0,
            // AIcameraType: "true"

        },
    });

    const deviceTypeWatch = watch("deviceType");
    const ipAddress = watch("cameraIp");
    const userName = watch("userName");
    const password = watch("password");
    const useHttpsWatch = watch("useHttps");
    const [channelData, setChannelData] = useState<IChannel[]>([])
    const deviceNameRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (deviceNameRef.current) {
            deviceNameRef.current.focus();
        }
    }, []);

    useEffect(() => {
        setValue("devicePort", useHttpsWatch ? "443" : "80");
    }, [useHttpsWatch, setValue]);

    useEffect(() => {
        if (isEditMode && cameras) {
            const initialCamera = cameras;
            setValue("deviceType", initialCamera?.deviceType);
            setValue("cameraIp", (initialCamera?.ipAddress.includes(":") ? initialCamera.ipAddress.split(":")[0] : initialCamera.ipAddress) || "");
            // setValue("noOfLines", initialCamera?.noOfLines || 0);
            setValue("userName", initialCamera?.userName || "");
            setValue("password", initialCamera?.password || "");
            setValue("deviceName", initialCamera?.deviceName || "");
            setValue("useHttps", initialCamera?.isHttps);
            setValue("devicePort", initialCamera?.devicePort)
            setValue("location", initialCamera?.location)
            // setValue("cameraType", Array.isArray(initialCamera.cameraType) ? initialCamera.cameraType : []);
            // setValue("direction", Array.isArray(initialCamera.direction) ? initialCamera.direction : []);
            // setValue("apiType", initialCamera?.apiType || "");
            // setValue("description", initialCamera?.description || "");
        }

    }, [isEditMode, cameras]);

    // useEffect(() => {  
    //     const timeout = setTimeout(() => {  
    //     if (ipAddress && userName && password && deviceTypeWatch === "AIB") {
    //         const data: IDeviceCredentials = {
    //             ipAddress: ipAddress,
    //             userName: userName,
    //             password: password,
    //         };
    //         fetchChannelDetail(data);
    //     }    

    //     }, 1000);
    //     return () => clearTimeout(timeout);
    // }, [watch("cameraIp"), watch("userName"), watch("password")]);

    const fetchChannelDetail = async (data: IDeviceCredentials) => {
        try {
            const channeldata: any = await getChannelDataService(data);
            setChannelData(channeldata.data as IChannel[])
        } catch (error) {
            console.error("Error calling API:", error);
            showToast("An error occurred while updating fetching channel data.", "error");
        }
    }

    const cameraSubmit: SubmitHandler<CameraFormInputs> = async (data) => {

        const cameraData =
        {
            deviceType: data.deviceType,
            deviceName: data.deviceName,
            ipAddress: data.cameraIp.includes(":") ? data.cameraIp.split(":")[0] : data.cameraIp,
            // noOfLines: data.deviceType === "camera" ? data.noOfLines : null,
            userName: data.userName,
            password: data.password,
            isHttps: data.useHttps,
            devicePort: data.devicePort,
            location: data.location,
            // cameraType: data.deviceType === "camera" ? data.cameraType : [],
            // AIcameraType: data.deviceType !== "camera" ? data.AIcameraType : "",
            // direction: data.deviceType === "camera" ? data.direction : [],
            // apiType: data.deviceType === "camera" ? data.apiType : "",
            // description: data.deviceType === "camera" ? data.description : "",
            // channelNo: data.deviceType !== "camera" ? data.AIChannelNo : null,
            ...(isEditMode &&
                cameras?.id && { id: cameras.id }),

        };

        if (isEditMode) {
            const UpdateCamera = async () => {
                setError(null); // Reset error
                try {
                    const data = await UpdateCameraService(cameraData);
                    if (typeof data === 'object' && data !== null && 'isSuccess' in data && data.isSuccess) {
                        onClose();
                        refreshData();
                    }

                } catch (err: any) {
                    setError(err.message || "An error occurred while fetching users.");
                    showToast("An error occurred while updating user.", "error");
                }
            };
            UpdateCamera();
        } else {

            const AddCamera = async () => {
                setError(null); // Reset error
                try {
                    const data = await AddCameraService(cameraData);
                    // handleResponse(data)
                    if (typeof data === 'object' && data !== null && 'isSuccess' in data && data.isSuccess) {
                        onClose();
                        refreshData();
                    }

                } catch (err: any) {
                    setError(err.message || "An error occurred while fetching users.");
                    showToast("An error occurred while updating user.", "error");
                }
            };
            AddCamera();
        }
    };
    const handleFieldsBlur = () => {
        if (ipAddress && userName && password && deviceTypeWatch === "AIB") {
            const data: IDeviceCredentials = {
                ipAddress: ipAddress,
                userName: userName,
                password: password,
                isHttps: useHttpsWatch,
            };
            fetchChannelDetail(data);
        }
    };



    return (
        <div className="cmn-pop-form">
            <div className="cmn-pop-form-wrapper">
                {/* {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )} */}

                <Box
                    component="form"
                    onSubmit={handleSubmit(cameraSubmit)}
                    noValidate
                    sx={{ width: "100%" }}
                >
                    <div className="cmn-pop-form-inner">
                        {isEditMode ? (
                            <CustomTextField
                                name="deviceType"
                                label="Select Device Type"
                                control={control}
                                // disabled
                                className="device-type-camera"
                            />

                        ) : (
                            <CustomSelectToggleButton
                                name="deviceType"
                                title="Select Device Type"
                                control={control}
                                options={[
                                    { label: "Camera", value: "Camera" },
                                    { label: "AI Box", value: "AIB" },
                                ]}
                                rules={{ required: "Device Type is required" }}
                                defaultValue="Camera"
                                allowNoneSelected={false}
                            />
                        )}


                        <CustomTextField
                            name="deviceName"
                            label={<span>Device Name <span className="star-error">*</span></span>}
                            control={control}
                            rules={{
                                required: "Device Name is required.",
                                // pattern: {
                                //     value: REGEX.IPAddess_Regex,
                                //     message: "Enter a valid Ip Address",
                                // },
                            }}
                            placeholder="Enter device name"
                            required
                            fullWidth
                            inputRef={deviceNameRef}
                        />
                        <CustomTextField
                            name="cameraIp"
                            label={<span>IP Address <span className="star-error">*</span></span>}
                            control={control}
                            rules={{
                                required: "IP Address is required.",
                                pattern: {
                                    value: REGEX.IP_Domain_Regex,
                                    message: "Enter a valid Ip Address",
                                },
                            }}
                            placeholder="Enter ip address"
                            required
                            fullWidth
                            onBlur={isEditMode ? handleFieldsBlur : undefined}
                        />

                        {/* <CustomTextField
                                    name="noOfLines"
                                    label="Lines"
                                    control={control}
                                    rules={{
                                        required: "Line number is required.",

                                    }}
                                    placeholder="Enter Line number"
                                    required
                                    fullWidth
                                /> */}

                        <CustomTextField
                            name="userName"
                            label={<span>Username <span className="star-error">*</span></span>}
                            control={control}
                            rules={{
                                required: "Username is required.",
                                pattern: {
                                    value: REGEX.UserName_Regex,
                                    message: "Enter a valid username",
                                },
                            }}
                            placeholder="Enter username"
                            required
                            fullWidth
                            onBlur={isEditMode ? handleFieldsBlur : undefined}
                        />
                        <CustomTextField
                            name="password"
                            label={<span>Password <span className="star-error">*</span></span>}
                            control={control}
                            type={"password"}
                            rules={{
                                required: "Password is required",
                            }}
                            placeholder="Enter password"
                            required
                            fullWidth
                            // disabled={isEditMode}
                            // onBlur={handleFieldsBlur}
                            onBlur={isEditMode ? handleFieldsBlur : undefined}
                        />

                        {/* <CustomMultiSelectToggleButton
                                    name="cameraType"
                                    title="Camera Type"
                                    control={control}
                                    options={[
                                        { label: "People Count", value: "people_count" },
                                        { label: "Vehicle Count", value: "vehicle_count" },
                                    ]}
                                    rules={{ required: "Please select at least one Camera Type" }}

                                /> */}

                        {/* <CustomMultiSelectToggleButton
                                    title="Camera Direction"
                                    name="direction"
                                    control={control}
                                    options={[
                                        { label: "In", value: "in" },
                                        { label: "Out", value: "out" },
                                    ]}
                                    rules={{ required: "Please select at least one Direction" }}
                                /> */}

                        {/* <CustomSelectToggleButton
                                    name="apiType"
                                    title="API Type"
                                    control={control}
                                    options={[
                                        { label: "Wise Api", value: "wise_api" },
                                        { label: "Sun Api", value: "sun_api" },
                                    ]}
                                    rules={{ required: "API Type is required" }}
                                /> */}
                        <Box display="flex" gap={2}>
                            <Box flex={1}>
                                <CustomTextField
                                    name="devicePort"
                                    label={<span>Port <span className="star-error">*</span></span>}
                                    control={control}
                                    rules={{
                                        required: "Port is required",
                                        pattern: {
                                            pattern: {
                                                value: REGEX.DigitsOnly_Regex,
                                                message: "Enter a valid Port",
                                            },
                                        },
                                    }}
                                    placeholder="Enter port"
                                    required
                                    defaultValue={"80"}
                                    fullWidth
                                    type="number"
                                />
                            </Box>
                            <Box display="flex" alignItems="center" gap={2} sx={{ marginTop: '25px' }}>
                                {/* <FormControl component="fieldset" variant="filled" > */}
                                <Controller
                                    name="useHttps"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={field.value}
                                                    onChange={() => setValue("useHttps", !field.value)}
                                                />
                                            }
                                            label="Use HTTPS"
                                        />
                                    )}
                                />
                                {/* </FormControl> */}

                            </Box>

                        </Box>
                        <CustomTextField
                            name="location"
                            label={<span>Location <span className="star-error">*</span></span>}
                            control={control}
                            placeholder="Enter location"
                            fullWidth
                            rules={{
                                required: "Location is required",
                                // pattern: {
                                //     value: REGEX.Password_Regex,
                                //     message: "Enter a valid password",
                                // },
                            }}
                        />

                        {deviceTypeWatch === "AIB" && isEditMode ? (
                            <>
                                <Typography className="total-channels">
                                    Total Channels
                                </Typography>

                                <Grid className="total-channels">
                                    {[0, 1, 2, 3, 4, 5, 6, 7].map((channel) => {
                                        const isEnabled = channelData.some(
                                            (data) => data.channelNumber === channel && data.isEnable
                                        );
                                        return (
                                            <Grid item key={channel} className="total-channels-items">
                                                <Card
                                                    key={channel}
                                                    className={isEnabled ? 'active' : ''}
                                                >
                                                    CH{channel + 1}
                                                </Card>
                                            </Grid>
                                        )
                                    })}
                                </Grid>
                            </>
                        ) : null}


                        <CustomButton className="common-btn-design" fullWidth customStyles={{ mt: 2 }}>
                            {isEditMode ? "Update" : "Add"}
                        </CustomButton>
                    </div>
                </Box>
            </div>
        </div>
    );
};

export { DeviceAddEdit }
