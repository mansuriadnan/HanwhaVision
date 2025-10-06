// import React from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogContentText,
//   DialogActions,
//   Button,
//   Typography,
//   IconButton,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";

// interface CommonDialogProps {
//   open: boolean;
//   title: string;
//   content: any;
//   onConfirm?: () => void;
//   onCancel?: () => void;
//   confirmText?: string;
//   cancelText?: string;
//   maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
//   fullWidth?: boolean;
//   type?: "delete" | "success" | "";
// }

// const CommonDialog: React.FC<CommonDialogProps> = ({
//   open,
//   title,
//   content,
//   onConfirm,
//   onCancel,
//   // confirmText = 'Yes',
//   // cancelText = 'No',
//   confirmText,
//   cancelText,
//   maxWidth = "sm",
//   fullWidth = false,
// }) => {
//   return (
//     <Dialog
//       open={open}
//       onClose={onCancel}
//       maxWidth={maxWidth}
//       fullWidth={fullWidth}
//     >
//       <DialogTitle
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <Typography component="h1" variant="h5">
//           {title}
//         </Typography>
//         {onCancel && (
//           <IconButton onClick={onCancel} size="small">
//             <CloseIcon />
//           </IconButton>
//         )}
//       </DialogTitle>
//       <DialogContent>
//         <DialogContentText>{content}</DialogContentText>
//       </DialogContent>
//       <DialogActions>
//         {cancelText != "" && onCancel && (
//           <Button onClick={onCancel} color="primary">
//             {cancelText}
//           </Button>
//         )}

//         {confirmText !== "" && onConfirm && (
//           <Button onClick={onConfirm} color="primary" autoFocus>
//             {confirmText}
//           </Button>
//         )}
//       </DialogActions>
//     </Dialog>
//   );
// };

// export { CommonDialog };

import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
} from "@mui/material";

interface CommonDialogProps {
  open: boolean;
  title: any;
  content: any;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  fullWidth?: boolean;
  type?:
    | "delete"
    | "logout"
    | "passwordsuccess"
    | "success"
    | "GenerateLicense"
    | "contactAdministrator"
    | "";
  customClass?: string;
  titleClass?: boolean;
  showCloseIcon?: boolean;
  hideActions?: boolean;
  isWidget?: boolean;
}

declare global {
  interface Window {
    closeDialog?: () => void;
  }
}

const CommonDialog: React.FC<CommonDialogProps> = ({
  open,
  title,
  content,
  onConfirm,
  onCancel,
  // confirmText = 'Yes',
  // cancelText = 'No',
  confirmText,
  cancelText,
  maxWidth = "sm",
  fullWidth = false,
  type,
  customClass = "",
  titleClass = false,
  showCloseIcon = true,
  hideActions = false,
  isWidget = false,
}) => {
  useEffect(() => {
    window.closeDialog = onCancel;
  }, [open]);
  return (
    <Dialog
      open={open}
      id="commandialogcomponent"
      // onClose={onCancel}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          onCancel?.();
        }
      }}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      sx={{
        "& .MuiPaper-root": { borderRadius: "24px", position: "relative" },
      }}
      className={` cmn-pop-design-parent ${customClass}`}
    >
      {showCloseIcon && onCancel && (
        <IconButton onClick={onCancel} size="small" className="cmn-close-icon">
          <img src={"/images/close.svg"} alt="close" />
        </IconButton>
      )}
      {type == "delete" ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          alignSelf="center"
          mt={2}
        >
          <img src={"/images/delete.svg"} alt="delete" />
        </Box>
      ) : null}
      {type == "logout" ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          alignSelf="center"
          mt={2}
        >
          <img src={"/images/logout.svg"} alt="logout" />
        </Box>
      ) : null}

      {type == "passwordsuccess" ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          alignSelf="center"
          mt={2}
        >
          <img
            src={"/images/thumb.svg"}
            alt="Password Success Logo"
            width="101px"
            height="101px"
          />
        </Box>
      ) : null}

      {type == "success" ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          alignSelf="center"
          mt={2}
        >
          <img src={"/images/success.svg"} alt="success" />
        </Box>
      ) : null}

      {type == "GenerateLicense" ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          alignSelf="center"
          mt={2}
        >
          <img
            src={"/images/generateLicense.svg"}
            alt="License Generate Logo"
            width="101px"
            height="101px"
          />
        </Box>
      ) : null}

      {type == "contactAdministrator" ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          alignSelf="center"
          mt={2}
        >
          <img
            src={"/images/contactAdministrator.svg"}
            alt="Contact Administrator Logo"
            width="101px"
            height="101px"
          />
        </Box>
      ) : null}

      <DialogTitle
        // className="cmn-pop-header"
        className={titleClass ? "" : "cmn-pop-header"}
      >
        <Typography variant="h5" component="span">
          {title}
        </Typography>
        {/* {onCancel && (
          <IconButton onClick={onCancel} size="small">
            <HighlightOffIcon />
          </IconButton>
        )} */}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <div className={isWidget ? "widge-box-inner" : ""}> {content}</div>
        </DialogContentText>
      </DialogContent>
      {!hideActions && (
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
          }}
        >
          {cancelText !== undefined && onCancel && (
            <Button
              className="common-btn-design common-btn-design-transparent"
              onClick={onCancel}
              sx={{
                backgroundColor: "#F9F9FA",
                color: "#424242",
                textTransform: "none",
              }}
            >
              {cancelText}
            </Button>
          )}

          {confirmText !== undefined && onConfirm && (
            <Button
              className="common-btn-design"
              onClick={onConfirm}
              sx={{
                background: "linear-gradient(to right, #FF8A00, #FE6500)",
                color: "white",
                textTransform: "none",
              }}
              autoFocus
            >
              {confirmText}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export { CommonDialog };
