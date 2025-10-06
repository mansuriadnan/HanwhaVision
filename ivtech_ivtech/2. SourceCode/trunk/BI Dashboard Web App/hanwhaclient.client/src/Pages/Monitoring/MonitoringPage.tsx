import { Box, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
// import { CustomButton, CustomTextFieldWithButton, showToast } from '../../components'
import { CustomTextFieldWithButton } from '../../components/Reusable/CustomTextFieldWithButton';
import { showToast } from '../../components/Reusable/Toast';
// import NoMonitoring from "../../../public/images/NoMonitoring.gif";
// import NoMonitoring_Dark from "../../../public/images/dark-theme/NoMonitoring.gif";
import { AddPoleGroupComponent } from "../index"
import { AddMonitoringGroupService, GetGroupAndItemDataService } from '../../services/monitoringService';
import { useSearchParams } from 'react-router-dom';
import { IAddGroup, IGroupData, IMonitoringGroup } from '../../interfaces/IMonitoring';
import { HasPermission } from '../../utils/screenAccessUtils';
import { COMMON_CONSTANTS, LABELS } from '../../utils/constants';
import { useForm } from 'react-hook-form';
import { useThemeContext } from '../../context/ThemeContext';

const MonitoringPage = () => {
    const [showAddGroup, setShowAddGroup] = useState(false);
    const [searchParams] = useSearchParams();
    const monitoringId = searchParams.get("id");
    const [groupList, setGroupList] = useState<IMonitoringGroup[] | undefined>();
    const { theme } = useThemeContext();

    const backgroundStyle = {
        backgroundImage: ` url('/images/lines.png'), linear-gradient(287.68deg, #FE6500 -0.05%, #FF8A00 57.77%)`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
    };

    const {
        control: addControl,
        handleSubmit: handleAddSubmit,
        reset: resetAddForm,
    } = useForm<IAddGroup>({
        defaultValues: {
            groupName: "",
        },
    }); // for Add group

    useEffect(() => {
        fetchGroupAndItemData();
        resetAddForm({ groupName: "" });
    }, [monitoringId]);

    const fetchGroupAndItemData = async () => {
        try {

            const groupData = await GetGroupAndItemDataService(monitoringId as string);
            if (groupData && groupData.length > 0) {
                setShowAddGroup(true)
                setGroupList(groupData as IMonitoringGroup[]);
            } else {
                setShowAddGroup(false)
            }
        } catch (err: any) {
            console.error("Error fetching initial data:", err);
        }
    };

    const handleClickOpen = () => {
        setShowAddGroup(true);
        setGroupList([]);
    };

    const AddGroup = async (data: IAddGroup) => {
        try {
            const newGroup: IGroupData = {
                groupId: "",
                groupName: data.groupName,
                monitoringId: monitoringId,
            };

            var result: any = await AddMonitoringGroupService(newGroup as IGroupData);
            if (result && result.isSuccess) {
                fetchGroupAndItemData && fetchGroupAndItemData();
                resetAddForm();
            }
        } catch (error) {
            console.error("Submission Error:", error);
        }
    };


    return (
        <>
            {showAddGroup ?
                <AddPoleGroupComponent
                    fetchGroupAndItemData={fetchGroupAndItemData}
                    groupList={groupList}
                    setGroupList={setGroupList}
                /> :
                (
                    <>
                        <Box className="top-orange-head" style={backgroundStyle}>
                            <Box className="top-orange-head-left">
                                <Typography variant="h4">Add a new group</Typography>
                                <Typography>
                                    Configure your Monitoring here..
                                </Typography>
                            </Box>
                        </Box>
                        <Box
                            className="add-widget"
                            // sx={{
                            //     backgroundImage: "url('images/monitoring_background.svg')", 
                            // }}
                            sx={{
                                backgroundImage: "url('/images/add-group.png')",
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: 'cover', // or 'contain'
                            }}

                        >
                            {HasPermission(LABELS.CanAddOrUpdateGroup) ? (
                                <Box className="add-widget-wrapper">
                                    <img src={theme === 'light' ? "/images/NoMonitoring.gif" : "/images/dark-theme/NoMonitoring.gif"} alt="Animated GIF" />
                                    <h3>Add a New Group</h3>
                                    <p>There are no group configured for you yet. <br />  To create a new group, please click the button below</p>
                                    {/* <CustomButton variant="outlined"
                                    onClick={handleClickOpen}
                                >
                                    <img src={"/images/adddevice.svg"} alt="Add Devices" />
                                    Add Group
                                </CustomButton> */}

                                    <Box
                                        component="form"
                                        onSubmit={handleAddSubmit(AddGroup)}
                                        sx={{ marginTop: 2 }}>
                                        <CustomTextFieldWithButton
                                            name="groupName"
                                            control={addControl}
                                            // rules={{
                                            //     required: "Group Name is required",
                                            //     maxLength: {
                                            //         value: COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH,
                                            //         message: "Group name cannot exceed 50 characters",
                                            //     },
                                            // }}
                                            rules={{
                                                validate: (value: string) => {
                                                    if (!value) {
                                                        showToast("Group Name is required", "error");
                                                        return false;
                                                    }
                                                    if (value.length > 50) {
                                                        showToast("Group name cannot exceed 50 characters", "error");
                                                        return false;
                                                    }
                                                    return true;
                                                },
                                            }}
                                            placeholder="Enter group name"
                                            autoFocus
                                        />
                                    </Box>

                                </Box>
                            ) :
                                (
                                    <Box className="add-widget-wrapper">You do not have permission for add monitoring group</Box>
                                )
                            }
                        </Box>
                    </>
                )
            }
        </>
    )
}

export default MonitoringPage;