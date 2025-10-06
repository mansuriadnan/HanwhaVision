import React, { ReactNode } from "react";
import { Button, ButtonProps } from "@mui/material";
import { useFormContext } from "react-hook-form";

type CustomButtonProps = ButtonProps & {
  children: ReactNode;
  customStyles?:object;
};

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  variant = "contained",
  color = "primary",
  fullWidth = false,
  customStyles,
  ...props
}) => {
  const formContext = useFormContext();
  const isSubmitting = formContext?.formState?.isSubmitting || false;

  //   const {
  //     formState: { isSubmitting },
  //   } = useFormContext();

  return (
    <Button
      type="submit"
      variant={variant}
      color={color}
      fullWidth={fullWidth}
      disabled={isSubmitting}
      sx={{textTransform: "none" , background: "linear-gradient(to right, #FF8A00, #FE6500)", ...customStyles}}
      {...props}
    >
      {isSubmitting ? "Submitting..." : children}
    </Button>
  );
};

export { CustomButton };
