import React, { useState } from "react";
import { Box, IconButton, Tooltip, Typography, TextField } from "@mui/material";
import { IEditableWidgetNameProps } from "../../interfaces/IChart";

const CustomEditableWidgetName: React.FC<IEditableWidgetNameProps> = ({
  displayName,
  onChangeWidgetName,
}) => {
  const [hover, setHover] = useState(false);
  const [editable, setEditable] = useState(false);
  const [widgetName, setWidgetName] = useState(displayName);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const inputValue = (e.target as HTMLInputElement).value;
      setEditable(false);
      setWidgetName(inputValue);
      onChangeWidgetName?.(inputValue);
    }
  };

  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="common-popup-head"
    >
      {editable ? (
        <TextField
          // variant="outlined"
          variant="standard"
          size="small"
          value={widgetName}
          onChange={(e) => setWidgetName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          InputProps={{
            disableUnderline: true,
            style: {
              border: "1px solid #CDCDCD",
              borderRadius: 5,
              padding: -2,
            },
          }}
          // InputProps={{
          //               style: {
          //                 borderRadius: "50px", // Rounded corners
          //                 height: "50px",
          //               },
          //               endAdornment: ShowAddButton ? (
          //                 <Button
          //                   type="submit"
          //                   variant="contained"
          //                   sx={{
          //                     borderRadius: "50px",
          //                     backgroundColor: "#ff8c00", // Orange color
          //                     color: "#fff",
          //                     minWidth: "80px",
          //                     height: "40px",
          //                     textTransform: "none",
          //                   }}
          //                 >
          //                   + Add
          //                 </Button>
          //               ) : null,
          //             }}
        />
      ) : (
        <>
          <Typography variant="h6" component="h2">
            {widgetName}
          </Typography>
          <Box
            sx={{
              visibility: hover ? "visible" : "hidden",
            }}
          ></Box>
          <Tooltip title="Edit Widget Name">
            <IconButton onClick={() => setEditable(true)}>
              <img
                src={"/images/user-action-edit.svg"}
                alt="Edit"
                width={20}
                height={20}
              />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Box>
  );
};

export { CustomEditableWidgetName };
