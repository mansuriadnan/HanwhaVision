import apiUrls from "../constants/apiUrls";
import { IEmailTemplate, ISendEmailDto } from "../interfaces/ISettings";
import { apiGetService } from "../utils/apiGetService";
import { apiPostService } from "../utils/apiPostService";

export const GetEmailTemplatesService = () =>
  apiGetService<IEmailTemplate[]>({
    url: apiUrls.GetEmailTemplates,
  });

export const UpdateEmailTemplateService = (updatedTemplate: IEmailTemplate) =>
  apiPostService<IEmailTemplate>({
    url: apiUrls.UpdateEmailTemplate,
    data: updatedTemplate,
  });

export const SendEmailService = (templateId: string) =>
  apiPostService<ISendEmailDto>({
    url: apiUrls.SendEmailTemplate,
    data: { id: templateId },
  });
