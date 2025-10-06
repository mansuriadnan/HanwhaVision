using HanwhaClient.Core.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using MongoDB.Bson;
using MongoDB.Driver;

namespace HanwhaClient.Application.Services.Migrations.Migratation
{
    [Migration(2025011601, "Performing basic table setup during the first-time application execution")]
    public class FirstScript2201 : IMigration
    {
        private readonly IRoleRepository _roleRepository;
        private readonly IPasswordHasher _passwordHasher;

        public FirstScript2201(IRoleRepository roleRepository, IPasswordHasher passwordHasher)
        {
            _roleRepository = roleRepository;
            _passwordHasher = passwordHasher;
        }

        public async Task RunAsync(IMongoDatabase database)
        {
            var userCollection = database.GetCollection<UserMaster>(AppDBConstants.UserMaster);
            var roleCollection = database.GetCollection<RoleMaster>(AppDBConstants.RoleMaster);
            var screenCollection = database.GetCollection<ScreenMaster>(AppDBConstants.ScreenMaster);
            var mappingCollection = database.GetCollection<RoleScreenMapping>(AppDBConstants.RoleScreenMapping);
            var widgetMasterCollection = database.GetCollection<WidgetMaster>(AppDBConstants.WidgetMaster);
            var emailTemplateCollection = database.GetCollection<EmailTemplate>(AppDBConstants.EmailTemplates);
            var clientTimeZoneCollection = database.GetCollection<ClientTimezones>(AppDBConstants.ClientTimeZone);
            var clientSettingsCollection = database.GetCollection<ClientSettings>(AppDBConstants.ClientSettings);

            // Step 1: Create System Admin User (FIRST and FOREMOST)
            var systemAdminUserId = await CreateSystemAdminUserAsync(userCollection);


            // Step 2: Create Super Admin Role
            var superAdminRole = await CreateSuperAdminRoleAsync(roleCollection, systemAdminUserId);

            // Step 3: Create Super Admin User
            var superAdminUserId = await CreateSuperAdminUserAsync(userCollection, systemAdminUserId, superAdminRole.Id);

            // Step 4: Create other initial data using System Admin's ID as CreatedBy
            await CreateInitialScreensAsync(screenCollection, systemAdminUserId);
            await CreateRoleScreenMappingsAsync(screenCollection, mappingCollection, superAdminRole, systemAdminUserId);

            // Step 5: Create email templates using system admin's ID
            await CreateInitialEmailTemplatesAsync(emailTemplateCollection, systemAdminUserId);

            // Step 6: Create Client-TimeZones using system admin's ID
            await CreateInitialTimeZoneAsync(clientTimeZoneCollection, systemAdminUserId);

            // Step 6: Create Client-Setting using system admin's ID
            await CreateClientSettingAsync(clientSettingsCollection, clientTimeZoneCollection, systemAdminUserId);



            #region Add Screen

            // Insert screens and mappings
            var sampleScreens = ScreenMasterNewList.GetAllScreen();
            var resultRoles = await _roleRepository.GetAllAsync();

            if (sampleScreens != null && resultRoles != null)
            {
                var existingScreens = await screenCollection.Find(FilterDefinition<ScreenMaster>.Empty).ToListAsync();
                var newScreens = sampleScreens.Where(screen => existingScreens.All(existing => existing.ScreenName != screen.ScreenName)).ToList();

                if (newScreens.Any())
                {
                    await screenCollection.InsertManyAsync(newScreens);
                    existingScreens = await screenCollection.Find(FilterDefinition<ScreenMaster>.Empty).ToListAsync();
                }

                foreach (var role in resultRoles)
                {
                    var roleExistsInMapping = await mappingCollection.Find(Builders<RoleScreenMapping>.Filter.Eq(m => m.RoleId, role.Id)).AnyAsync();

                    if (!roleExistsInMapping)
                    {
                        var roleScreenMapping = new RoleScreenMapping
                        {
                            RoleId = role.Id,
                            ScreenMappings = existingScreens.Select(screen => new ScreenMapping
                            {
                                ScreenId = screen.Id,
                                AccessAllowed = true,
                            }).ToList()
                        };

                        await mappingCollection.InsertOneAsync(roleScreenMapping);
                        Console.WriteLine($"Inserted role-screen mapping for RoleId: {role.Id}");
                    }
                    else
                    {
                        Console.WriteLine($"RoleId '{role.Id}' already exists in the mapping table. Skipping.");
                    }
                }
            }
            else
            {
                Console.WriteLine("Sample screens or roles are null. Skipping insertion.");
            }

            #endregion

            #region Add Widget

            // Get all widget masters (categories with their widgets) from the setup
            var allWidgetMastersFromSetup = WidgetMasterList.GetAllWidgets();

            if (allWidgetMastersFromSetup == null || !allWidgetMastersFromSetup.Any())
            {
                // Optional: Log that no widgets were found in setup
                System.Console.WriteLine("No widgets found in setup. Nothing to process.");
                return;
            }

            foreach (var currentWidgetMasterFromSetup in allWidgetMastersFromSetup)
            {
                if (currentWidgetMasterFromSetup == null || string.IsNullOrEmpty(currentWidgetMasterFromSetup.CategoryName))
                {
                    // Optional: Log or handle invalid WidgetMaster from setup
                    System.Console.WriteLine("Skipping an invalid WidgetMaster (null or no CategoryName) from setup.");
                    continue;
                }

                // Try to find an existing WidgetMaster in the database by its CategoryName
                var existingWidgetMaster = await widgetMasterCollection
                                                .Find(wm => wm.CategoryName == currentWidgetMasterFromSetup.CategoryName)
                                                .FirstOrDefaultAsync();

                if (existingWidgetMaster != null)
                {
                    // Category exists, check for new widgets to add
                    if (currentWidgetMasterFromSetup.Widgets != null && currentWidgetMasterFromSetup.Widgets.Any())
                    {
                        // Ensure existingWidgetMaster.Widgets is not null
                        if (existingWidgetMaster.Widgets == null)
                        {
                            existingWidgetMaster.Widgets = new List<WidgetItem>();
                        }

                        // Filter out widgets from the setup that already exist in the database for this category (by WidgetName)
                        var newWidgetsToAdd = currentWidgetMasterFromSetup.Widgets.Where(newWidget =>
                                            !existingWidgetMaster.Widgets
                                                .Any(existingWidget => existingWidget.WidgetName == newWidget.WidgetName))
                                            .ToList();

                        if (newWidgetsToAdd.Any())
                        {
                            // Add the new widgets to the existing category's widget list
                            existingWidgetMaster.Widgets = existingWidgetMaster.Widgets.Concat(newWidgetsToAdd).ToList();

                            // Replace the existing document in the database with the updated one
                            // This requires WidgetMaster to have an Id property mapped to MongoDB's _id
                            await widgetMasterCollection.ReplaceOneAsync(
                                wm => wm.Id == existingWidgetMaster.Id, // Match by the document's unique Id
                                existingWidgetMaster);
                        }
                    }
                }
                else
                {
                    // Category does not exist, insert the new WidgetMaster from setup
                    // Ensure the Id is not set or is null if MongoDB is to generate it,
                    // or ensure it's a new valid ObjectId string if you generate it client-side.
                    // For this example, we assume MongoDB will generate the _id if currentWidgetMasterFromSetup.Id is null.
                    await widgetMasterCollection.InsertOneAsync(currentWidgetMasterFromSetup);
                }
            }
            foreach (var roleId in resultRoles)
            {
                // Step 7: Create Widget Permission 
                await InsertRoleScreenMappingFromWidgetsAsync(widgetMasterCollection, mappingCollection, roleId.Id);
            }

            #endregion


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
            var systemId = ObjectId.GenerateNewId().ToString();

            var systemAdminUser = new UserMaster
            {
                Id = systemId, // Explicitly generate ID
                Firstname = "System",
                Lastname = "Admin",
                Username = "sysadmin",
                Email = "systemadmin@example.com",
                RoleIds = new List<string> { },
                Password = _passwordHasher.HashPassword("SYSADmin@2k25!"),
                ProfileImage = null,
                CreatedBy = systemId, // First user has no creator
                CreatedOn = DateTime.UtcNow,
                UpdatedOn = DateTime.UtcNow,
                UpdatedBy = systemId, // First user has no creator
            };

            await userCollection.InsertOneAsync(systemAdminUser);
            return systemAdminUser.Id;
        }

        private async Task<RoleMaster> CreateSuperAdminRoleAsync(IMongoCollection<RoleMaster> roleCollection, string systemAdminUser)
        {
            var superAdminRoleName = "Super Admin";
            var filter = Builders<RoleMaster>.Filter.Eq(r => r.RoleName, superAdminRoleName);

            var existingRole = await roleCollection.Find(filter).FirstOrDefaultAsync();
            if (existingRole != null)
            {
                return existingRole;
            }

            var superAdminRole = new RoleMaster
            {
                Id = ObjectId.GenerateNewId().ToString(),
                RoleName = superAdminRoleName,
                Description = "The main and default user, automatically created by the system, has full access",
                CreatedOn = DateTime.UtcNow,
                CreatedBy = systemAdminUser,
                UpdatedOn = DateTime.UtcNow,
                UpdatedBy = systemAdminUser,
            };

            await roleCollection.InsertOneAsync(superAdminRole);
            return superAdminRole;
        }

        private async Task<string> CreateSuperAdminUserAsync(
                     IMongoCollection<UserMaster> userCollection,
                     string systemAdminId, string roleId)
        {
            var superAdminFilter = Builders<UserMaster>.Filter.Eq(u => u.Username, "superadmin");
            var existingSystemAdmin = await userCollection.Find(superAdminFilter).FirstOrDefaultAsync();

            if (existingSystemAdmin != null)
            {
                return existingSystemAdmin.Id;
            }


            var systemAdminUser = new UserMaster
            {
                Id = ObjectId.GenerateNewId().ToString(), // Explicitly generate ID
                Firstname = "Super",
                Lastname = "Admin",
                Username = "superadmin",
                Email = "superadmin@example.com",

                RoleIds = new List<string> { roleId },
                Password = _passwordHasher.HashPassword("SAdmin@25!"),
                ProfileImage = "data:image/png;base64,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",
                CreatedBy = systemAdminId,
                CreatedOn = DateTime.UtcNow,
                UpdatedOn = DateTime.UtcNow,
                UpdatedBy = systemAdminId,
            };

            await userCollection.InsertOneAsync(systemAdminUser);
            return systemAdminUser.Id;
        }


        private async Task CreateInitialScreensAsync(
            IMongoCollection<ScreenMaster> screenCollection,
            string createdById)
        {
            var sampleScreens = ScreenMasterNewList.GetAllScreen();
            if (sampleScreens == null) return;

            var existingScreens = await screenCollection.Find(FilterDefinition<ScreenMaster>.Empty).ToListAsync();

            // Update screens with CreatedBy
            var newScreens = sampleScreens
                .Where(screen => existingScreens.All(existing => existing.ScreenName != screen.ScreenName))
                .Select(screen =>
                {
                    screen.CreatedBy = createdById;
                    screen.CreatedOn = DateTime.UtcNow;
                    screen.UpdatedOn = DateTime.UtcNow;
                    screen.UpdatedBy = createdById;
                    return screen;
                })
                .ToList();

            if (newScreens.Any())
            {
                await screenCollection.InsertManyAsync(newScreens);
            }
        }

        private async Task CreateRoleScreenMappingsAsync(
            IMongoCollection<ScreenMaster> screenCollection,
            IMongoCollection<RoleScreenMapping> mappingCollection,
            RoleMaster superAdminRole,
            string createdById)
        {
            var screens = await screenCollection.Find(FilterDefinition<ScreenMaster>.Empty).ToListAsync();

            var roleScreenMapping = new RoleScreenMapping
            {
                Id = ObjectId.GenerateNewId().ToString(),
                RoleId = superAdminRole.Id,
                CreatedBy = createdById,
                CreatedOn = DateTime.UtcNow,
                ScreenMappings = screens.Select(screen => new ScreenMapping
                {
                    ScreenId = screen.Id,
                    AccessAllowed = true
                }).ToList()
            };

            await mappingCollection.InsertOneAsync(roleScreenMapping);
        }

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
            },new EmailTemplate
            {
                Id = ObjectId.GenerateNewId().ToString(),
                EmailTemplateName = "Report Schedule",
                EmailTemplateTitle = "Report Schedule",
                EmailTemplateDescription = "Scheduled Report – ",
                EmailTemplateHtml = "<body style=\"width: 100%; font-family: 'Calibri', sans-serif; font-size: 11.0pt; line-height: 1.6; color: #333;\">\n    <p><strong>Hi [[UserName]],</strong></p>\n    <p>Please find attached the scheduled report as per your configured preferences.</p>\n    <p><strong>Report Details:</strong></p>\n\n\t<table border=\"1\" cellspacing=\"0\" cellpadding=\"8\" style=\"border-collapse: collapse; width: 100%;\">\n\t\t<tr style=\"background-color: #f2f2f2;\">\n\t\t\t<th style=\"text-align: left; width: 200px;\">Parameter</th>\n\t\t\t<th style=\"text-align: left;\">Value</th>\n\t\t</tr>\n\t\t[[TableContent]]\n\t</table>\n\n    <p>If you have any questions or need further assistance, feel free to contact the support team.</p>\n    <p><strong>Thank you,<br>\n    Hanwha Vision Team</strong></p>\n</body>",
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
            }
        }

        private async Task CreateInitialTimeZoneAsync(
         IMongoCollection<ClientTimezones> clientTimeZoneCollection,
         string createdById)
        {
            var sampleTimezone = TimeZoneList.GetAllTimeZones();
            if (sampleTimezone == null) return;

            var existingScreens = await clientTimeZoneCollection.Find(FilterDefinition<ClientTimezones>.Empty).ToListAsync();

            // Update screens with CreatedBy
            var newTimezone = sampleTimezone
                .Where(timezone => existingScreens.All(existing => existing.TimeZoneName != timezone.TimeZoneName))
                .Select(timezone =>
                {
                    timezone.CreatedBy = createdById;
                    timezone.CreatedOn = DateTime.UtcNow;
                    timezone.UpdatedOn = DateTime.UtcNow;
                    timezone.UpdatedBy = createdById;
                    return timezone;
                })
                .ToList();

            if (newTimezone.Any())
            {
                await clientTimeZoneCollection.InsertManyAsync(newTimezone);
            }
        }

        private async Task<string> CreateClientSettingAsync(IMongoCollection<ClientSettings> clientSettingsCollection, IMongoCollection<ClientTimezones> clientTimezonesCollection, string systemAdminId)
        {
            // var defaultImageURL = "data:image/png;base64,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";
            var localTimeZone = TimeZoneInfo.Local;
            var offset = localTimeZone.BaseUtcOffset.ToString(@"hh\:mm");

            // Handle negative offsets
            if (localTimeZone.BaseUtcOffset.TotalMinutes < 0)
                offset = "-" + offset;
            else
                offset = "+" + offset;

            var clientTimeZone = clientTimezonesCollection.Find(tz => tz.UtcOffset == offset).FirstOrDefault();


            if (clientTimeZone == null)
            {
                return "";
            }

            DateTime today = DateTime.Today;

            // Start of the day (12:00 AM)
            DateTime startTime = today; // 00:00:00

            // End of the day (11:59:59 PM)
            DateTime endTime = today.AddDays(1).AddSeconds(-1); // 23:59:59

            // Create an instance of the operational timing model
            var operationalTiming = new ClientOperationalTiming
            {
                StartTime = startTime,
                EndTime = endTime
            };

            var clientSettingsData = new ClientSettings
            {
                OperationalTiming = operationalTiming,
                TimeZone = clientTimeZone.Id,
                Logo = null,
                CreatedBy = systemAdminId,
                CreatedOn = DateTime.UtcNow,
                UpdatedOn = DateTime.UtcNow,
                UpdatedBy = systemAdminId,
            };

            await clientSettingsCollection.InsertOneAsync(clientSettingsData);
            return clientSettingsData.Id;
        }

        private async Task InsertRoleScreenMappingFromWidgetsAsync(
      IMongoCollection<WidgetMaster> widgetMasterCollection,
      IMongoCollection<RoleScreenMapping> roleScreenMappingCollection,
      string roleId)
        {
            // Step 1: Get all WidgetMaster records
            var widgetMasters = await widgetMasterCollection.Find(_ => true).ToListAsync();

            // Step 2: Transform WidgetMaster -> WidgetAccessPermission
            var widgetAccessPermissions = widgetMasters
                .Where(w => w.Widgets != null && w.Widgets.Any())
                .Select(w => new WidgetAccessPermission
                {
                    WidgetCategoryId = w.Id,
                    WidgetIds = w.Widgets.Select(widget => widget.WidgetId)
                })
                .ToList();

            // Step 3: Update the existing RoleScreenMapping for the given roleId
            var update = Builders<RoleScreenMapping>.Update
                .Set(x => x.WidgetAccessPermissions, widgetAccessPermissions);

            var filter = Builders<RoleScreenMapping>.Filter
                .Eq(x => x.RoleId, roleId);

            var result = await roleScreenMappingCollection.UpdateOneAsync(filter, update);

            // Optional: handle case where document doesn't exist
            if (result.MatchedCount == 0)
            {
                // Optionally create a new one (if you want upsert)
                var roleScreenMapping = new RoleScreenMapping
                {
                    RoleId = roleId,
                    WidgetAccessPermissions = widgetAccessPermissions
                };
                await roleScreenMappingCollection.InsertOneAsync(roleScreenMapping);
            }
        }


    }
}
