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
  placeholder?: any;
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
  placeholder = "",
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
          <FormLabel
            style={{
              marginBottom: 4,
              fontWeight: 500,
              fontSize: "14px",
              color: "#212121",
            }}
          >
            {label}
          </FormLabel>
          <Select
            {...field}
            displayEmpty
            multiple
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
                return (
                  <span
                    style={{
                      color: "#aaa",
                      fontSize: "14px",
                      marginLeft: "10px",
                    }}
                  >
                    {placeholder}
                  </span>
                );
              }

              const selectedLabels = selected
                .map((value: any) => {
                  const option = options.find((role) => role.id === value);
                  return option?.title;
                })
                .filter(Boolean)
                .join(", ");

              return (
                <Box
                  // sx={{
                  //   display: "block",
                  //   whiteSpace: "nowrap",
                  //   overflow: "hidden",
                  //   textOverflow: "ellipsis",
                  //   fontSize: "14px",
                  //   marginLeft: "10px",
                  // }}
                >
                  {selectedLabels}
                </Box>
              );
            }}
            // renderValue={(selected) => {
            //   if (!selected.length) {
            //     return (
            //       <span
            //         style={{
            //           color: "#aaa",
            //           fontSize: "14px",
            //           marginLeft: "10px",
            //         }}
            //       >
            //         {placeholder}
            //       </span>
            //     ); // your placeholder
            //   }
            //   return (
            //     <Box
            //       // display="flex" flexWrap="wrap" gap={0.5}
            //       //if dont want scroll the remove below sx prop
            //       sx={{
            //         display: "flex",
            //         flexWrap: "wrap",
            //         gap: 0.5,
            //         maxHeight: "32px", // Approx height for one line of chips
            //         overflowY: "auto",
            //         alignItems: "center",
            //         "&::-webkit-scrollbar": {
            //           width: 4,
            //         },
            //         "&::-webkit-scrollbar-thumb": {
            //           backgroundColor: "#ccc",
            //           borderRadius: 3,
            //         },
            //       }}
            //     >
            //       {selected.map((value: any) => {
            //         const option = options.find((role) => role.id === value);
            //         if (!option) return null;
            //         return (
            //           <Chip
            //             key={value}
            //             label={option.title}
            //             onDelete={(e) => {
            //               e.stopPropagation();
            //               field.onChange(
            //                 field.value.filter((id) => id !== value)
            //               );
            //             }}
            //             deleteIcon={
            //               <CloseIcon
            //                 onMouseDown={(e) => {
            //                   e.stopPropagation();
            //                   e.preventDefault();
            //                 }}
            //               />
            //             }
            //           />
            //         );
            //       })}
            //     </Box>
            //   );
            // }}
            {...props}
          >
            {options?.map((option) => (
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
