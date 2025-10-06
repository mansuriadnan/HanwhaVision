import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  DialogActions,
} from "@mui/material";
import { showToast } from "../Reusable/Toast";
import { SendEmailService } from "../../services/emailTemplateService";

interface EmailTemplatePreviewModalProps {
  open: boolean;
  onClose: () => void;
  templateHtml: string;
  templateId: string;
  filteredSendEmail:boolean;
}

export const EmailTemplatePreviewModal: React.FC<
  EmailTemplatePreviewModalProps
> = ({ open, onClose, templateHtml, templateId, filteredSendEmail }) => {
  const [loading, setLoading] = useState(true);

  const handleSendTestEmail = async (templateId: string) => {
    try {
      setLoading(true);
      const data = await SendEmailService(templateId);

      if (typeof data === "string") {
        showToast(data, "error");
      } else {
        showToast("Email Sent Successfully", "success");
      }
    } catch (err: any) {
      showToast("Failed to send the email. Please try again.", "error");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const formattedHtml = templateHtml.replace(/\n/g, "<br />");
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Email Template Preview</DialogTitle>
      <DialogContent>
        <Typography component="div">
          <div dangerouslySetInnerHTML={{ __html: formattedHtml }} />
        </Typography>
      </DialogContent>
      <DialogActions>
        {filteredSendEmail && (
        <Button
        onClick={() => handleSendTestEmail(templateId)}
        sx={{ marginTop: 2 }}
        variant="contained"
      >
        Send Test Email
      </Button>
        )}
        <Button onClick={onClose} sx={{ marginTop: 2 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
