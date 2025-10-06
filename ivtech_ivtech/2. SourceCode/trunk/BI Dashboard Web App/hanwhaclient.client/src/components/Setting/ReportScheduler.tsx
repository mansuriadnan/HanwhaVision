import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Box,
    Typography,
    Grid,
    Paper,
    TextField,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
} from "@mui/material";
import { CustomTextField } from "../Reusable/CustomTextField";
import { LABELS, REGEX, WIDGET_API_DISPLAYNAME_MAPPING, WIDGET_ID_NAME_MAPPING } from "../../utils/constants";
import { CustomMultiSelect } from "../Reusable/CustomMultiSelect";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { convertDateToISOLikeString } from "../../utils/convertDateToISOLikeString";
import { convertToUTC } from "../../utils/convertToUTC";
import { onOffReportSchedulerService, saveReportSchedulerSettings } from "../../services/settingService";
import { CustomButton } from "../Reusable/CustomButton";
import { formatDateToConfiguredTimezone } from "../../utils/formatDateToConfiguredTimezone";
import { ILookup } from "../../interfaces/ILookup";
import { GetAllFloorsListService, GetAllZonesByFloorIdService } from "../../services/dashboardService";
import { dashboardChartOptions } from "../../constants/dashboardChartList";
import { HasPermission } from "../../utils/screenAccessUtils";

type ReportSchDefaultFormValues = {
    emails: string;
    widgets: string[];
    startDate: Dayjs | null;
    startTime: Dayjs | null;
    floorIds:string[];
    zoneIds:string[];
    reportFormat: string;
    sendInterval: string;
};
type ReportSchFormValues = {
    emails: string[];
    widgets: string[];
    startDate: string;
    startTime: string;
    floorIds:string[];
    zoneIds:string[];
    reportFormat: string;
    sendInterval: string;
};
interface Option {
  id: string;
  title: string;
}
type Props = {
    reportSchSettings?: ReportSchFormValues;
};
export const ReportScheduler = ({ reportSchSettings }: Props) => {

    const buttonRef = useRef(null);
    const [isReportSchedule, setIsReportSchedule] = useState(false);
    const [floorList, setFloorList] = useState<ILookup[]>([]);
    const [zoneList, setZoneList] = useState<ILookup[]>([]);
    const {
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors },
    } = useForm<ReportSchDefaultFormValues>({
        defaultValues: {
            emails: "",
            widgets: [],
            startDate: null,
            startTime: null,
            floorIds:[],
            zoneIds:[],
            reportFormat: "",
            sendInterval: ""
        },
    });

    const selectedFloorIds = watch("floorIds");
    const selectedZoneIds = watch("zoneIds");

    const widgetsOptions: Option[] = WIDGET_API_DISPLAYNAME_MAPPING?.map((layout: any) => ({
        id: layout.id?.toString(),
        title: layout.title,
    })) || [];

    useEffect(() => {
       
        fetchZoneData(selectedFloorIds);
    }, [selectedFloorIds])

    useEffect(() => {
        setZoneList([]);
        setFloorList([]);
        fetchFloorData();
      }, []);

    useEffect(() => {
        let generalSettings = localStorage.getItem("generalSettings")
        if(generalSettings){
            let parsedData = JSON.parse(generalSettings);
            setIsReportSchedule(parsedData?.isReportSchedule)
        }
        if (reportSchSettings) {
            
            reset({
                emails: reportSchSettings.emails.join(","),
                widgets: getWidgetIdsByValues(reportSchSettings.widgets),
                startDate: dayjs(reportSchSettings.startDate),
                startTime:  dayjs(formatDateToConfiguredTimezone(reportSchSettings.startTime)),
                floorIds: reportSchSettings.floorIds,
                zoneIds: reportSchSettings.zoneIds,
                reportFormat: reportSchSettings.reportFormat,
                sendInterval: reportSchSettings.sendInterval
            });
        }
    }, [reportSchSettings, reset]);

    const fetchFloorData = async () => {
        try {
          const response = await GetAllFloorsListService();
          const floorData = response?.map((item) => ({
            title: item.floorPlanName,
            id: item.id,
          }));
          setFloorList(floorData as ILookup[]);
          if (floorData && floorData.length > 0 && floorData[0].id) {
            const firstFloorId = floorData[0].id;
          }
        } catch (err: any) {
          console.error("Error while fetching the floor data");
        } finally {
        }
      };
    
      const fetchZoneData = async (floorIds: string[]) => {
        if (!Array.isArray(floorIds) || floorIds.length === 0) {
          setZoneList([]);
          return;
        }
    
        try {
          const response: any = await GetAllZonesByFloorIdService(floorIds);
    
          const allZones: ILookup[] = (response?.data ?? []).flatMap((floor: any) =>
            Array.isArray(floor?.zones)
              ? floor.zones.map((zone: any) => ({
                id: zone.id,
                title: zone.zoneName,
              }))
              : []
          );
          setZoneList(allZones);
        } catch (err: any) {
          console.error("Error while fetching the zone data:", err?.message || err);
          setZoneList([]);
        }
      };    
    
    const getWidgetValuesByIds = (ids: string[]) => {
        return ids
            .map(id => WIDGET_ID_NAME_MAPPING.find((item) => item.id === id))
            .filter(Boolean) // remove undefined if any ID not found
            .map(item => item!.value);
    };
    const getWidgetIdsByValues = (values: string[]) => {
        return values
            .map(value => WIDGET_ID_NAME_MAPPING.find(item => item.value === value))
            .filter(Boolean)
            .map(item => item!.id);
    };
    const onSubmit = async (data: ReportSchDefaultFormValues) => {
        try {
                const reportPayload: ReportSchFormValues = {
                    emails: data.emails.split(","),
                    widgets: getWidgetValuesByIds(data.widgets),
                    startDate: convertToUTC(convertDateToISOLikeString(data.startDate?.toDate() || new Date())),
                    startTime: convertToUTC(convertDateToISOLikeString(data.startTime?.toDate() || new Date())),
                    floorIds: selectedFloorIds,
                    zoneIds: selectedZoneIds,
                    reportFormat:data.reportFormat,
                    sendInterval:data.sendInterval
                  };
                  
                  const response: any = await saveReportSchedulerSettings(reportPayload);
                  if (response?.isSuccess) {
                    reset(data);
                  }
        } catch (err: any) {
            console.error("Failed to update report details. Please try again.", err);
        }
    };

    const handleSchedulerOnOff = async () => {
        const buttonText = buttonRef.current?.innerText;
        let reportScheduleFlag;
        if(buttonText == "Start Schedule"){
            reportScheduleFlag = true;
        }else{
            reportScheduleFlag = false;
        }
        setIsReportSchedule(reportScheduleFlag);
        
        const payload = {
            "isReportSchedule" : reportScheduleFlag
        }
        const response: any = await onOffReportSchedulerService(payload);
        if (response?.isSuccess) {
            let generalSettings = localStorage.getItem("generalSettings")
            if (generalSettings) {
                let storedSettings = JSON.parse(generalSettings);
                storedSettings.isReportSchedule = reportScheduleFlag;
                localStorage.setItem("generalSettings", JSON.stringify(storedSettings));
            }
        }
    }
    
    return (
        <Paper elevation={1} className='smtp-setup-wrapper smtp-setup-wrapper-button'>
            <Typography variant="h4">
                Report Scheduler 
            </Typography>

            <Box onSubmit={handleSubmit(onSubmit)} component="form" noValidate>
                <Grid container spacing={2} xs={8}>
                    <Grid item xs={12} md={12}>
                        <CustomTextField
                            control={control}
                            name="emails"
                            label={<span>Emails <span className="star-error">*</span></span>}
                            rules={{
                                required: "Email is required",
                                validate: (value: string) => {
                                    const emails = value.split(",").map(e => e.trim()).filter(e => e.length > 0);
                                    if (emails.length < 2 && value.includes(" ")) {
                                        return "Multiple emails must be comma-separated, not space-separated.";
                                    }
                                    const invalid = emails.filter(
                                        email => !REGEX.Email_Regex.test(email)
                                    );

                                    if (invalid.length > 0) {
                                        return `Invalid email(s): ${invalid.join(", ")}`;
                                    }

                                    return true;
                                }
                                
                            }}
                            required
                            placeholder="Enter recipient email addresses (comma-separated)"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <CustomMultiSelect
                            name="floorIds"
                            control={control}
                            label={<span>Floors <span className="star-error">*</span></span>}
                            options={floorList}
                            placeholder="Select floors"
                            rules={{
                                required: "Please select floors",                                
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <CustomMultiSelect
                            name="zoneIds"
                            control={control}
                            label={<span>Zones <span className="star-error">*</span></span>}
                            options={zoneList}
                            placeholder="Select zones"
                            rules={{
                                required: "Please select zones",                                
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <CustomMultiSelect
                            name="widgets"
                            control={control}
                            label={<span>Select Widget(s) <span className="star-error">*</span></span>}
                            options={dashboardChartOptions}
                            rules={{
                                required: "Please select widget(s)",
                                validate: (value: string[]) =>
                                                     value.length <= 10 || "You can not select more than 10 widgets"
                            }}
                            placeholder="Select widget(s)"
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Box className="MuiFormControl-root MuiFormControl-marginNormal MuiFormControl-fullWidth css-16mfwdg-MuiFormControl-root">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <FormLabel>
                                <span>Select Date <span className="star-error">*</span></span>
                            </FormLabel>
                            <Controller
                                name="startDate"
                                control={control}
                                rules={{
                                    required: "Please select start date",
                                    validate: (value) => {
                                        if (!value) return "Start date is required";
                                        if (value.isBefore(dayjs(), "day")) {
                                            return "Start date must be today or later";
                                        }
                                        return true;
                                    },
                                }}
                                render={({ field, fieldState  }) => (
                                    <DatePicker
                                        value={field.value}
                                        onChange={(date) => field.onChange(date)}
                                        slotProps={{
                                            textField: {
                                                error: !!fieldState.error,
                                                helperText: fieldState.error?.message,
                                            },
                                        }}
                                       format="D MMM YYYY"                                        
                                    />
                                )}
                                
                                
                            />
                        </LocalizationProvider>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Box className="MuiFormControl-root MuiFormControl-marginNormal MuiFormControl-fullWidth css-16mfwdg-MuiFormControl-root">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <FormLabel>
                                <span>Select Time <span className="star-error">*</span></span>
                            </FormLabel>
                            <Controller
                                name="startTime"
                                control={control}
                                rules={{ required: "Start time is required" }}
                                render={({ field, fieldState }) => (
                                    <TimePicker value={field.value} onChange={field.onChange}
                                        slotProps={{
                                            textField: {
                                                error: !!fieldState.error,
                                                helperText: fieldState.error?.message,
                                            },
                                        }} />
                                )}
                            />
                        </LocalizationProvider>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormLabel  style={{ fontWeight: 500, fontSize: "14px" }}>
                            <span>Choose the format in which you want to receive the report <span className="star-error">*</span></span>
                        </FormLabel>
                        <Controller
                            name="reportFormat"
                            control={control}
                            rules={{ required: "Please select a format" }}
                            render={({ field }) => (
                                <RadioGroup {...field} row>
                                    <FormControlLabel value="PDF" control={<Radio sx={{"&.Mui-checked": {color: "#FFA500"}}} />} label="PDF" />
                                    <FormControlLabel value="CSV" control={<Radio sx={{"&.Mui-checked": {color: "#FFA500"}}}/>} label="CSV" />
                                </RadioGroup>
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormLabel  style={{ fontWeight: 500, fontSize: "14px" }}>
                            <span>Send On <span className="star-error">*</span></span>
                        </FormLabel>
                        <Controller
                            name="sendInterval"
                            control={control}
                            rules={{ required: "Please select an interval" }}
                            render={({ field }) => (
                                <RadioGroup {...field} row>
                                    <FormControlLabel value="DAILY" control={<Radio sx={{"&.Mui-checked": {color: "#FFA500"}}}/>} label="Daily" />
                                    <FormControlLabel value="WEEKLY" control={<Radio sx={{"&.Mui-checked": {color: "#FFA500"}}}/>} label="Weekly" />
                                    <FormControlLabel value="MONTHLY" control={<Radio sx={{"&.Mui-checked": {color: "#FFA500"}}}/>} label="Monthly" />
                                </RadioGroup>
                            )}
                        />
                    </Grid>
                </Grid>
                {HasPermission(LABELS.View_and_Configure_Report_Scheduler) && (
                    
                    <CustomButton className="common-btn-design">Save</CustomButton>
                  )} 
            </Box>
            <button className="common-btn-design ctn-trans" ref={buttonRef} style={{right: "163px"}} onClick={handleSchedulerOnOff}>{isReportSchedule ? "Stop": "Start"} Schedule</button>
        </Paper>)
}