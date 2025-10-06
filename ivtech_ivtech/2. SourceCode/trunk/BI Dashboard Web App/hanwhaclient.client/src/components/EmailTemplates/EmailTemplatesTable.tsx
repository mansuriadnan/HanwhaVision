import React, { useEffect, useState } from "react";
import { IEmailTemplate } from "../../interfaces/ISettings";
import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { formatDate } from "../../utils/dateUtils";
import { EmailTemplatePreviewModal } from "./EmailTemplatePreviewModal";
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { EmailTemplateEditModal } from "./EmailTemplateEditModal";
import { useLocation } from "react-router-dom";
import { usePermissions } from "../../context/PermissionsContext";
// import { filterByScreenName } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";
import { HasPermission } from "../../utils/screenAccessUtils";

interface Props {
  templates: IEmailTemplate[];
  onEdit: (updatedTemplate: IEmailTemplate) => void;
}

export const EmailTemplatesTable: React.FC<Props> = ({ templates, onEdit }) => {
  const [selectedTemplateHtml, setSelectedTemplateHtml] = useState<
    string | null
  >(null);

  const [templateToEdit, setTemplateToEdit] = useState<IEmailTemplate | null>(
    null
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const { permissions }: { permissions: any[] } = usePermissions();
  const location = useLocation();
  const label = location.state?.label;
  const [filteredChildren, setFilteredChildren] = useState<any[]>([]);


  // useEffect(() => {
  //   if (label && permissions.length > 0) {
  //     // Find the matching permission by label
  //     const matchingPermission = permissions.find(
  //       (permission: any) => permission.screenName === label
  //     );

  //     if (matchingPermission && matchingPermission.children.length > 0) {
  //       setFilteredChildren(matchingPermission.children)
  //     }

  //   }
  // }, [label, permissions]);

  const handlePreview = (templateHtml: string, templateId: string) => {
    setSelectedTemplateHtml(templateHtml);
    setSelectedTemplateId(templateId);
  };

  const handleClosePreview = () => {
    setSelectedTemplateHtml(null);
    setSelectedTemplateId(null);
  };

  const handleDelete = () => {
  };

  const handleEdit = (template: IEmailTemplate) => {
    setTemplateToEdit(template);
  };

  const handleCloseEdit = () => {
    setTemplateToEdit(null);
  };

   
  // const filteredEdit = filterByScreenName(filteredChildren, LABELS.Add_or_Update_Email_template_details);
  // const filteredViewAll = filterByScreenName(filteredChildren, LABELS.Can_View_All_Email_Templates);
  // const filteredSendEmail = filterByScreenName(filteredChildren, LABELS.Can_Send_test_email);

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Template Name</strong>
              </TableCell>
              <TableCell>
                <strong>Title</strong>
              </TableCell>
              <TableCell>
                <strong>Description</strong>
              </TableCell>
              <TableCell>
                <strong>Created Date</strong>
              </TableCell>
              <TableCell>
                <strong>Last Updated Date</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((template, index) => (
              <TableRow key={template.id}>
                <TableCell>{template.emailTemplateName}</TableCell>
                <TableCell>{template.emailTemplateTitle}</TableCell>
                <TableCell>
                  {template.emailTemplateDescription ?? "N/A"}
                </TableCell>
                <TableCell>{formatDate(template.createdOn)}</TableCell>
                <TableCell>{formatDate(template.updatedOn)}</TableCell>
                <TableCell align="right">

                {HasPermission(LABELS.Can_View_All_Email_Templates) && (
                  <Tooltip title="Preview">
                    <IconButton
                      onClick={() =>
                        handlePreview(template.emailTemplateHtml, template.id)
                      }
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                )}

                  {HasPermission(LABELS.Add_or_Update_Email_template_details) && (
                    <Tooltip title="Edit Template">
                      <IconButton onClick={() => handleEdit(template)}>
                        <EditIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  )}

              
                    <Tooltip title="Delete Template">
                      <IconButton onClick={() => handleDelete()}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Tooltip>
                  
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {selectedTemplateHtml && selectedTemplateId && (
        <EmailTemplatePreviewModal
          open={!!selectedTemplateHtml}
          onClose={handleClosePreview}
          templateHtml={selectedTemplateHtml}
          templateId={selectedTemplateId}
          filteredSendEmail={HasPermission(LABELS.Can_Send_test_email)}
        />
      )}
      {templateToEdit && (
        <EmailTemplateEditModal
          open={!!templateToEdit}
          template={templateToEdit}
          onClose={handleCloseEdit}
          onSave={(updatedTemplate) => {
            onEdit(updatedTemplate); // Update the template
            handleCloseEdit();
          }}
        />
      )}
    </>
  );
};
