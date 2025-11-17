import React from "react";
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
  type?: "delete" | "logout" | "passwordsuccess" | "success" | "GenerateLicense" | "";
  customClass?: string,
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
}) => {
  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick") return;
        if (onCancel) onCancel();
      }}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      className={`cmn-pop-design-parent ${customClass}`}
    >
      {onCancel && (
        <IconButton
          onClick={onCancel}  className="pop-close-icon"
        >
          <img src={"/images/close.svg"} alt="close" />
        </IconButton>
      )}
      {type == "delete" ? (
        <Box className="pop-cmn-icon">
          <img src={"/images/delete.svg"} alt="delete" />
        </Box>
      ) : null}
      {type == "logout" ? (
        <Box className="pop-cmn-icon">
          <img src={"/images/logout.svg"} alt="logout" />
        </Box>
      ) : null}

      {type == "passwordsuccess" ? (
        <Box className="pop-cmn-icon">
          <img
            src={"/images/thumb.svg"}
            alt="Password Success Logo"
          />
        </Box>
      ) : null}

      {type == "success" ? (
        <Box className="pop-cmn-icon">
          <img src={"/images/success.svg"} alt="success" />
        </Box>
      ) : null}

      {type == "GenerateLicense" ? (
        <Box
          
          className="pop-cmn-icon"
        >
          <img
            src={"/images/generateLicense.svg"}
            alt="License Generate Logo"
          />
        </Box>
      ) : null}
      <Box className="common-dialog-body">
     
        <Typography component="h1" variant="h5">
          {title}
        </Typography>
        {/* {onCancel && (
          <IconButton onClick={onCancel} size="small">
            <HighlightOffIcon />
          </IconButton>
        )} */}
        <DialogContentText className="pop-main-sub-text">{content}</DialogContentText>
      <DialogActions className="common-pop-botton">
        {cancelText != "" && onCancel && (
          <Button
            onClick={onCancel} className="common-pop-cancel-icon"
            sx={{ textTransform: "none" }}
          >
            {cancelText}
          </Button>
        )}

        {confirmText !== "" && onConfirm && (
          <Button
            onClick={onConfirm}
            autoFocus
            sx={{ textTransform: "none" }}
          >
            {confirmText}
          </Button>
        )}
      </DialogActions>
      </Box>

    </Dialog>
  );
};

export default CommonDialog;
