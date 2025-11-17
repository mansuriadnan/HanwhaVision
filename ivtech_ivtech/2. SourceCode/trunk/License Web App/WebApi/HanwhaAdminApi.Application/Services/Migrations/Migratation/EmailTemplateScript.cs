using HanwhaAdminApi.Application.Services.Migrations.Migration;
using HanwhaAdminApi.Core.Interfaces;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.Common;
using HanwhaAdminApi.Model.DbEntities;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;  
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Application.Services.Migrations.Migratation
{
    public class EmailTemplateScript
    {
        private readonly ILogger<SystemAdminFirstMigration> _logger;
        public EmailTemplateScript(ILogger<SystemAdminFirstMigration> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        public async Task RunAsync(IMongoDatabase database)
        {
            var userCollection = database.GetCollection<UserMaster>(AppDBConstants.UserMaster);
            // Step 1: Create System Admin User (FIRST and FOREMOST)
            var systemAdminUserId = await CreateSystemAdminUserAsync(userCollection);

            var emailTemplateCollection = database.GetCollection<EmailTemplate>(AppDBConstants.EmailTemplates);

            await CreateInitialEmailTemplatesAsync(emailTemplateCollection, systemAdminUserId);
        }

        private async Task<string> CreateSystemAdminUserAsync(
           IMongoCollection<UserMaster> userCollection
           )
        {
            var systemAdminFilter = Builders<UserMaster>.Filter.Eq(u => u.Username, "sysadmin");
            var existingSystemAdmin = await userCollection.Find(systemAdminFilter).FirstOrDefaultAsync();

            if (existingSystemAdmin != null)
            {
                return existingSystemAdmin.Id;
            }
            return "";
           
        }

        /// <summary>
        /// Inserts initial email templates using the system admin's ID
        /// </summary>
        private async Task CreateInitialEmailTemplatesAsync(
             IMongoCollection<EmailTemplate> emailTemplateCollection,
             string createdById)
        {
            // Define the email templates to be inserted
            var emailTemplates = new List<EmailTemplate>
        {

            new EmailTemplate
            {
                Id = ObjectId.GenerateNewId().ToString(),
                EmailTemplateName = "User Created",
                EmailTemplateTitle = "Welcome! Your Account Has Been Created - Hanwha Vision MEA FZE Application",
                EmailTemplateDescription = "Welcome! Your Account Has Been Created",
                EmailTemplateHtml = "<body style=\"width: 100%; font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.6; color: #333;\">\r\n    <p><strong>Hi [[UserName]],</strong></p>\r\n\r\n    <p>We’re excited to inform you that your account has been successfully created in our internal system.</p>\r\n\r\n    <p>Here are your account details:</p>\r\n\r\n    <ul>\r\n        <li><strong>Name:</strong> [[FullName]]</li>\r\n        <li><strong>Username:</strong> [[Username]]</li>\r\n\t\t<li><strong>Password:</strong> [[Password]]</li>\r\n        <li><strong>Email:</strong> [[UserEmail]]</li>\r\n        <li><strong>Role:</strong> [[UserRole]]</li>\r\n        <li><strong>Login URL:</strong> <a href=\"[[LoginURL]]\">[[LoginURL]]</a></li>\r\n    </ul>\r\n\r\n    <p>You can now log in using your email address or username.</p>\r\n\r\n    <p>We recommend updating your password after your first login to keep your account secure.</p>\r\n\r\n    <p>If you have any questions or face issues accessing your account, feel free to reach out to your administrator for further assistance.</p>\r\n\r\n    <p>Welcome aboard!</p>\r\n\r\n    <p><strong>Best regards,<br>\r\n    Hanwha Vision Team</strong></p>\r\n</body>",
                CreatedBy = createdById,
                CreatedOn = DateTime.UtcNow,
                UpdatedBy = createdById,
                UpdatedOn = DateTime.UtcNow,
                IsDeleted = false
            },
            new EmailTemplate
            {
                Id = ObjectId.GenerateNewId().ToString(),
                EmailTemplateName = "Generate License",
                EmailTemplateTitle = "Generate License",
                EmailTemplateDescription = "New [Trial / Permanent] License Issued for [Customer Name] – Action Required",
                EmailTemplateHtml = "<body style=\"width: 100%; font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.6; color: #333;\">\r\n  <p><strong>Dear [Distributor Name],</strong></p>  <p>I hope this email finds you well.</p>   <p>We have generated a new <strong>[Trial / Permanent]</strong> license for <strong>[Customer Name]</strong>, associated with your distribution network. Please find the license details below:</p> <ul>   <li><strong>Customer Name:</strong> [Customer Name]   </li>\r\n\t\t\r\n\t\t  <li><strong>License Start Date:</strong>\r\n\t\t[Start Date]\r\n\t\t</li>\r\n\t\t\r\n\t\t  \r\n\t\t[Expiry Date]\r\n\t\t \r\n\t\t\r\n\t\t  <li><strong>Number of Users Allowed:</strong>\r\n\t\t[No. of Users]\r\n\t\t</li>\r\n\t\t\r\n\t\t  <li><strong>Number of Channels Allowed:</strong>\r\n\t\t[No of Cameras]\r\n\t\t</li>\r\n\t\t\r\n    </ul>\r\n\r\n    <p>Additionally, please find the attached files containing important details for your reference:<br />\t\r\n   1. <strong>publickey.pem</strong> – This file contains the customer's public key, which is required for authentication when configuring the license at the customer's site.<br />\r\n        2. <strong>license.lic</strong> – This file contains the generated license details for this customer, which will be used to authenticate the customer's license during configuration.\r\n\r\n</p>\r\n    <p>Kindly proceed with the necessary steps to ensure a smooth activation and deployment for the customer. If you require any further information or assistance, please do not hesitate to reach out.</p>\r\n\r\n    <p><strong>Best regards,<br />\r\n      Hanwha Vision Team</strong></p>\r\n</body>\r\n\r\n",
                CreatedBy = createdById,
                CreatedOn = null,
                UpdatedBy = createdById,
                UpdatedOn = DateTime.UtcNow,
                IsDeleted = false
            },new EmailTemplate
            {
                Id = ObjectId.GenerateNewId().ToString(),
                EmailTemplateName = "Forgot Password OTP",
                EmailTemplateTitle = "Forgot Password OTP",
                EmailTemplateDescription = "Your OTP for Password Reset - Hanwha Vision MEA FZE Application",
                EmailTemplateHtml = "<body style=\"width: 100%; font-family: 'Calibri', sans-serif; font-size: 11.0pt; line-height: 1.6; color: #333;\">\r\n    <p><strong>Hi [[UserName]],</strong></p>\r\n    <p>We received a request to reset your password for your account.</p>\r\n    <p>Please use the One-Time Password (OTP) below to proceed with resetting your password:</p>\r\n    <p><strong>OTP:</strong> [[OTPCode]]<br>\r\n    <strong>Valid For:</strong> [[OTPValidityDuration]] minutes</p>\r\n    <p>If you did not request this, please ignore this email or contact your administrator team immediately.</p>\r\n    <p><strong>Stay secure,<br>\r\n    Hanwha Vision Team</strong></p>\r\n</body>",
                CreatedBy = createdById,
                CreatedOn = null,
                UpdatedBy = createdById,
                UpdatedOn = DateTime.UtcNow,
                IsDeleted = false
            },new EmailTemplate
            {
                Id = ObjectId.GenerateNewId().ToString(),
                EmailTemplateName = "Update Email Address",
                EmailTemplateTitle = "Update Email Address",
                EmailTemplateDescription = "Action Required: OTP for Email Address Update Request - Hanwha Vision MEA FZE Application",
                EmailTemplateHtml = "<body style=\"width: 100%; font-family: 'Calibri', sans-serif; font-size: 11.0pt; line-height: 1.6; color: #333;\">\r\n    <p><strong>Hi [[UserName]],</strong></p>\r\n    <p>An administrator has initiated a request to update your email address to <strong>[[NewEmail]]</strong> in our system.</p>\r\n    <p>To proceed with this update, please provide the following One-Time Password (OTP) to your administrator:</p>\r\n    <p><strong>Your OTP:</strong> [[OTPCode]]<br>\r\n    <strong>Valid For:</strong> [[OTPValidityDuration]] minutes</p>\r\n    <p>If you did not authorize this change, please contact your administrator.</p>\r\n    <p>Thank you for your prompt attention to this matter.</p>\r\n    <p><strong>Best regards,<br>\r\n    Hanwha Vision Team</strong></p>\r\n</body>",
                CreatedBy = createdById,
                CreatedOn = null,
                UpdatedBy = createdById,
                UpdatedOn = DateTime.UtcNow,
                IsDeleted = false
            },new EmailTemplate
            {
                Id = ObjectId.GenerateNewId().ToString(),
                EmailTemplateName = "Change Password",
                EmailTemplateTitle = "Change Password",
                EmailTemplateDescription = "Your Password Has Been Successfully Updated - Hanwha Vision MEA FZE Application",
                EmailTemplateHtml = "<body style=\"width: 100%; font-family: 'Calibri', sans-serif; font-size: 11.0pt; line-height: 1.6; color: #333;\">\r\n    <p><strong>Hi [[UserName]],</strong></p>\r\n    <p>This is to confirm that your account password was successfully updated.</p>\r\n    <p><strong>Click <a href=\"[[LoginURL]]\">here</a> to login with new credentials.</strong></p>\r\n    <p>If you made this change, no further action is required.</p>\r\n    <p>However, if you did not authorize this update, please reset your password immediately or contact your administrator team for quick assistance.</p>\r\n    <p>For your security, we recommend updating your password on a timely manner and avoiding reuse of old passwords.</p>\r\n    <p><strong>Stay safe,<br />\r\n    Hanwha Vision Team</strong></p>\r\n</body>",
                CreatedBy = createdById,
                CreatedOn = null,
                UpdatedBy = createdById,
                UpdatedOn = DateTime.UtcNow,
                IsDeleted = false
            }
        };

            // Prepare bulk write operations
            var bulkOps = new List<WriteModel<EmailTemplate>>();

            foreach (var template in emailTemplates)
            {
                // Check if a template with the same name already exists
                var filter = Builders<EmailTemplate>.Filter.Eq(t => t.EmailTemplateName, template.EmailTemplateName);

                // Upsert operation: insert if not exists, update if exists
                var upsertModel = new ReplaceOneModel<EmailTemplate>(filter, template)
                {
                    IsUpsert = true
                };

                bulkOps.Add(upsertModel);
            }

            // Execute bulk write
            if (bulkOps.Any())
            {
                await emailTemplateCollection.BulkWriteAsync(bulkOps);
                _logger.LogInformation($"Inserted/Updated {bulkOps.Count} email templates.");
            }
        }

    }
}
