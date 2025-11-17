import { Box, Container, FormControl, Typography } from "@mui/material"
// import { CustomButton, CustomTextField, showToast } from "../../components"
import { CustomButton } from "../../components/Reusable/CustomButton"
import { CustomTextField } from "../../components/Reusable/CustomTextField"
import { showToast } from "../../components/Reusable/Toast"
import { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ISite } from "../../interfaces/IMultiSite";
import { REGEX } from "../../utils/constants";
import handleResponse from "../../utils/handleResponse";
import { AddChildSiteService, UpdateChildSiteService } from "../../services/siteManagementService";

interface SiteAddEditFormProps {
    onClose: () => void;
    sites?: ISite;
    refreshData: () => void;
}

interface SiteFormInputs {
    siteName: string;
    hostingAddress: string;
    userName: string;
    password: string;

}

const ChildSiteAddEditForm: React.FC<SiteAddEditFormProps> = ({ onClose, sites, refreshData }) => {
    // const [error, setError] = useState<string | null>(null);
    const isEditMode = sites !== null && sites !== undefined;
    const {
        control,
        setValue,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SiteFormInputs>({
        defaultValues: {
            siteName: "",
            hostingAddress: "",
            userName: "",
            password: ""
        },
    });

    const siteNameRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (siteNameRef.current) {
            siteNameRef.current.focus();
        }
    }, []);
    
    useEffect(() => {
        if (isEditMode && sites) {

            const initialChildSite = sites;
            setValue("siteName", initialChildSite?.siteName);
            setValue("hostingAddress", initialChildSite?.hostingAddress);
            setValue("userName", initialChildSite?.username);
            setValue("password", initialChildSite?.password);
        }

    }, [isEditMode, sites]);

    const siteSubmit: SubmitHandler<SiteFormInputs> = async (data) => {
        const childSiteData =
        {
            siteName: data.siteName,
            hostingAddress: data.hostingAddress,
            username: data.userName,
            password: data.password,
            ...(isEditMode &&
                sites?.id && { id: sites.id }),
        };

        if (isEditMode) {
            const updateChildSite = async () => {
                // setError(null); // Reset error
                try {
                    const data = await UpdateChildSiteService(childSiteData);
                    if (typeof data === 'object' && data !== null && 'isSuccess' in data && data.isSuccess) {
                        onClose();
                        refreshData();
                    }

                } catch (err: any) {
                    // setError(err.message || "An error occurred while fetching users.");
                    showToast("An error occurred while updating child site.", "error");
                }
            };
            updateChildSite();
        } else {

            const AddChildSite = async () => {
                // setError(null); // Reset error
                try {
                    const data = await AddChildSiteService(childSiteData);
                    if (typeof data === 'object' && data !== null && 'isSuccess' in data && data.isSuccess) {
                        onClose();
                        refreshData();
                    }

                } catch (err: any) {
                    // setError(err.message || "An error occurred while fetching users.");
                    showToast("An error occurred while adding child site.", "error");
                }
            };
            AddChildSite();
        }
    }

    return (

        <Box className='cmn-pop-form'>
            <Box className="cmn-pop-form-wrapper">
                <Box
                    component="form"
                    onSubmit={handleSubmit(siteSubmit)}
                    noValidate
                    sx={{ width: "100%", mt: '2rem' }}
                >

                    <Box className="cmn-pop-form-inner">
                        <CustomTextField
                            name="siteName"
                            label={<span>Site Name <span className="star-error">*</span></span>}
                            control={control}
                            rules={{
                                required: "Site Name is required.",
                            }}
                            placeholder="Enter site name"
                            required
                            fullWidth
                            inputRef={siteNameRef}
                        />
                        <CustomTextField
                            name="hostingAddress"
                            label={<span>Hosting Address <span className="star-error">*</span></span>}
                            control={control}
                            rules={{
                                required: "Hosting Address is required.",
                                pattern: {
                                    value: REGEX.IPAddressURL_Regex,
                                    message: "Enter a valid Hosting Address",
                                },
                            }}
                            placeholder="Enter hosting address"
                            required
                            fullWidth
                        />
                        <CustomTextField
                            name="userName"
                            label={<span>Username <span className="star-error">*</span></span>}
                            control={control}
                            rules={{
                                required: "User Name is required.",
                                pattern: {
                                    value: REGEX.UserName_Regex,
                                    message: "Enter a valid user name",
                                },
                            }}
                            placeholder="Enter username"
                            required
                            fullWidth
                        />
                        <CustomTextField
                            name="password"
                            label={<span>Password <span className="star-error">*</span></span>}
                            control={control}
                            type={"password"}
                            placeholder="Enter password"
                            rules={{
                                required: "Password is required",
                                // pattern: {
                                //     value: REGEX.Password_Regex,
                                //     message: "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character (excluding *)",
                                // },
                            }}
                        />

                        <CustomButton className="common-btn-design" fullWidth customStyles={{ mt: 2 }}>
                            {isEditMode ? "Update" : "Add"}
                        </CustomButton>
                    </Box>

                </Box>
            </Box>
        </Box>

    )
}

export { ChildSiteAddEditForm }