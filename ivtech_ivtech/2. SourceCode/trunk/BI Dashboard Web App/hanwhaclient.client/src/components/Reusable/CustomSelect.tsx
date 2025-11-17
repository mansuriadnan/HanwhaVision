// import React from "react";
// import {
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   FormHelperText,
//   SelectProps,
//   Chip,
// } from "@mui/material";
// import { Controller } from "react-hook-form";

// interface Option {
//   id: string | number;
//   title: string;
// }

// type FormSelectProps = SelectProps & {
//   name: string;
//   control: any;
//   label: string;
//   options: Option[];
//   rules?: object;
//   customStyles?:object;
//   hasChip?:boolean
// };

// const CustomSelect: React.FC<FormSelectProps> = ({
//   name,
//   control,
//   label,
//   options,
//   rules,
//   variant = "filled",
//   color = "primary",
//   fullWidth = true,
//   customStyles,
//   hasChip = false,
//   ...props
// }) => {
//   return (
//     <Controller
//       name={name}
//       control={control}
//       rules={rules}
//       render={({ field, fieldState: { error } }) => (
//         <FormControl fullWidth={fullWidth} margin="normal" error={!!error}  variant={variant}>
//           <InputLabel>{label}</InputLabel>
//           <Select
//             {...field}

//             sx={{
//               ...customStyles,
//             }}
//             {...props}
//           >
//             {options.map((option) => (
//               <MenuItem key={option.id} value={option.id}>
//                  {hasChip ? (
//                   <Chip label={option.title} color="default" size="small" />
//                 ) : (
//                   option.title
//                 )}
//               </MenuItem>
//             ))}
//           </Select>
//           {error && <FormHelperText>{error.message}</FormHelperText>}
//         </FormControl>
//       )}
//     />
//   );
// };

// export { CustomSelect };

import React from "react";
import {
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
  Chip,
  SelectProps,
  FormLabel,
} from "@mui/material";
import { Controller } from "react-hook-form";

interface Option {
  id: string | number;
  title: string;
}

type FormSelectProps = SelectProps & {
  name: string;
  control: any;
  label?: any;
  options: Option[];
  rules?: object;
  customStyles?: object;
  hasChip?: boolean;
  placeholder?: string;
};

const CustomSelect: React.FC<FormSelectProps> = ({
  name,
  control,
  label,
  options,
  rules,
  variant = "outlined",
  color = "primary",
  fullWidth = true,
  customStyles,
  hasChip = false,
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
          {label && (
            <FormLabel
              style={{ marginBottom: 4, fontWeight: 500, fontSize: "14px" }}
            >
              {label}
            </FormLabel>
          )}
          <Select
            {...field}
            displayEmpty
            sx={{
              borderRadius: "20px",
              "&:before": {
                borderBottom: "none",
              },
              "&:after": {
                borderBottom: "none",
              },
              "&:hover:not(.Mui-disabled):before": {
                borderBottom: "none",
              },
              ...customStyles,
            }}
            inputProps={{
              disableUnderline: true, // This only works for certain variants like 'standard'
            }}
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <span style={{ color: "#808080"}}>
                    {placeholder}
                  </span>
                );
              }

              const selectedOption = options.find((opt) => opt.id === selected);
              return hasChip ? (
                <Chip label={selectedOption?.title} size="small" />
              ) : (
                selectedOption?.title
              );
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
