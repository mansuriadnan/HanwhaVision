// import React, { useState } from "react";
// import { IconButton, InputAdornment, TextField, TextFieldProps } from "@mui/material";
// import { Controller, Control, FieldValues, Path } from "react-hook-form";
// import { Visibility, VisibilityOff } from "@mui/icons-material";

// type CustomTextFieldProps<T extends FieldValues> = TextFieldProps & {
//   name: Path<T>; // Ensures name matches form fields
//   control: Control<T>; // Correctly types control
//   rules?: any; // Validation rules for react-hook-form
//   customStyles?: React.CSSProperties; // Custom styling option
// };

// export const CustomTextField = <T extends FieldValues>({
//   name,
//   control,
//   rules,
//   customStyles,
//   type = "text",
//   multiline = false,
//   rows = 0,
//   maxRows = 5,
//    variant="filled",
//   ...rest
// }: CustomTextFieldProps<T>) => {
//   const [showPassword, setShowPassword] = useState<boolean>(false);

//   const togglePasswordVisibility = () => {
//     setShowPassword((prev) => !prev);
//   };
//   return (
//     <Controller
//       name={name}
//       control={control}
//       rules={rules}
//       render={({ field, fieldState: { error } }) => (
//         <TextField
//           {...field}
//           {...rest}
//           margin="normal"
//           type={type === "password" && !showPassword ? "password" : showPassword ? "text" : type}
//           error={!!error}
//           helperText={error?.message}
//           style={{ ...customStyles }}
//           InputLabelProps={{ shrink: true }}
//           variant={variant}
//           multiline = {multiline}
//           rows={rows}
//           maxRows={maxRows}
//           InputProps={
//             type === "password"
//               ? {
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <IconButton onClick={togglePasswordVisibility} edge="end" disabled={rest.disabled}>
//                         {showPassword ? <VisibilityOff /> : <Visibility />}
//                       </IconButton>
//                     </InputAdornment>
//                   ),
//                 }
//               : undefined
//           }
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
  FormControl,
  FormLabel,
} from "@mui/material";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type CustomTextFieldProps<T extends FieldValues> = TextFieldProps & {
  name: Path<T>;
  control: Control<T>;
  rules?: any;
  customStyles?: React.CSSProperties;
  label?: any;
  displayValueMap?: Record<string, string>;
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
  }
}

export const CustomTextField = <T extends FieldValues>({
  name,
  control,
  rules,
  customStyles,
  type = "text",
  label,
  displayValueMap,
  ...rest
}: CustomTextFieldProps<T>) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <FormControl style={{ width: "100%", ...customStyles }}>
      {label && (
        <FormLabel style={{ marginBottom: 4, fontWeight: 500, fontSize: "14px" }}>
          {label}
        </FormLabel>
      )}
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => {
          const rawValue = field.value;
          const isDisabled = rest.disabled;
          const displayValue = isDisabled && displayValueMap?.[rawValue] ? displayValueMap[rawValue] : rawValue;
          return (<TextField
            {...field}
            {...rest}
            inputRef={rest.inputRef ?? field.ref}
            type={type === "password" && !showPassword ? "password" : showPassword ? "text" : type}
            error={!!error}
            helperText={error?.message}
            variant="outlined"
            fullWidth
            placeholder={rest.placeholder}
            value={displayValue}
            // sx={{ ...stylesCSS.input }}
            sx={{
              ...stylesCSS.input,
              "& input": {
                fontSize: "16px",
              },
              "& input::placeholder": {
                fontSize: "16px",
                color: "#aaa",
                opacity: 1,
              },
              "& .MuiFormHelperText-root": {
                marginTop: "3px", // or 0 to remove completely
                marginBottom: "0px",
                lineHeight: 1.2,
              },
            }}
            //style={{...customStyles}}
            InputProps={{
              style: {
                borderRadius: "20px", // Rounded corners
              },
              endAdornment:
                type === "password" ? (
                  <InputAdornment position="end" sx={{ ml: '5px' ,mr:'5px'}}>
                    <IconButton onClick={togglePasswordVisibility} edge="end" disabled={rest.disabled}  sx={{ p: 0, ml: 0 }}>
                      {showPassword ? <img src="/images/hide-password.svg" alt="hide-password" /> : <img src="/images/show-password.svg" alt="hide-password" />}
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
            }}
          />
        )}}
      />
    </FormControl>
  );
};
