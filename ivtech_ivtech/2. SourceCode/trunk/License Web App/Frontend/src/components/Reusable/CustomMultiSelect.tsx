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
} from "@mui/material";
import { Controller } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";

interface Option {
  id: string;
  title: string;
}

type MultiSelectProps = SelectProps & {
  name: string;
  control: any;
  label: any;
  options: Option[];
  rules?: object;
  customStyles?: object;
};

const CustomMultiSelect: React.FC<MultiSelectProps> = ({
  name,
  control,
  label,
  options,
  rules,
  variant = "filled",
  color = "primary",
  fullWidth = true,
  customStyles,
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth={fullWidth} margin="normal" error={!!error}  variant={variant}>
          <InputLabel>{label}</InputLabel>
          <Select
            {...field}
            multiple
            value={field.value || []}
            onChange={(event) => field.onChange(event.target.value)}
            sx={customStyles}
            renderValue={(selected) => (
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
                      className="delete-icon-inner"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      />
                    }
                  />
                ))}
              </Box>
            )}
            {...props}
          >
            {options.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                <Checkbox checked={field.value?.includes(option.id)} />
                {/* <Checkbox checked={watch("roleIds")?.includes(option.id)} /> */}
                <ListItemText primary={option.title} />
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
};

export { CustomMultiSelect };
