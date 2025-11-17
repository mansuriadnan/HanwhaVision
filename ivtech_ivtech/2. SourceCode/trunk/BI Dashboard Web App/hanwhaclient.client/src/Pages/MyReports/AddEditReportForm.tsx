import { Box, Checkbox, FormControl, FormControlLabel, FormGroup, Typography } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { CustomTextField } from "../../components/Reusable/CustomTextField";
import { CustomDateTimeRangePicker } from "../../components/Reusable/CustomDateTimeRangePicker";
import { CustomStyleMultiSelect } from "../../components/Reusable/CustomStyleMultiSelect";
import { GetAllSiteService } from "../../services/siteManagementService";
import { AddEditReportService, GetAllZoneBySiteIdService, GetFloorBySiteIdService } from "../../services/reportServices";
import { IReport, ISiteReport, IZoneReport, ZoneDetailsRequest } from "../../interfaces/IReport";
import { ILookup } from "../../interfaces/ILookup";
import { CustomButton } from "../../components/Reusable/CustomButton";
import { CustomMultiSelect } from "../../components/Reusable/CustomMultiSelect";
import { CustomSelect } from "../../components/Reusable/CustomSelect";
import { showToast } from "../../components/Reusable/Toast";




interface ReportFormInputs {
    reportType: string;
    reportName: string;
    siteIds: string[];
    floorIds?: string[];
    zoneIds?: string[];
    startDate: string;
    endDate: string;
    siteId: string;
    comperisionType?: string[];
}

interface AddReportFormProps {
    reportData?: any;
    onSuccess?: (newReport: any) => void;
    onClose: () => void;
}

const AddEditReportForm: React.FC<AddReportFormProps> = ({ reportData, onSuccess, onClose }) => {
    
    const [error, setError] = useState<string | null>(null);
    const isEditMode = reportData !== null && reportData !== undefined;
    const [siteList, setSiteList] = useState<any[]>([]);
    const [selectedStartDate, setSelectedStartDate] = useState<Dayjs>(
        dayjs().startOf("day")
    );
    const [selectedEndDate, setSelectedEndDate] = useState<Dayjs>(
        dayjs(new Date())
    );

    const [floorList, setFloorList] = useState<ILookup[]>([]);
    const [zoneList, setZoneList] = useState<ILookup[]>([]);

    const {
        control,
        setValue,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ReportFormInputs>({
        defaultValues: {
            reportType: "site report",
            reportName: "",
            siteIds: [],
            floorIds: [],
            zoneIds: [],
            startDate: dayjs(new Date()).toISOString(),
            endDate: dayjs(new Date()).toISOString(),
            siteId: "",
            comperisionType: []
        },
    });
    const reportTypeSelected = watch("reportType");
    const siteIds = watch("siteIds");
    const floorIdsSelected = watch("floorIds");
    const zoneIds = watch("zoneIds");
    const siteId = watch("siteId");

    let reportDetails: IReport = {
        id: isEditMode ? reportData.id : "",
        reportType: "",
        siteReport: null,
        zoneReport: null,
        createdOn: "",
        updatedOn: "",
        comperisionType: isEditMode ? reportData.comperisionType : []
    };

     const resportNameRef = useRef<HTMLInputElement | null>(null);
    
        useEffect(() => {
            if (resportNameRef.current) {
                resportNameRef.current.focus();
            }
        }, []);

    useEffect(() => {
        if (isEditMode && reportData) {
            const intialReportData: IReport = reportData;
            setValue("reportType", intialReportData?.reportType);
            setValue("comperisionType", intialReportData?.comperisionType);
            if (intialReportData.reportType === "site report") {
                setValue("reportName", intialReportData?.siteReport?.reportName || "");
                setValue("siteIds", intialReportData?.siteReport?.sitesIds || []);
                setValue("startDate", intialReportData?.siteReport?.startDate || "");
                setValue("endDate", intialReportData?.siteReport?.endDate || "");
                setSelectedStartDate(dayjs(intialReportData?.siteReport?.startDate));
                setSelectedEndDate(dayjs(intialReportData?.siteReport?.endDate));

            } else {
                setValue("reportName", intialReportData?.zoneReport?.reportName || "");
                setValue("siteId", intialReportData?.zoneReport?.siteId || "");
                setValue("startDate", intialReportData?.zoneReport?.startDate || "");
                setValue("endDate", intialReportData?.zoneReport?.endDate || "");
                setValue("floorIds", intialReportData?.zoneReport?.floorIds || []);
                setValue("zoneIds", intialReportData?.zoneReport?.zoneIds || []);
                setSelectedStartDate(dayjs(intialReportData?.zoneReport?.startDate));
                setSelectedEndDate(dayjs(intialReportData?.zoneReport?.endDate));
            }
        }

    }, [isEditMode, reportData]);

    useEffect(() => {
        if (siteId == "") return
        GetFloorBySiteId(siteId)

    }, [siteId])
    useEffect(() => {
        if (floorIdsSelected && floorIdsSelected?.length <= 0) return
        GetAllZoneByFloorId(floorIdsSelected!)

    }, [floorIdsSelected])

    const GetFloorBySiteId = async (siteId: string) => {
        const floors: any = await GetFloorBySiteIdService(siteId);
        const floorList = floors.map((item: any) => ({
            id: item.id,
            title: item.floorPlanName,
        }));
        setFloorList(floorList)
    }
    const GetAllZoneByFloorId = async (floorIdsSelected: string[]) => {
        const request: ZoneDetailsRequest = {
            siteId: siteId,
            floorIds: floorIdsSelected
        }
        const zonesResponse: any = await GetAllZoneBySiteIdService(request);
        const zoneList = (zonesResponse?.data ?? []).flatMap((floor: any) =>
            Array.isArray(floor?.zones)
                ? floor.zones.map((zone: any) => ({
                    id: zone.id,
                    title: zone.zoneName,
                }))
                : []
        );
        setZoneList(zoneList)
    }

    const reportSubmit: SubmitHandler<ReportFormInputs> = async (data) => {
        reportDetails.reportType = data.reportType;
        reportDetails.comperisionType = data.comperisionType || [];
        if (data.reportType === "site report") {
            reportDetails.siteReport = {
                reportName: data.reportName,
                sitesIds: data.siteIds,
                startDate: selectedStartDate?.toISOString() || "",
                endDate: selectedEndDate?.toISOString() || ""
            };
            reportDetails.zoneReport = null;
        } else {
            reportDetails.zoneReport = {
                reportName: data.reportName,
                siteId: data.siteId,
                floorIds: data.floorIds || [],
                zoneIds: data.zoneIds || [],
                startDate: selectedStartDate?.toISOString() || "",
                endDate: selectedEndDate?.toISOString() || ""
            };
            reportDetails.siteReport = null;
        }
        if (isEditMode) {

            setError(null); // Reset error
            try {
                const data = await AddEditReportService(reportDetails);
                if (typeof data === 'object' && data !== null && 'isSuccess' in data && data.isSuccess) {
                    onClose();
                    if (onSuccess) {
                        onSuccess(""); // not returning upodated id on success
                    }
                }

            } catch (err: any) {
                setError(err.message || "An error occurred while fetching users.");
                showToast("An error occurred while updating report.", "error");
            }


        } else {

            setError(null); // Reset error
            try {
                const data: any = await AddEditReportService(reportDetails);
                if (typeof data === 'object' && data !== null && 'isSuccess' in data && data.isSuccess) {
                    onClose();
                    if (onSuccess) {
                        onSuccess(data?.data); //returning inserted id on success
                    }
                }

            } catch (err: any) {
                setError(err.message || "An error occurred while fetching users.");
                showToast("An error occurred while adding  report.", "error");
            }
        };

    }
    useEffect(() => {
        //showLoading();
        GetAllSite();
    }, []);

    const GetAllSite = async () => {
        try {
            const response: any = await GetAllSiteService();
            if (response?.isSuccess) {
                const options = getDropdownOptions(response?.data)
                setSiteList(options)
            }

        } catch (err: any) {
        } finally {
            // hideLoading();
        }
    };
    const getDropdownOptions = (data: any) => {
        const options: any = [];

        data.forEach((parent: any) => {
            options.push({
                title: parent.siteName,
                id: parent.id,
                isParent: true,
                disabled: false, // Optional: disable parent selection if needed
            });

            parent.childSites.forEach((child: any) => {
                options.push({
                    title: `${child.siteName}`,
                    id: child.id,
                    parentId: parent.id,
                    isParent: false,
                });
            });
        });

        return options;
    };

    const handleDateTimeApply = ({
        startDate,
        endDate,
    }: {
        startDate: Date;
        endDate: Date;
    }) => {

        setSelectedStartDate(dayjs(startDate));
        setSelectedEndDate(dayjs(endDate));
    };


    return (
        <div className="cmn-pop-form">
            <div className="cmn-pop-form-wrapper">
                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}

                <Box
                    component="form"
                    onSubmit={handleSubmit(reportSubmit)}
                    noValidate
                >
                    <div className="cmn-pop-form-inner">
                        {isEditMode ? (
                            <CustomTextField
                                name="reportType"
                                label={<span>Select Report Type<span className="star-error">*</span></span>}
                                control={control}
                                disabled
                                displayValueMap={{
                                    "site report": "Site Performance Comparison Report",
                                    "zone report": "Zone Performance Comparison Report",
                                }}
                            />

                        ) : (
                            <CustomSelect
                                name="reportType"
                                label={<span>Select Report Type<span className="star-error">*</span></span>}
                                control={control}
                                options={[
                                    { id: "site report", title: "Site Performance Comparison Report" },
                                    { id: "zone report", title: "Zone Performance Comparison Report" },
                                ]}
                                rules={{ required: "Report Type is required" }}
                            />
                        )}


                        <CustomTextField
                            name="reportName"
                            label={<span>Report Name<span className="star-error">*</span></span>}
                            control={control}
                            rules={{
                                required: "Report Name is required.",
                                // pattern: {
                                //     value: REGEX.IPAddess_Regex,
                                //     message: "Enter a valid Ip Address",
                                // },
                            }}
                            placeholder="Enter report name"
                            required
                            fullWidth
                            inputRef={resportNameRef}
                        />
                        <div className="report-edit-pop-select">
                            {
                                reportTypeSelected == "site report" ? (
                                    <FormControl fullWidth margin="normal">
                                        <CustomStyleMultiSelect
                                            name="siteIds"
                                            control={control}
                                            label={<span>Select Site <span className="star-error">*</span></span>}
                                            options={siteList}
                                            rules={{ required: "Site is required" ,
                                                validate: (value: string[]) =>
                                                    value && value.length >= 2 || "Select at least 2 sites"
                                            }}
                                            placeholder="Select site"
                                        />
                                    </FormControl>
                                ) : (
                                    <div>
                                        <CustomSelect
                                            name="siteId"
                                            label={<span>Select Site<span className="star-error">*</span></span>}
                                            control={control}
                                            options={siteList}
                                            rules={{ required: "Site is required" }}
                                            placeholder="Select site"
                                        />
                                        <FormControl fullWidth margin="normal">
                                            <CustomMultiSelect
                                                name="floorIds"
                                                control={control}
                                                label={<span>Select Floor<span className="star-error">*</span></span>}
                                                options={floorList}
                                                rules={{ required: "Floor is required" }}
                                                placeholder="Select floor"
                                            />
                                        </FormControl>


                                        <Box marginY={2}>
                                            <Box display="flex" flexWrap="wrap" gap={1}>
                                                <CustomMultiSelect
                                                    name="zoneIds"
                                                    control={control}
                                                    label={<span>Select Zone<span className="star-error">*</span></span>}
                                                    options={zoneList}
                                                    rules={{ required: "Zone is required",
                                                        validate: (value: string[]) =>
                                                        value && value.length >= 2 || "Select at least 2 zones"
                                                     }}
                                                    placeholder="Select zone"
                                                />
                                            </Box>
                                        </Box>
                                    </div>
                                )
                            }
                        </div>
                        <FormControl fullWidth margin="normal">
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                Comparison Mode
                            </Typography>
                            <FormGroup row>
                                {["vehicle", "people"].map((item) => (
                                    <Controller
                                        key={item}
                                        name="comperisionType"
                                        control={control}
                                        rules={{
                                            validate: (value: string[] | undefined) =>
                                                value !== undefined && value.length > 0 || "Select at least one option"
                                        }}
                                        render={({ field, fieldState }) => {
                                            const checked = (field.value || []).includes(item);
                                            return (
                                                <div>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={checked}
                                                                onChange={(e) => {
                                                                    const newValue = e.target.checked
                                                                        ? [...(field.value || []), item]
                                                                        : (field.value || []).filter((val) => val !== item);
                                                                    field.onChange(newValue);
                                                                }}
                                                            />
                                                        }
                                                        label={item.charAt(0).toUpperCase() + item.slice(1)}
                                                    />
                                                    {/* Show error only once, optionally outside the loop */}
                                                    {fieldState.error && item === "vehicle" && (
                                                        <Typography color="error" variant="caption" sx={{ display: 'block' }}>
                                                            {fieldState.error.message}
                                                        </Typography>
                                                    )}
                                                </div>
                                            );
                                        }}
                                    />
                                ))}
                            </FormGroup>
                        </FormControl>
                        <div className="report-edit-pop-date">
                            <CustomDateTimeRangePicker
                                initialStartDate={selectedStartDate?.toDate()}
                                initialEndDate={selectedEndDate?.toDate()}
                                onApply={({ startDate, endDate }) => {
                                    setSelectedStartDate(dayjs(startDate));
                                    setSelectedEndDate(dayjs(endDate));
                                    handleDateTimeApply({ startDate, endDate });
                                }}
                                label="Select Date Range"
                                rules={{ required: "Date is required" }}
                            />
                            <img src="images/calendar.png" alt="calendar-icon" />
                        </div>


                        <CustomButton className="common-btn-design" fullWidth customStyles={{ mt: 2 }}>
                            {isEditMode ? "Update" : "Add"}
                        </CustomButton>
                    </div>
                </Box>
            </div>
        </div>
    )

}


export { AddEditReportForm }