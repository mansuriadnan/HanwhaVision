using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.DbEntities;
using System.Net;
using System.Net.Mail;

namespace HanwhaClient.Core.Services
{
    public class EmailSenderService
    {
        //private static readonly string SmtpServer = "smtp.ethereal.email";
        //private static readonly int SmtpPort = 587;
        //private static readonly string SmtpUsername = "vena.schinner53@ethereal.email";
        //private static readonly string SmtpPassword = "Myzaq8n3x8rVGgSjqZ";

        private readonly IEmailRequestLogRepository _emailRequestLogRepository;
        private readonly IClientSettingRepository _clientSettingRepository;

        public EmailSenderService(IEmailRequestLogRepository emailRequestLogRepository,
            IClientSettingRepository clientSettingRepository)
        {
            this._emailRequestLogRepository = emailRequestLogRepository;
            this._clientSettingRepository = clientSettingRepository;
        }

        public async Task SendEmailAsync(
            IEnumerable<string> to,
            IEnumerable<string> cc,
            IEnumerable<string> bcc,
            string subject,
            string body,
            IEnumerable<(string fileName, byte[] fileBytes)> attachments)
        {

            var clientSettings = await _clientSettingRepository.GetClientSettingsAsync();
            if (clientSettings?.SmtpSettings == null)
            {
                return;
            }
            var SmtpSettings = clientSettings.SmtpSettings;
            if (to == null || !to.Any())
            {
                throw new ArgumentException("Recipient list cannot be empty.", nameof(to));
            }

            using var smtpClient = new SmtpClient(SmtpSettings.Host, SmtpSettings.Port)
            {
                Credentials = new NetworkCredential(SmtpSettings.Username, SmtpSettings.Password),
                EnableSsl = true
            };

            using var mailMessage = new MailMessage
            {
                From = new MailAddress(SmtpSettings.FromEmail),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            foreach (var recipient in to)
            {
                mailMessage.To.Add(recipient);
            }

            if (cc != null)
            {
                foreach (var ccRecipient in cc)
                {
                    mailMessage.CC.Add(ccRecipient);
                }
            }

            if (bcc != null)
            {
                foreach (var bccRecipient in bcc)
                {
                    mailMessage.Bcc.Add(bccRecipient);
                }
            }

            if (attachments != null)
            {
                foreach (var (fileName, fileBytes) in attachments)
                {
                    if (fileBytes != null && fileBytes.Length > 0)
                    {
                        var memoryStream = new MemoryStream(fileBytes);
                        mailMessage.Attachments.Add(new Attachment(memoryStream, fileName));
                    }
                    else
                    {
                        throw new ArgumentException($"Attachment {fileName} is invalid.");
                    }
                }
            }

            try
            {
                await smtpClient.SendMailAsync(mailMessage);
            }
            catch (Exception ex)
            {
                EmailLogs emailRequestLog = new EmailLogs()
                {
                    To = to,
                    CC = cc,
                    BCC = bcc,
                    Subject = subject,
                    Body = body,
                    Attachments = attachments.Select(x => new AttachmentModel { FileName = x.fileName, FileBytes = x.fileBytes }),
                    ErrorMessage = ex.Message,
                    Timestamp = DateTime.Now,
                    IsSuccess = false,
                };
                await _emailRequestLogRepository.InsertAsync(emailRequestLog);
                throw;
            }
        }
    }
}
