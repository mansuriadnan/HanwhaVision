import React from "react";
import { useForm, Controller } from "react-hook-form";
import { RadioGroup, FormControlLabel, Radio, FormLabel, FormHelperText } from "@mui/material";

interface RadioGroupSelectorProps {
  label: string;
  name: string;
  control: any;
  options: { label: string; value: any }[];
  row?: boolean;
  resetOnOptionChange?: string;
  resetValueOnSelect?: number;
  rules?: any; // React Hook Form validation rules
  disabled?: boolean;
  disabledOptions?: any[];
}

const CustomRadio: React.FC<RadioGroupSelectorProps> = ({
  label,
  name,
  control,
  options,
  row = false,
  resetOnOptionChange,
  resetValueOnSelect,
  rules,
  disabled = false,
  disabledOptions= [],
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = e.target.value;

    // If reset logic is triggered
    if (selectedValue === resetOnOptionChange) {
      // You can call setValue or trigger reset if needed, here we just log
    }
  };

  return (
    <div>
      <FormLabel>{label}</FormLabel>
      <Controller
        name={name}
        control={control}
        defaultValue={options[0].value} // default value
        rules={rules} // validation rules
        render={({ field, fieldState }) => (
          <>
            <RadioGroup {...field} row={row} onChange={(e) => {
              field.onChange(e); 
              handleChange(e);
            }}>
              {options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  //control={<Radio  disabled={disabled}/>}
                  control={<Radio disabled={disabled || disabledOptions?.includes(option.value)} />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
            {fieldState?.error && (
              <FormHelperText error>{fieldState.error.message}</FormHelperText>
            )}
          </>
        )}
      />
    </div>
  );
};

export default CustomRadio;
