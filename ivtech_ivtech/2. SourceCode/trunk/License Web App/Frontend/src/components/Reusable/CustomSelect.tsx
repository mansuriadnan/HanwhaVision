import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectProps,
  Chip,
} from "@mui/material";
import { Controller } from "react-hook-form";

interface Option {
  id: string | number;
  title: string;
}

type FormSelectProps = SelectProps & {
  name: string;
  control: any;
  // label: string;
  label: any;
  options: Option[];
  rules?: object;
  customStyles?: object;
  hasChip?: boolean;
};

const CustomSelect: React.FC<FormSelectProps> = ({
  name,
  control,
  label,
  options,
  rules,
  variant = "filled",
  color = "primary",
  fullWidth = true,
  customStyles,
  hasChip = false,
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
          <InputLabel>{label}</InputLabel>
          <Select
            {...field}
            sx={{
              ...customStyles,
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 200, // Adjust the height as needed
                  overflowY: "auto",
                },
              },
            }}
            {...props}
          >
            {options.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {hasChip ? (
                  <Chip label={option.title} color="default" size="small" />
                ) : (
                  option.title
                )}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
};

export { CustomSelect };
