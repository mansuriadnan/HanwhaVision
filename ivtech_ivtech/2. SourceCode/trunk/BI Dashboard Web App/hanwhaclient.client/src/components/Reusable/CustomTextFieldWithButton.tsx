import React from "react";
import { TextField, TextFieldProps, FormControl, Button } from "@mui/material";
import { Controller, Control, FieldValues, Path } from "react-hook-form";

type CustomTextFieldWithButtonProps<T extends FieldValues> = TextFieldProps & {
  name: Path<T>;
  control: Control<T>;
  rules?: any;
  customStyles?: React.CSSProperties;
  ShowAddButton?: boolean;
};

// const stylesCSS = {
//   input: {
//     "& input[type=number]": {
//       MozAppearance: "textfield",
//     },
//     "& input[type=number]::-webkit-outer-spin-button": {
//       WebkitAppearance: "none",
//       margin: 0,
//     },
//     "& input[type=number]::-webkit-inner-spin-button": {
//       WebkitAppearance: "none",
//       margin: 0,
//     },
//   },
// };

const CustomTextFieldWithButton = <T extends FieldValues>({
  name,
  control,
  rules,
  customStyles,
  type = "text",
  ShowAddButton = true,
  ...rest
}: CustomTextFieldWithButtonProps<T>) => {
  return (
    <FormControl style={{ width: "100%", ...customStyles }}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            {...rest}
            error={!!error}
            // helperText={error?.message}
            helperText={typeof error?.message === "string" ? error.message : ""}
            variant="outlined"
            fullWidth
            // sx={{ ...stylesCSS.input }}
            //style={{...customStyles}}
            FormHelperTextProps={{
              style: { marginLeft: "15px" }, 
            }}
            InputProps={{
              style: {
                borderRadius: "50px", // Rounded corners
                height: "50px",
              },
              endAdornment: ShowAddButton ? (
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    borderRadius: "50px",
                    backgroundColor: "#ff8c00", // Orange color
                    color: "#fff",
                    minWidth: "80px",
                    height: "40px",
                    textTransform: "none",
                  }}
                >
                  + Add
                </Button>
              ) : null,
            }}
          />
        )}
      />
    </FormControl>
  );
};

export { CustomTextFieldWithButton };
