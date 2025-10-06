// import React from "react";
// import { TextField, TextFieldProps } from "@mui/material";
// import { Controller, Control, FieldValues } from "react-hook-form";

// type CustomTextFieldProps = TextFieldProps & {
//   name: string;
//   control: Control<FieldValues>;
//   rules?: any; // Validation rules for react-hook-form
//   customStyles?: React.CSSProperties; // Custom styling option
//   // label: string;
//   // fullWidth?: boolean;
//   // autoFocus?: boolean;
//   // variant?: any;
// }

// export const CustomTextField: React.FC<CustomTextFieldProps> = ({
//   name,
//   control,
//   rules,
//   customStyles,
//   // label,
//   // fullWidth,
//   // autoFocus,
//   // variant = "outlined",
//   ...rest
// }) => {
//   return (
//     <Controller
//       name={name}
//       control={control}
//       rules={rules}
//       render={({ field, fieldState: { error } }) => (
//         <TextField
//           {...field}
//           {...rest}
//           error={!!error}
//           helperText={error?.message}
//           style={{ ...customStyles, margin: 8 }}
//           InputLabelProps={{ shrink: true }}
//           variant="outlined"
//           // label={label}
//           // fullWidth={fullWidth}
//           // autoFocus={autoFocus}
//           // variant={variant}
//         />
//       )}
//     />
//   );
// };

import React, { useState } from "react";
import {
  IconButton,
  InputAdornment,
  TextField,
  TextFieldProps,
} from "@mui/material";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

type CustomTextFieldProps<T extends FieldValues> = TextFieldProps & {
  name: Path<T>; // Ensures name matches form fields
  control: Control<T>; // Correctly types control
  rules?: any; // Validation rules for react-hook-form
  customStyles?: React.CSSProperties; // Custom styling option
  formatType?: "mac"; // NEW: allow special formatting (extendable later)
};

const stylesCSS = {
  input: {
    "& input[type=number]": {
      MozAppearance: "textfield",
    },
    "& input[type=number]::-webkit-outer-spin-button": {
      WebkitAppearance: "none",
      margin: 0,
    },
    "& input[type=number]::-webkit-inner-spin-button": {
      WebkitAppearance: "none",
      margin: 0,
    },
  },
};

export const CustomTextField = <T extends FieldValues>({
  name,
  control,
  rules,
  customStyles,
  type = "text",
  multiline = false,
  rows = 0,
  maxRows = 5,
  variant = "filled",
  formatType, // <-- NEW PROP
  ...rest
}: CustomTextFieldProps<T>) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // --- Helper for MAC formatting ---
  const formatMac = (value: string): string => {
    const clean = value.replace(/[^A-Fa-f0-9]/g, ""); // keep hex only
    const pairs = clean.match(/.{1,2}/g) || [];
    return pairs.join("-").substring(0, 17); // max XX-XX-XX-XX-XX-XX
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...rest}
          margin="normal"
          type={
            type === "password" && !showPassword
              ? "password"
              : showPassword
              ? "text"
              : type
          }
          error={!!error}
          helperText={error?.message}
          style={{ ...customStyles }}
          sx={{ ...stylesCSS.input }}
          InputLabelProps={{ shrink: true }}
          variant={variant}
          multiline={multiline}
          rows={rows}
          maxRows={maxRows}
          onChange={(e) => {
            let val = e.target.value;

            // If mac formatting enabled, apply it
            if (formatType === "mac") {
              val = formatMac(val);
            }

            field.onChange(val); // update react-hook-form value
          }}
          value={field.value ?? ""}
          InputProps={
            type === "password"
              ? {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        disabled={rest.disabled}
                      >
                        {showPassword ? (
                          <VisibilityOffOutlinedIcon />
                        ) : (
                          <VisibilityOutlinedIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              : undefined
          }
        />
      )}
    />
  );
};
