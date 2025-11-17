import React from "react";
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Box,
    Chip,
    FormHelperText,
    SelectProps,
    Checkbox,
    ListItemText,
    FilledInput,
    FormLabel,
} from "@mui/material";
import { Controller } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";

interface Option {
    disabled: boolean;
    isParent: boolean;
    title: string;
    id: string;
}

type MultiSelectProps = SelectProps & {
    name: string;
    control: any;
    label: any;
    options: Option[];
    rules?: object;
    customStyles?: object;
    placeholder?:string;
};

const CustomStyleMultiSelect: React.FC<MultiSelectProps> = ({
    name,
    control,
    label,
    options,
    rules,
    variant = "filled",
    color = "primary",
    fullWidth = true,
    customStyles,
    placeholder,
    ...props
}) => {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState: { error } }) => (

                <FormControl
                    fullWidth={fullWidth}
                    margin="normal"
                    error={!!error}
                    variant={variant}
                >
                    {label && (
                        <FormLabel
                            style={{ fontWeight: 500, color: "#212121" }}
                        >
                            {label}
                        </FormLabel>
                    )}
                    <Select
                        {...field}
                        multiple
                        displayEmpty
                        value={field.value || []}
                        onChange={(event) => field.onChange(event.target.value)}
                        sx={{
                            ...customStyles,
                            borderRadius: "12px", // Adjust as needed
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderRadius: "12px", // For outlined variant
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#1976d2", // Adjust the focused color if necessary
                            },
                        }}
                        renderValue={(selected) => {
                            if (!selected.length) {
                                return <span style={{ color: "#aaa" }}>{placeholder}</span>; 
                            }
                            return (
                                <Box display="flex" flexWrap="wrap" gap={0.5}>
                                    {selected.map((value) => (
                                        <Chip
                                            key={value}
                                            label={options.find((role) => role.id === value)?.title}
                                            onDelete={(e) => {
                                                e.stopPropagation();
                                                field.onChange(field.value.filter((id) => id !== value));
                                            }}
                                            deleteIcon={
                                                <CloseIcon
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                    }}
                                                />
                                            }
                                        />
                                    ))}
                                </Box>
                            )
                        }}
                        {...props}
                    >
                        {options?.map((option) => {
                            const isChild = !option?.isParent;
                            return (
                                <MenuItem key={option.id} value={option.id}>

                                    <ListItemText
                                        primary={
                                            <span
                                                style={{
                                                    fontWeight: isChild ? "normal" : "bold",
                                                    paddingLeft: isChild ? "20px" : "0px",
                                                }}
                                            >
                                                <Checkbox checked={field.value?.includes(option.id)} />
                                                {option.title}
                                            </span>
                                        }
                                    />
                                </MenuItem>
                            );
                        })}
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                </FormControl>
            )}
        />
    );
};

export { CustomStyleMultiSelect };
