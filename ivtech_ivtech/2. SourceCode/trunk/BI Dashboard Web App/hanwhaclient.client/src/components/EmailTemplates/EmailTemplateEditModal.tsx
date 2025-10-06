import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { IEmailTemplate } from "../../interfaces/ISettings";
import { useForm } from "react-hook-form";
import { CustomTextField, CustomButton } from "../../components";

interface Props {
  open: boolean;
  template: IEmailTemplate;
  onClose: () => void;
  onSave: (updatedTemplate: IEmailTemplate) => void;
}

export const EmailTemplateEditModal: React.FC<Props> = ({
  open,
  template,
  onClose,
  onSave,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IEmailTemplate>({
    defaultValues: {
      emailTemplateTitle: template.emailTemplateTitle,
      emailTemplateDescription: template.emailTemplateDescription ?? "",
      emailTemplateHtml: template.emailTemplateHtml,
    },
  });

  const onSubmit  = (data: IEmailTemplate) => {
    const updatedTemplate: IEmailTemplate = {
      ...template,
      ...data,
      updatedOn: new Date().toISOString(),
    };
    onSave(updatedTemplate);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Edit Email Template</DialogTitle>
      <DialogContent>
        <CustomTextField
          name="emailTemplateTitle"
          control={control}
          label="Title"
          fullWidth
          rules={{ required: "Title is required" }}
          error={!!errors.emailTemplateTitle}
          helperText={errors.emailTemplateTitle?.message}
        />
        <CustomTextField
          name="emailTemplateDescription"
          control={control}
          label="Description"
          fullWidth
        />
        <CustomTextField
          name="emailTemplateHtml"
          control={control}
          label="Content"
          fullWidth
          multiline
          rows={10}
          maxRows={500}
        />
      </DialogContent>
      <DialogActions>
        <CustomButton onClick={onClose}>
          Cancel
        </CustomButton>
        <CustomButton onClick={handleSubmit(onSubmit)}>
          Save
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};
