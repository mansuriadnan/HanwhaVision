import React, { useEffect, useRef } from 'react'
import { AddUpdateGroupItemPayload, IGroupData, IGroupItem, MonitoringGroupItemAddEditFormProps } from '../../interfaces/IMonitoring'
import { Box, Grid } from '@mui/material';
import { COMMON_CONSTANTS, REGEX } from '../../utils/constants';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { AddUpdateGroupItemService } from '../../services/monitoringService';
import { CustomButton } from '../../components/Reusable/CustomButton';
import { CustomTextField } from '../../components/Reusable/CustomTextField';

interface GroupItemFormInputs {
    name: string;
    URL: string;
    location: string;
}
const MonitoringGroupItemAddEditForm: React.FC<MonitoringGroupItemAddEditFormProps> = ({
    onClose,
    groupItem,
    groupId,
    refreshData
}) => {
    const isEditMode = groupItem && groupItem !== undefined;
    const [searchParams] = useSearchParams();
    const monitoringId = searchParams.get("id");
    const {
        control,
        setValue,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<GroupItemFormInputs>({
        defaultValues: {
            name: "",
            URL: "",
            location: "",
        },
    });

    const NameRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (NameRef.current) {
            NameRef.current.focus();
        }
    }, []);
    useEffect(() => {
        if (isEditMode && groupItem) {
            const initialgroupItem = groupItem;
            setValue("name", initialgroupItem?.name);
            setValue("URL", initialgroupItem?.url || "");
            setValue("location", initialgroupItem?.location)
        }

    }, [isEditMode, groupItem]);

    const handleAddGroupItem: SubmitHandler<GroupItemFormInputs> = (data) => {
        const groupItemData: AddUpdateGroupItemPayload = {
            name: data.name,
            url: data.URL,
            location: data.location,
            monitoringId: monitoringId,
            groupId: groupId,
            ...(isEditMode && groupItem?.groupItemId && { groupItemId: groupItem?.groupItemId })

        };

        if (isEditMode) {
            const UpdateGroupItem = async () => {
                try {
                    const data = await AddUpdateGroupItemService(groupItemData);
                    // if (typeof data === 'object' && data !== null && 'isSuccess' in data && data.isSuccess) {
                    onClose();
                    reset();
                    refreshData();
                    // }

                } catch (err: any) {
                    console.error(err);
                }
            };
            UpdateGroupItem();
        } else {
            const AddGroupItem = async () => {
                try {
                    const newAdded = await AddUpdateGroupItemService(groupItemData);

                    if (newAdded) {

                        const newItemData = {
                            groupItemId: newAdded,
                            name: groupItemData.name,
                            url: groupItemData.url,
                            location: groupItemData.location,
                        }
                        localStorage.setItem("MonitoringGroupItem", JSON.stringify(newItemData));


                        reset();
                        onClose();
                        refreshData();
                    }

                } catch (err: any) {
                    console.error(err);
                }
            };
            AddGroupItem();
        }
    };

    return (
        <div className="cmn-pop-form">
            <div className="cmn-pop-form-wrapper">
                <Box
                    component="form"
                    onSubmit={handleSubmit(handleAddGroupItem)}
                    noValidate
                >
                    <Grid >
                        <Grid className="cmn-pop-form-inner">
                            <Grid item xs={12} md={12}>
                                <CustomTextField
                                    name="name"
                                    label={<span>Name <span className="star-error">*</span></span>}
                                    control={control}
                                    rules={{
                                        required: "Name is required.",
                                        // pattern: {
                                        //     value: REGEX.Name_Regex,
                                        //     message: "Enter a valid Name",
                                        // },
                                        maxLength: {
                                            value: COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH,
                                            message: `Name cannot exceed ${COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH} characters`,
                                        },
                                    }}
                                    placeholder="Enter name"
                                    required
                                    fullWidth
                                    inputRef={NameRef}
                                />
                            </Grid>

                            <Grid item xs={12} md={12}>
                                <CustomTextField
                                    name="URL"
                                    label={<span>URL <span className="star-error">*</span></span>}
                                    control={control}
                                    rules={{
                                        required: "URL is required.",
                                        // pattern: {
                                        //     value: REGEX.URL_Regex,
                                        //     message: "Enter a valid URL",
                                        // },

                                    }}
                                    placeholder="Enter url"
                                    required
                                    fullWidth

                                />
                            </Grid>

                            <Grid item xs={12} md={12}>
                                <CustomTextField
                                    name="location"
                                    label={<span>Location <span className="star-error">*</span></span>}
                                    control={control}
                                    rules={{
                                        required: "Location is required.",
                                        // maxLength: {
                                        //     value: COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH,
                                        //     message: `Location cannot exceed ${COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH} characters`,
                                        // },
                                    }}
                                    placeholder="Enter location"
                                    required
                                    fullWidth

                                />
                            </Grid>


                            <CustomButton className="common-btn-design" fullWidth customStyles={{ mt: 2 }}>
                                {isEditMode ? "Save" : "Add"}
                            </CustomButton>

                        </Grid>
                    </Grid>
                </Box>
            </div>
        </div>
    )
}

export { MonitoringGroupItemAddEditForm }