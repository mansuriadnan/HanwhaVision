import React from "react";
import { ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useController, Control } from "react-hook-form";

interface SingleSelectToggleButtonProps {
    name: string;
    control?: Control<any>;
    options: { label: string; value: string, iconPath?: string }[];
    title?: string;  // Added title prop
    rules?: object;  // Allow passing validation rules
    defaultValue?: string;           
    allowNoneSelected?: boolean;
}

const CustomSelectToggleButton: React.FC<SingleSelectToggleButtonProps> = ({ name, control, options, title, rules, defaultValue, allowNoneSelected = true }) => {
    const {
        field: { value, onChange },
        fieldState: { error }, // Get validation error
    } = useController({ name, control, rules, defaultValue: allowNoneSelected ? "" : defaultValue || options[0]?.value, });

    return (
        <div className="cmn-pop-tab">

            <Typography className="cmn-tab-title">
                {title}
            </Typography>


            <ToggleButtonGroup
                value={value || ""}
                exclusive
                onChange={(_, newValue) => {
                    // if (allowNoneSelected && value === newValue) {
                    //     onChange(""); // deselect if same is clicked again
                    // } else {
                    //     onChange(newValue);
                    // }
                    if (allowNoneSelected) {
                        // If same value clicked again, allow deselect
                        onChange(value === newValue ? "" : newValue);
                    } else {
                        // Prevent deselection — only allow change to a different value
                        if (newValue !== null) {
                            onChange(newValue);
                        }
                    }
                }}
                fullWidth
            >
                {options.map((option) => (
                    <ToggleButton key={option.value} value={option.value} sx={toggleButtonStyle}>
                        {option.iconPath ? (
                            <img src={option.iconPath} alt={option.value} />
                        ) : (
                            option.label
                        )}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>


            {error && (
                <p>
                    {error.message}
                </p>
            )}
        </div>
    );
};

export { CustomSelectToggleButton };

const toggleButtonStyle = {
    border: "1px solid #DADADA",
    borderRadius: "8px",
    textTransform: "none",
    fontWeight: 600,
    color: "#616161",
    "&.Mui-selected": {
        // backgroundColor: "#ff7f00",
        border: "1px solid #FF8A01",
        color: " #FF8A01",
        "&:hover": {
            border: "1px solid #FF8A01",
            color: " #FF8A01",
        },
    },
};