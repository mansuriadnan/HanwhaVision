using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.SignalR;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.DeviceApiResponse;
using HanwhaClient.Model.Dto;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace HanwhaClient.Application.Services
{
    public class EventTriggerService : IEventTriggerService
    {
        private readonly IDeviceMasterService _deviceMasterService;
        private readonly IDeviceApiService _deviceApiService;
        private readonly IPeopleCountService _peopleCountService;
        private readonly IVehicleService _vehicleService;
        private readonly IQueueManagementRepository _queueManagementRepository;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IDeviceEventsRepository _deviceEventsRepository;
        private readonly IUserNotificationService _userNotificationService;
        public EventTriggerService(IDeviceMasterService deviceMasterService, IDeviceApiService deviceApiService,
            IPeopleCountService peopleCountService,
            IVehicleService vehicleService,
            IQueueManagementRepository queueManagementRepository,
            IHubContext<NotificationHub> hubContext,
            IDeviceEventsRepository deviceEventsRepository,
            IUserNotificationService userNotificationService)
        {
            _deviceMasterService = deviceMasterService;
            _deviceApiService = deviceApiService;
            _peopleCountService = peopleCountService;
            _vehicleService = vehicleService;
            _queueManagementRepository = queueManagementRepository;
            _hubContext = hubContext;
            _deviceEventsRepository = deviceEventsRepository;
            _userNotificationService = userNotificationService;
        }

        public async Task<bool> TrackTriggerEventAsync(string eventJson, DeviceMaster deviceDetail)
        {
            if (deviceDetail.APIModel == "SUNAPI")
            {
                var eventModel = JsonConvert.DeserializeObject<SunapiRootObject>(eventJson);



                //if (eventModel != null && eventModel.ChannelEvent != null)
                //{
                //    foreach (var eventInfo in eventModel.ChannelEvent)
                //    {
                //        if (eventInfo.ObjectDetection != null && eventInfo.ObjectDetection.ObjectDetection != null && eventInfo.ObjectDetection.ObjectDetection == true && eventInfo.ObjectDetection.ObjectTypes.Person == true)
                //        {
                //            if (deviceDetail.APIModel == "SUNAPI")
                //            {
                //                await AddPeopleCountFromSunapiAsync(deviceDetail.IpAddress, deviceDetail.UserName, deviceDetail.Password, deviceDetail.Id);
                //            }
                //            else if (deviceDetail.APIModel == "WiseAI")
                //            {
                //                await AddPeopleCountFromWiseAiAsync(deviceDetail.IpAddress, deviceDetail.UserName, deviceDetail.Password, deviceDetail.Id, eventInfo.Channel);
                //            }
                //        }

                //        if (eventInfo.ObjectDetection != null && eventInfo.ObjectDetection.ObjectDetection != null && eventInfo.ObjectDetection.ObjectDetection == true && eventInfo.ObjectDetection.ObjectTypes.Vehicle == true)
                //        {
                //            if (deviceDetail.APIModel == "SUNAPI")
                //            {
                //                await AddVehicleCountFromSunapiAsync(deviceDetail.IpAddress, deviceDetail.UserName, deviceDetail.Password, deviceDetail.Id);
                //            }
                //            else if (deviceDetail.APIModel == "WiseAI")
                //            {
                //                await AddVehicleCountFromWiseAi(deviceDetail.IpAddress, deviceDetail.UserName, deviceDetail.Password, deviceDetail.Id, eventInfo.Channel);
                //            }
                //        }
                //    }
                //}
            }
            else if (deviceDetail.APIModel == "WiseAI")
            {
                var eventModel = JsonConvert.DeserializeObject<WiseAiRootObject>(eventJson);
                if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.VehicleQueueCountChanged"))
                {
                    var vehicleQueue = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.VehicleQueueCountChanged").Select(es => new QueueManagement
                    {
                        EventName = es.EventName,
                        DeviceId = deviceDetail.Id,
                        ChannelNo = es.Source.Channel,
                        CreatedOn = DateTime.UtcNow,
                        UpdatedOn = DateTime.UtcNow,
                        RuleName = es.Source.RuleName,
                        Count = es.Data.Count,
                        RuleIndex = es.Source.RuleIndex,
                    }).ToList();

                    var jsonDetail = vehicleQueue.FirstOrDefault();

                    var jsonMessage = JsonConvert.SerializeObject(new
                    {
                        deviceId = deviceDetail.Id,
                        count = vehicleQueue.FirstOrDefault()?.Count ?? 0,
                        WidgetName = "VehicleQueueAnalysis",
                        EventName = jsonDetail.EventName,
                        RuleIndex = jsonDetail.RuleIndex,
                        RuleName = jsonDetail.RuleName ?? string.Empty,
                    });

                    await _hubContext.Clients.Group(deviceDetail.Id + "VehicleQueueAnalysis").SendAsync("VehicleQueueAnalysis", jsonMessage);
                    await _hubContext.Clients.Group(deviceDetail.Id + "VehicleQueueAnalysisMap").SendAsync("VehicleQueueAnalysisMap", jsonMessage);
                    var result = await _queueManagementRepository.InsertManyAsync(vehicleQueue);
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.VehicleQueueMedium"))
                {
                    var deviceEvent = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.VehicleQueueMedium")
                        .Select(es => new DeviceEvents
                    {
                        EventName = es.EventName,
                        DeviceId = deviceDetail.Id,
                        RuleIndex = es.Source.RuleIndex,
                        RuleName = es.Source.RuleName,
                        ChannelNo = es.Source.Channel,
                        VideoSourceToken = es.Source.VideoSourceToken,
                        CreatedOn = DateTime.UtcNow,
                        UpdatedOn = DateTime.UtcNow,
                        DeviceTime = es.Time,
                        VehicleQueueData = new EventVehicleQueue
                        {
                            State = es.Data.State,
                        }
                    });
                    var jsonDetail = deviceEvent.FirstOrDefault();
                    var jsonMessage = JsonConvert.SerializeObject(new
                    {
                        deviceId = deviceDetail.Id,
                        state = deviceEvent.FirstOrDefault()?.VehicleQueueData?.State ?? false,
                        WidgetName = "VehicleQueueAnalysis",
                        EventName = jsonDetail.EventName,
                        RuleIndex = jsonDetail.RuleIndex ?? 0,
                        RuleName = jsonDetail.RuleName ?? string.Empty
                    });



                    await _hubContext.Clients.Group(deviceDetail.Id + "VehicleQueueAnalysis").SendAsync("VehicleQueueAnalysis", jsonMessage);

                    var deviceEventId = await _deviceEventsRepository.InsertAsync(deviceEvent.FirstOrDefault());
                    await _userNotificationService.AddUserNotification("Vehicle Queue Alert – Medium",
                                "A medium vehicle queue has been detected on " + deviceDetail.DeviceName,
                                "Acknowledge",
                                 deviceEventId);
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.VehicleQueueHigh"))
                {
                    var deviceEvent = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.VehicleQueueHigh")
                        .Select(es => new DeviceEvents
                    {
                        EventName = "OpenSDK.WiseAI.VehicleQueueHigh",
                        DeviceId = deviceDetail.Id,
                        RuleIndex = es.Source.RuleIndex,
                        RuleName = es.Source.RuleName,
                        ChannelNo = es.Source.Channel,
                        VideoSourceToken = es.Source.VideoSourceToken,
                        CreatedOn = DateTime.UtcNow,
                        UpdatedOn = DateTime.UtcNow,
                        DeviceTime = es.Time,
                        VehicleQueueData = new EventVehicleQueue
                        {
                            State = es.Data.State,
                        }
                    });
                    var jsonDetail = deviceEvent.FirstOrDefault();
                    var jsonMessage = JsonConvert.SerializeObject(new
                    {
                        deviceId = deviceDetail.Id,
                        state = deviceEvent.FirstOrDefault()?.VehicleQueueData?.State ?? false,
                        WidgetName = "VehicleQueueAnalysis",
                        EventName = jsonDetail.EventName,
                        RuleIndex = jsonDetail.RuleIndex ?? 0,
                        RuleName = jsonDetail.RuleName ?? string.Empty
                    });

                    await _hubContext.Clients.Group(deviceDetail.Id + "VehicleQueueAnalysis").SendAsync("VehicleQueueAnalysis", jsonMessage);
                    var deviceEventId = await _deviceEventsRepository.InsertAsync(deviceEvent.FirstOrDefault());

                    await _userNotificationService.AddUserNotification("Vehicle Queue Alert – High",
                                "A high vehicle queue has been detected on " + deviceDetail.DeviceName,
                                "Acknowledge",
                                 deviceEventId);
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.QueueCountChanged"))
                {
                    var vehicleQueue = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.QueueCountChanged")
                        .Select(es => new QueueManagement
                    {
                        EventName = es.EventName,
                        DeviceId = deviceDetail.Id,
                        ChannelNo = es.Source.Channel,
                        CreatedOn = DateTime.UtcNow,
                        UpdatedOn = DateTime.UtcNow,
                        RuleName = es.Source.RuleName,
                        Count = es.Data.Count,
                        RuleIndex = es.Source.RuleIndex,
                    }).ToList();

                    var jsonDetail = vehicleQueue.FirstOrDefault();
                    var jsonMessage = JsonConvert.SerializeObject(new
                    {
                        deviceId = deviceDetail.Id,
                        count = vehicleQueue.FirstOrDefault()?.Count ?? 0,
                        WidgetName = "PeopleQueueAnalysis",
                        EventName = jsonDetail.EventName,
                        RuleIndex = jsonDetail.RuleIndex,
                        RuleName = jsonDetail.RuleName ?? string.Empty,
                    });

                    await _hubContext.Clients.Group(deviceDetail.Id + "PeopleQueueAnalysis").SendAsync("PeopleQueueAnalysis", jsonMessage);
                    var result = await _queueManagementRepository.InsertManyAsync(vehicleQueue);
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.QueueMedium"))
                {
                    var deviceEvent = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.QueueMedium")
                        .Select(es => new DeviceEvents
                    {
                        EventName = es.EventName,
                        DeviceId = deviceDetail.Id,
                        RuleIndex = es.Source.RuleIndex,
                        RuleName = es.Source.RuleName,
                        ChannelNo = es.Source.Channel,
                        VideoSourceToken = es.Source.VideoSourceToken,
                        CreatedOn = DateTime.UtcNow,
                        UpdatedOn = DateTime.UtcNow,
                        DeviceTime = es.Time,
                        PeopleQueueData = new EventVehicleQueue
                        {
                            State = es.Data.State,
                        }
                    });
                    var jsonDetail = deviceEvent.FirstOrDefault();
                    var jsonMessage = JsonConvert.SerializeObject(new
                    {
                        deviceId = deviceDetail.Id,
                        state = deviceEvent.FirstOrDefault()?.VehicleQueueData?.State ?? false,
                        WidgetName = "PeopleQueueAnalysis",
                        EventName = jsonDetail.EventName,
                        RuleIndex = jsonDetail.RuleIndex ?? 0,
                        RuleName = jsonDetail.RuleName ?? string.Empty
                    });

                    await _hubContext.Clients.Group(deviceDetail.Id + "PeopleQueueAnalysis").SendAsync("PeopleQueueAnalysis", jsonMessage);
                    var deviceEventId = await _deviceEventsRepository.InsertAsync(deviceEvent.FirstOrDefault());
                    await _userNotificationService.AddUserNotification("People Queue Alert – Medium",
                                "A medium people queue has been detected at " + deviceDetail.DeviceName,
                                "Acknowledge",
                                 deviceEventId);
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.QueueHigh"))
                {
                    var deviceEvent = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.QueueHigh")
                        .Select(es => new DeviceEvents
                    {
                        EventName = es.EventName,
                        DeviceId = deviceDetail.Id,
                        RuleIndex = es.Source.RuleIndex,
                        RuleName = es.Source.RuleName,
                        ChannelNo = es.Source.Channel,
                        VideoSourceToken = es.Source.VideoSourceToken,
                        CreatedOn = DateTime.UtcNow,
                        UpdatedOn = DateTime.UtcNow,
                        DeviceTime = es.Time,
                        PeopleQueueData = new EventVehicleQueue
                        {
                            State = es.Data.State,
                        }
                    });
                    var jsonDetail = deviceEvent.FirstOrDefault();
                    var jsonMessage = JsonConvert.SerializeObject(new
                    {
                        deviceId = deviceDetail.Id,
                        state = deviceEvent.FirstOrDefault()?.VehicleQueueData?.State ?? false,
                        WidgetName = "PeopleQueueAnalysis",
                        EventName = jsonDetail.EventName,
                        RuleIndex = jsonDetail.RuleIndex ?? 0,
                        RuleName = jsonDetail.RuleName ?? string.Empty
                    });

                    await _hubContext.Clients.Group(deviceDetail.Id + "PeopleQueueAnalysis").SendAsync("PeopleQueueAnalysis", jsonMessage);
                    var deviceEventId = await _deviceEventsRepository.InsertAsync(deviceEvent.FirstOrDefault());
                    await _userNotificationService.AddUserNotification("People Queue Alert – High",
                                "A high-density people queue has been detected at " + deviceDetail.DeviceName,
                                "Acknowledge",
                                 deviceEventId);
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.ShoppingCartQueueCountChanged"))
                {
                    var vehicleQueue = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.ShoppingCartQueueCountChanged")
                        .Select(es => new QueueManagement
                        {
                            EventName = es.EventName,
                            DeviceId = deviceDetail.Id,
                            ChannelNo = es.Source.Channel,
                            CreatedOn = DateTime.UtcNow,
                            UpdatedOn = DateTime.UtcNow,
                            RuleName = es.Source.RuleName,
                            Count = es.Data.Count,
                            RuleIndex = es.Source.RuleIndex,
                        }).ToList();

                    var jsonDetail = vehicleQueue.FirstOrDefault();
                    var jsonMessage = JsonConvert.SerializeObject(new
                    {
                        deviceId = deviceDetail.Id,
                        count = vehicleQueue.FirstOrDefault()?.Count ?? 0,
                        WidgetName = "ShoppingCartQueueAnalysis",
                        EventName = jsonDetail.EventName,
                        RuleIndex = jsonDetail.RuleIndex,
                        RuleName = jsonDetail.RuleName ?? string.Empty,
                    });

                    await _hubContext.Clients.Group(deviceDetail.Id + "ShoppingCartQueueAnalysis").SendAsync("ShoppingCartQueueAnalysis", jsonMessage);
                    var result = await _queueManagementRepository.InsertManyAsync(vehicleQueue);
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.ShoppingCartQueueMedium"))
                {
                    var deviceEvent = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.ShoppingCartQueueMedium")
                        .Select(es => new DeviceEvents
                        {
                            EventName = es.EventName,
                            DeviceId = deviceDetail.Id,
                            RuleIndex = es.Source.RuleIndex,
                            RuleName = es.Source.RuleName,
                            ChannelNo = es.Source.Channel,
                            VideoSourceToken = es.Source.VideoSourceToken,
                            CreatedOn = DateTime.UtcNow,
                            UpdatedOn = DateTime.UtcNow,
                            DeviceTime = es.Time,
                            ShoppingCartQueue = new EventVehicleQueue
                            {
                                State = es.Data.State,
                            }
                        });
                    var jsonDetail = deviceEvent.FirstOrDefault();
                    var jsonMessage = JsonConvert.SerializeObject(new
                    {
                        deviceId = deviceDetail.Id,
                        state = deviceEvent.FirstOrDefault()?.VehicleQueueData?.State ?? false,
                        WidgetName = "ShoppingCartQueueAnalysis",
                        EventName = jsonDetail.EventName,
                        RuleIndex = jsonDetail.RuleIndex ?? 0,
                        RuleName = jsonDetail.RuleName ?? string.Empty
                    });

                    await _hubContext.Clients.Group(deviceDetail.Id + "ShoppingCartQueueAnalysis").SendAsync("ShoppingCartQueueAnalysis", jsonMessage);
                    var deviceEventId = await _deviceEventsRepository.InsertAsync(deviceEvent.FirstOrDefault());
                    await _userNotificationService.AddUserNotification("ShoppingCart Queue Alert - Medium",
                                "A Medium ShoppingCart queue has been detected at " + deviceDetail.DeviceName,
                                "Acknowledge",
                                 deviceEventId);
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.ShoppingCartQueueHigh"))
                {
                    var deviceEvent = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.ShoppingCartQueueHigh")
                        .Select(es => new DeviceEvents
                        {
                            EventName = es.EventName,
                            DeviceId = deviceDetail.Id,
                            RuleIndex = es.Source.RuleIndex,
                            RuleName = es.Source.RuleName,
                            ChannelNo = es.Source.Channel,
                            VideoSourceToken = es.Source.VideoSourceToken,
                            CreatedOn = DateTime.UtcNow,
                            UpdatedOn = DateTime.UtcNow,
                            DeviceTime = es.Time,
                            ShoppingCartQueue = new EventVehicleQueue
                            {
                                State = es.Data.State,
                            }
                        });
                    var jsonDetail = deviceEvent.FirstOrDefault();
                    var jsonMessage = JsonConvert.SerializeObject(new
                    {
                        deviceId = deviceDetail.Id,
                        state = deviceEvent.FirstOrDefault()?.VehicleQueueData?.State ?? false,
                        WidgetName = "ShoppingCartQueueAnalysis",
                        EventName = jsonDetail.EventName,
                        RuleIndex = jsonDetail.RuleIndex ?? 0,
                        RuleName = jsonDetail.RuleName ?? string.Empty
                    });

                    await _hubContext.Clients.Group(deviceDetail.Id + "ShoppingCartQueueAnalysis").SendAsync("ShoppingCartQueueAnalysis", jsonMessage);
                    var deviceEventId = await _deviceEventsRepository.InsertAsync(deviceEvent.FirstOrDefault());
                    await _userNotificationService.AddUserNotification("Shopping Cart Queue – High",
                                "A high shopping cart queue has been detected at " + deviceDetail.DeviceName,
                                "Acknowledge",
                                 deviceEventId);
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.ForkliftQueueCountChanged"))
                {
                    var vehicleQueue = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.ForkliftQueueCountChanged")
                        .Select(es => new QueueManagement
                        {
                            EventName = es.EventName,
                            DeviceId = deviceDetail.Id,
                            ChannelNo = es.Source.Channel,
                            CreatedOn = DateTime.UtcNow,
                            UpdatedOn = DateTime.UtcNow,
                            RuleName = es.Source.RuleName,
                            Count = es.Data.Count,
                            RuleIndex = es.Source.RuleIndex,
                        }).ToList();

                    var jsonDetail = vehicleQueue.FirstOrDefault();
                    var jsonMessage = JsonConvert.SerializeObject(new
                    {
                        deviceId = deviceDetail.Id,
                        count = vehicleQueue.FirstOrDefault()?.Count ?? 0,
                        WidgetName = "ForkliftQueueAnalysis",
                        EventName = jsonDetail.EventName,
                        RuleIndex = jsonDetail.RuleIndex,
                        RuleName = jsonDetail.RuleName ?? string.Empty,
                    });

                    await _hubContext.Clients.Group(deviceDetail.Id + "ForkliftQueueAnalysis").SendAsync("ForkliftQueueAnalysis", jsonMessage);
                    var result = await _queueManagementRepository.InsertManyAsync(vehicleQueue);
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.ForkliftQueueMedium"))
                {
                    var deviceEvent = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.ForkliftQueueMedium")
                        .Select(es => new DeviceEvents
                        {
                            EventName = es.EventName,
                            DeviceId = deviceDetail.Id,
                            RuleIndex = es.Source.RuleIndex,
                            RuleName = es.Source.RuleName,
                            ChannelNo = es.Source.Channel,
                            VideoSourceToken = es.Source.VideoSourceToken,
                            CreatedOn = DateTime.UtcNow,
                            UpdatedOn = DateTime.UtcNow,
                            DeviceTime = es.Time,
                            ForkLiftQueue = new EventVehicleQueue
                            {
                                State = es.Data.State,
                            }
                        });
                    var jsonDetail = deviceEvent.FirstOrDefault();
                    var jsonMessage = JsonConvert.SerializeObject(new
                    {
                        deviceId = deviceDetail.Id,
                        state = deviceEvent.FirstOrDefault()?.VehicleQueueData?.State ?? false,
                        WidgetName = "ForkliftQueueAnalysis",
                        EventName = jsonDetail.EventName,
                        RuleIndex = jsonDetail.RuleIndex ?? 0,
                        RuleName = jsonDetail.RuleName ?? string.Empty
                    });

                    await _hubContext.Clients.Group(deviceDetail.Id + "ForkliftQueueAnalysis").SendAsync("ForkliftQueueAnalysis", jsonMessage);
                    var deviceEventId = await _deviceEventsRepository.InsertAsync(deviceEvent.FirstOrDefault());
                    await _userNotificationService.AddUserNotification("Forklift Queue Alert – Medium",
                                "A medium-level forklift queue has been detected at " + deviceDetail.DeviceName,
                                "Acknowledge",
                                 deviceEventId);
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.ForkliftQueueHigh"))
                {
                    var deviceEvent = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.ForkliftQueueHigh")
                        .Select(es => new DeviceEvents
                        {
                            EventName = es.EventName,
                            DeviceId = deviceDetail.Id,
                            RuleIndex = es.Source.RuleIndex,
                            RuleName = es.Source.RuleName,
                            ChannelNo = es.Source.Channel,
                            VideoSourceToken = es.Source.VideoSourceToken,
                            CreatedOn = DateTime.UtcNow,
                            UpdatedOn = DateTime.UtcNow,
                            DeviceTime = es.Time,
                            ForkLiftQueue = new EventVehicleQueue
                            {
                                State = es.Data.State,
                            }
                        });
                    var jsonDetail = deviceEvent.FirstOrDefault();
                    var jsonMessage = JsonConvert.SerializeObject(new
                    {
                        deviceId = deviceDetail.Id,
                        state = deviceEvent.FirstOrDefault()?.VehicleQueueData?.State ?? false,
                        WidgetName = "ForkliftQueueAnalysis",
                        EventName = jsonDetail.EventName,
                        RuleIndex = jsonDetail.RuleIndex ?? 0,
                        RuleName = jsonDetail.RuleName ?? string.Empty
                    });

                    await _hubContext.Clients.Group(deviceDetail.Id + "ForkliftQueueAnalysis").SendAsync("ForkliftQueueAnalysis", jsonMessage);
                    var deviceEventId = await _deviceEventsRepository.InsertAsync(deviceEvent.FirstOrDefault());
                    await _userNotificationService.AddUserNotification("Forklift Zone Alert – High",
                                "A high-level forklift queue has been detected at " + deviceDetail.DeviceName,
                                "Acknowledge",
                                 deviceEventId);
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.AppSettingChanged"))
                {
                    var deviceEvent = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.AppSettingChanged")
                        .Select(es => new DeviceEvents
                        {
                            EventName = es.EventName,
                            DeviceId = deviceDetail.Id,
                            RuleIndex = es.Source.RuleIndex,
                            RuleName = es.Source.RuleName,
                            ChannelNo = es.Source.Channel,
                            VideoSourceToken = es.Source.VideoSourceToken,
                            CreatedOn = DateTime.UtcNow,
                            UpdatedOn = DateTime.UtcNow,
                            PeopleQueueData = new EventVehicleQueue
                            {
                                State = es.Data.State,
                            }
                        });
                    var jsonDetail = deviceEvent.FirstOrDefault();
                    var updateData = new DeviceRequestDto
                    {
                        Id = deviceDetail.Id,
                        DeviceName = deviceDetail.DeviceName,
                        DeviceType = deviceDetail.DeviceType,
                        UserName = deviceDetail.UserName,
                        Password = deviceDetail.Password,
                        IpAddress = deviceDetail.IpAddress,
                        IsHttps = deviceDetail.IsHttps,
                        Location = deviceDetail.Location,
                    };

                    await _deviceMasterService.AddUpdateDevices(updateData, deviceDetail.CreatedBy);
                    await _deviceEventsRepository.InsertManyAsync(deviceEvent);
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.SlipAndFallDetection")
                         && eventModel.EventStatus.FirstOrDefault().Data.State)
                {
                    var deviceEvent = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.SlipAndFallDetection")
                                     .Select(es => new DeviceEvents
                                     {
                                         EventName = es.EventName,
                                         DeviceId = deviceDetail.Id,
                                         RuleIndex = es.Source.RuleIndex,
                                         RuleName = es.Source.RuleName,
                                         ChannelNo = es.Source.Channel,
                                         VideoSourceToken = es.Source.VideoSourceToken,
                                         CreatedOn = DateTime.UtcNow,
                                         UpdatedOn = DateTime.UtcNow,
                                         DeviceTime = es.Time,
                                         SlipFallDetection = new EventVehicleQueue
                                         {
                                             State = es.Data.State,
                                         }
                                     });

                    var jsonDetail = deviceEvent.FirstOrDefault();
                    var jsonMessage = JsonConvert.SerializeObject(new
                    {
                        deviceId = deviceDetail.Id,
                        state = deviceEvent.FirstOrDefault()?.SlipFallDetection?.State ?? false,
                        WidgetName = "SlipAndFallDetection",
                        EventName = jsonDetail.EventName,
                        RuleIndex = jsonDetail.RuleIndex ?? 0,
                        RuleName = jsonDetail.RuleName ?? string.Empty
                    });

                    await _hubContext.Clients.Group(deviceDetail.Id + "SlipAndFallDetection").SendAsync("SlipAndFallDetection", jsonMessage);
                    await _hubContext.Clients.Group(deviceDetail.Id + "SlipAndFallDetectionMap").SendAsync("SlipAndFallDetectionMap", jsonMessage);
                    var deviceEventId = await _deviceEventsRepository.InsertAsync(deviceEvent.FirstOrDefault());
                    await _userNotificationService.AddUserNotification("Slip & Fall Detected",
                                "A slip and fall incident has been detected at " + deviceDetail.DeviceName,
                                "Acknowledge",
                                 deviceEventId);
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.WrongWayDetection")
                         && eventModel.EventStatus.FirstOrDefault().Data.State)
                {
                    var deviceEvent = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.WrongWayDetection")
                                     .Select(es => new DeviceEvents
                                     {
                                         EventName = es.EventName,
                                         DeviceId = deviceDetail.Id,
                                         RuleIndex = es.Source.RuleIndex,
                                         RuleName = es.Source.RuleName,
                                         ChannelNo = es.Source.Channel,
                                         VideoSourceToken = es.Source.VideoSourceToken,
                                         CreatedOn = DateTime.UtcNow,
                                         UpdatedOn = DateTime.UtcNow,
                                         DeviceTime = es.Time,
                                         WrongWayDetection = new EventVehicleQueue
                                         {
                                             State = es.Data.State,
                                         }
                                     });

                    var jsonDetail = deviceEvent.FirstOrDefault();
                    var jsonMessage = JsonConvert.SerializeObject(new
                    {
                        deviceId = deviceDetail.Id,
                        state = deviceEvent.FirstOrDefault()?.WrongWayDetection?.State ?? false,
                        WidgetName = "VehicleWrongDirection",
                        EventName = jsonDetail.EventName,
                        RuleIndex = jsonDetail.RuleIndex ?? 0,
                        RuleName = jsonDetail.RuleName ?? string.Empty
                    });

                    await _hubContext.Clients.Group(deviceDetail.Id + "VehicleWrongDirection").SendAsync("VehicleWrongDirection", jsonMessage);
                    var deviceEventId = await _deviceEventsRepository.InsertAsync(deviceEvent.FirstOrDefault());
                    await _userNotificationService.AddUserNotification("Vehicle Wrong-Way Detected",
                                "A vehicle moving in the wrong direction was detected on " + deviceDetail.DeviceName,
                                "Acknowledge",
                                 deviceEventId);
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.PedestrianDetection") 
                         && eventModel.EventStatus.FirstOrDefault().Data.State)
                {
                    var deviceEvent = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.PedestrianDetection")
                                     .Select(es => new DeviceEvents
                                     {
                                         EventName = es.EventName,
                                         DeviceId = deviceDetail.Id,
                                         RuleIndex = es.Source.RuleIndex,
                                         RuleName = es.Source.RuleName,
                                         ChannelNo = es.Source.Channel,
                                         VideoSourceToken = es.Source.VideoSourceToken,
                                         CreatedOn = DateTime.UtcNow,
                                         UpdatedOn = DateTime.UtcNow,
                                         DeviceTime = es.Time,
                                         PedestrianDetection = new EventVehicleQueue
                                         {
                                             State = es.Data.State,
                                         }
                                     });

                    var jsonDetail = deviceEvent.FirstOrDefault();
                    var jsonMessage = JsonConvert.SerializeObject(new
                    {
                        deviceId = deviceDetail.Id,
                        state = deviceEvent.FirstOrDefault()?.PedestrianDetection?.State ?? false,
                        WidgetName = "PedestrianDetection",
                        EventName = jsonDetail.EventName,
                        RuleIndex = jsonDetail.RuleIndex ?? 0,
                        RuleName = jsonDetail.RuleName ?? string.Empty
                    });

                    await _hubContext.Clients.Group(deviceDetail.Id + "PedestrianDetection").SendAsync("PedestrianDetection", jsonMessage);
                    await _hubContext.Clients.Group(deviceDetail.Id + "PedestrianDetectionMap").SendAsync("PedestrianDetectionMap", jsonMessage);
                    var result = await _deviceEventsRepository.InsertManyAsync(deviceEvent);
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.BlockedExitDetection") 
                         && eventModel.EventStatus.FirstOrDefault().Data.State)
                {
                    var deviceEvent = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.BlockedExitDetection")
                                     .Select(es => new DeviceEvents
                                     {
                                         EventName = es.EventName,
                                         DeviceId = deviceDetail.Id,
                                         RuleIndex = es.Source.RuleIndex,
                                         RuleName = es.Source.RuleName,
                                         ChannelNo = es.Source.Channel,
                                         VideoSourceToken = es.Source.VideoSourceToken,
                                         CreatedOn = DateTime.UtcNow,
                                         UpdatedOn = DateTime.UtcNow,
                                         DeviceTime = es.Time,
                                         BlockedExitDetection = new EventVehicleQueue
                                         {
                                             State = es.Data.State,
                                         }
                                     });

                    var jsonDetail = deviceEvent.FirstOrDefault();
                    var jsonMessage = JsonConvert.SerializeObject(new
                    {
                        deviceId = deviceDetail.Id,
                        state = deviceEvent.FirstOrDefault()?.BlockedExitDetection?.State ?? false,
                        WidgetName = "BlockedExitDetection",
                        EventName = jsonDetail.EventName,
                        RuleIndex = jsonDetail.RuleIndex ?? 0,
                        RuleName = jsonDetail.RuleName ?? string.Empty
                    });

                    await _hubContext.Clients.Group(deviceDetail.Id + "BlockedExitDetection").SendAsync("BlockedExitDetection", jsonMessage);
                    var deviceEventId = await _deviceEventsRepository.InsertAsync(deviceEvent.FirstOrDefault());
                    await _userNotificationService.AddUserNotification("Blocked Exit Detected",
                                "An exit has been detected as blocked on " + deviceDetail.DeviceName,
                                "Acknowledge",
                                 deviceEventId);
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.VehicleSpeedDetection") 
                         && eventModel.EventStatus.FirstOrDefault().Data.State)
                {
                    var deviceEvent = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.VehicleSpeedDetection")
                                     .Select(es => new DeviceEvents
                                     {
                                         EventName = es.EventName,
                                         DeviceId = deviceDetail.Id,
                                         RuleIndex = es.Source.RuleIndex,
                                         RuleName = es.Source.RuleName,
                                         ChannelNo = es.Source.Channel,
                                         VideoSourceToken = es.Source.VideoSourceToken,
                                         CreatedOn = DateTime.UtcNow,
                                         UpdatedOn = DateTime.UtcNow,
                                         DeviceTime = es.Time,
                                         VehicleSpeedDetection = new VehicleSpeedDetection
                                         {
                                             Speed = (double)es.Data.Speed,
                                             State = es.Data.State,
                                         }
                                     });

                    var jsonDetail = deviceEvent.FirstOrDefault();
                    var jsonMessage = JsonConvert.SerializeObject(new
                    {
                        deviceId = deviceDetail.Id,
                        state = deviceEvent.FirstOrDefault()?.VehicleSpeedDetection?.State ?? false,
                        speed = deviceEvent.FirstOrDefault()?.VehicleSpeedDetection?.Speed,
                        WidgetName = "VehicleSpeedViolation",
                        EventName = jsonDetail.EventName,
                        RuleIndex = jsonDetail.RuleIndex ?? 0,
                        RuleName = jsonDetail.RuleName ?? string.Empty
                    });

                    await _hubContext.Clients.Group(deviceDetail.Id + "VehicleSpeedViolation").SendAsync("VehicleSpeedViolation", jsonMessage);
                    await _hubContext.Clients.Group(deviceDetail.Id + "VehicleSpeedViolationMap").SendAsync("VehicleSpeedViolationMap", jsonMessage);
                    var deviceEventId = await _deviceEventsRepository.InsertAsync(deviceEvent.FirstOrDefault());
                    await _userNotificationService.AddUserNotification("High Vehicle Speed Detected",
                                "A vehicle moving above the allowed speed limit was recorded by " + deviceDetail.DeviceName,
                                "Acknowledge",
                                 deviceEventId);
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.TrafficJamDetection")
                         && eventModel.EventStatus.FirstOrDefault().Data.State)
                {
                    var deviceEvent = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.TrafficJamDetection")
                                     .Select(es => new DeviceEvents
                                     {
                                         EventName = es.EventName,
                                         DeviceId = deviceDetail.Id,
                                         RuleIndex = es.Source.RuleIndex,
                                         RuleName = es.Source.RuleName,
                                         ChannelNo = es.Source.Channel,
                                         VideoSourceToken = es.Source.VideoSourceToken,
                                         CreatedOn = DateTime.UtcNow,
                                         UpdatedOn = DateTime.UtcNow,
                                         DeviceTime = es.Time,
                                         TrafficJamDetection = new EventVehicleQueue
                                         {
                                             State = es.Data.State,
                                         }
                                     });

                    var jsonDetail = deviceEvent.FirstOrDefault();
                    var jsonMessage = JsonConvert.SerializeObject(new
                    {
                        deviceId = deviceDetail.Id,
                        state = deviceEvent.FirstOrDefault()?.TrafficJamDetection?.State ?? false,
                        WidgetName = "TrafficJamDetection",
                        EventName = jsonDetail.EventName,
                        RuleIndex = jsonDetail.RuleIndex ?? 0,
                        RuleName = jsonDetail.RuleName ?? string.Empty
                    });

                    await _hubContext.Clients.Group(deviceDetail.Id + "TrafficJamDetection").SendAsync("TrafficJamDetection", jsonMessage);
                    await _hubContext.Clients.Group(deviceDetail.Id + "TrafficJamDetectionMap").SendAsync("TrafficJamDetectionMap", jsonMessage);
                    var deviceEventId = await _deviceEventsRepository.InsertAsync(deviceEvent.FirstOrDefault());
                    await _userNotificationService.AddUserNotification("Traffic Jam Detected",
                               "A traffic jam has been detected on " + deviceDetail.DeviceName,
                               "Acknowledge",
                                deviceEventId);
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.StoppedVehicleDetection")
                         && eventModel.EventStatus.FirstOrDefault().Data.State)
                {
                    if (eventModel.EventStatus.FirstOrDefault().Data.State)
                    {
                        var deviceEvent = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.StoppedVehicleDetection")
                                     .Select(es => new DeviceEvents
                                     {
                                         EventName = es.EventName,
                                         DeviceId = deviceDetail.Id,
                                         RuleIndex = es.Source.RuleIndex,
                                         RuleName = es.Source.RuleName,
                                         ChannelNo = es.Source.Channel,
                                         VideoSourceToken = es.Source.VideoSourceToken,
                                         CreatedOn = DateTime.UtcNow,
                                         UpdatedOn = DateTime.UtcNow,
                                         DeviceTime = es.Time,
                                         StoppedVehicleByType = new StoppedVehicleByType
                                         {
                                             State = es.Data.State,
                                             VehicleType = es.Data.VehicleTypes,
                                         }
                                     });

                        var jsonDetail = deviceEvent.FirstOrDefault();
                        var jsonMessage = JsonConvert.SerializeObject(new
                        {
                            deviceId = deviceDetail.Id,
                            state = deviceEvent.FirstOrDefault()?.StoppedVehicleByType?.State ?? false,
                            WidgetName = "StoppedVehicleDetection",
                            EventName = jsonDetail.EventName,
                            RuleIndex = jsonDetail.RuleIndex ?? 0,
                            RuleName = jsonDetail.RuleName ?? string.Empty,
                            VehicleType = deviceEvent.FirstOrDefault()?.StoppedVehicleByType?.VehicleType ?? ""
                        });

                        await _hubContext.Clients.Group(deviceDetail.Id + "StoppedVehicleDetection").SendAsync("StoppedVehicleDetection", jsonMessage);
                        var deviceEventId = await _deviceEventsRepository.InsertAsync(deviceEvent.FirstOrDefault());
                        await _userNotificationService.AddUserNotification("Stopped Vehicle Detected",
                                   "A stopped vehicle was detected on " + deviceDetail.DeviceName,
                                   "Acknowledge",
                                    deviceEventId);
                    }
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.ProximityDetection") 
                         && eventModel.EventStatus.FirstOrDefault().Data.State)
                {
                    if (eventModel.EventStatus.FirstOrDefault().Data.State)
                    {
                        var deviceEvent = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.ProximityDetection")
                                     .Select(es => new DeviceEvents
                                     {
                                         EventName = es.EventName,
                                         DeviceId = deviceDetail.Id,    
                                         RuleIndex = es.Source.RuleIndex,
                                         RuleName = es.Source.RuleName,
                                         ChannelNo = es.Source.Channel,
                                         VideoSourceToken = es.Source.VideoSourceToken,
                                         CreatedOn = DateTime.UtcNow,
                                         UpdatedOn = DateTime.UtcNow,
                                         DeviceTime = es.Time,
                                         ProximityDetection = new EventVehicleQueue
                                         {
                                             State = es.Data.State,
                                         }
                                     });

                        var jsonDetail = deviceEvent.FirstOrDefault();
                        var jsonMessage = JsonConvert.SerializeObject(new
                        {
                            deviceId = deviceDetail.Id,
                            state = deviceEvent.FirstOrDefault()?.ProximityDetection?.State ?? false,
                            WidgetName = "ForkliftProximityDetection",
                            EventName = jsonDetail.EventName,
                            RuleIndex = jsonDetail.RuleIndex ?? 0,
                            RuleName = jsonDetail.RuleName ?? string.Empty
                        });

                        await _hubContext.Clients.Group(deviceDetail.Id + "ForkliftProximityDetection").SendAsync("ForkliftProximityDetection", jsonMessage);
                        var deviceEventId = await _deviceEventsRepository.InsertAsync(deviceEvent.FirstOrDefault());
                    }
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.ForkliftSpeedDetection")
                         && eventModel.EventStatus.FirstOrDefault().Data.State)
                {
                    if (eventModel.EventStatus.FirstOrDefault().Data.State)
                    {
                        // Handle Forklift Speed Detection event
                        var deviceEvent = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.ForkliftSpeedDetection")
                                     .Select(es => new DeviceEvents
                                     {
                                         EventName = es.EventName,
                                         DeviceId = deviceDetail.Id,
                                         RuleIndex = es.Source.RuleIndex,
                                         RuleName = es.Source.RuleName,
                                         ChannelNo = es.Source.Channel,
                                         VideoSourceToken = es.Source.VideoSourceToken,
                                         CreatedOn = DateTime.UtcNow,
                                         UpdatedOn = DateTime.UtcNow,
                                         DeviceTime = es.Time,
                                         ForkliftSpeedDetection = new VehicleSpeedDetection
                                         {
                                             Speed = (double)es.Data.Speed,
                                             State = es.Data.State,
                                         }
                                     });

                        var jsonDetail = deviceEvent.FirstOrDefault();
                        var jsonMessage = JsonConvert.SerializeObject(new
                        {
                            deviceId = deviceDetail.Id,
                            state = deviceEvent.FirstOrDefault()?.ForkliftSpeedDetection?.State ?? false,
                            speed = deviceEvent.FirstOrDefault()?.ForkliftSpeedDetection?.Speed,
                            WidgetName = "ForkliftSpeedDetection",
                            EventName = jsonDetail.EventName,
                            RuleIndex = jsonDetail.RuleIndex ?? 0,
                            RuleName = jsonDetail.RuleName ?? string.Empty
                        });

                        await _hubContext.Clients.Group(deviceDetail.Id + "ForkliftSpeedDetection").SendAsync("ForkliftSpeedDetection", jsonMessage);
                        var deviceEventId = await _deviceEventsRepository.InsertAsync(deviceEvent.FirstOrDefault());
                        await _userNotificationService.AddUserNotification("Forklift Overspeed Detected",
                                   "A forklift was detected exceeding the speed limit on " + deviceDetail.DeviceName,
                                   "Acknowledge",
                                    deviceEventId);
                    }
                        
                }
                else if (eventModel != null && eventModel.EventStatus.Any(x => x.EventName == "OpenSDK.WiseAI.MaskDetection")
                         && eventModel.EventStatus.FirstOrDefault().Data.State)
                {
                    if (eventModel.EventStatus.FirstOrDefault().Data.State)
                    {
                        // Handle Forklift Speed Detection event
                        var deviceEvent = eventModel.EventStatus.Where(x => x.EventName == "OpenSDK.WiseAI.MaskDetection")
                                     .Select(es => new DeviceEvents
                                     {
                                         EventName = es.EventName,
                                         DeviceId = deviceDetail.Id,
                                         RuleIndex = es.Source.RuleIndex,
                                         RuleName = es.Source.RuleName,
                                         ChannelNo = es.Source.Channel,
                                         VideoSourceToken = es.Source.VideoSourceToken,
                                         CreatedOn = DateTime.UtcNow,
                                         UpdatedOn = DateTime.UtcNow,
                                         DeviceTime = es.Time,
                                         FaceMaskDetection = new EventVehicleQueue
                                         {
                                             State = es.Data.State,
                                         }
                                     });

                        var jsonDetail = deviceEvent.FirstOrDefault();
                        var deviceEventId = await _deviceEventsRepository.InsertAsync(deviceEvent.FirstOrDefault());
                    }

                }
                
            }
            return true;
        }
        

        public async Task<bool> AddPeopleCountFromSunapiAsync(string ip, string userName, string password, string deviceId)
        {
            var apiResponse = await _deviceApiService.CallDeviceApi<PeopleCountResponse>("http://" + ip + SunapiAPIConstant.PeopleCountCheck, userName, password);
            if (apiResponse != null)
            {
                var peopleCount = new PeopleCount
                {
                    DeviceId = deviceId,
                    CameraIP = ip,
                    Lines = apiResponse.PeopleCount.SelectMany(x => x.Lines.Select(l => new Line
                    {
                        LineIndex = l.LineIndex,
                        Name = l.Name,
                        InCount = l.InCount,
                        OutCount = l.OutCount
                    }).AsEnumerable())
                };
                var result = _peopleCountService.InsertPeople(peopleCount);
            }
            return true;
        }

        public async Task<bool> AddVehicleCountFromSunapiAsync(string ip, string userName, string password, string deviceId)
        {
            var apiResponse = await _deviceApiService.CallDeviceApi<VehicleRootObject>("http://" + ip + SunapiAPIConstant.VehicleCountCheckSunapi, userName, password);
            if (apiResponse != null)
            {
                var vehicleCount = new VehicleCount
                {
                    DeviceId = deviceId,
                    CameraIP = ip,
                    VehicleCounts = apiResponse.VehicleCount
                };
                var result = _vehicleService.InsertVehicle(vehicleCount);
            }
            return true;
        }

        public async Task<bool> AddPeopleCountFromWiseAiAsync(string ip, string userName, string password, string deviceId, int channel)
        {
            var apiResponse = await _deviceApiService.CallDeviceApi<ObjectCountingLiveResponse>("http://" + ip + SunapiAPIConstant.PeopleCountCheck + channel, userName, password);
            if (apiResponse != null)
            {
                var peopleCount = new PeopleCount
                {
                    DeviceId = deviceId,
                    CameraIP = ip,
                    ChannelNo = channel,
                    Lines = apiResponse.ObjectCountingLive.SelectMany(x => x.CountingRules.SelectMany(l => l.Lines.Select(y => new Line
                    {
                        LineIndex = y.Index,
                        Name = "",
                        InCount = y.DirectionBasedResult.FirstOrDefault(d => d.Direction == "IN")?.Count ?? 0,
                        OutCount = y.DirectionBasedResult.FirstOrDefault(d => d.Direction == "OUT")?.Count ?? 0
                    })).AsEnumerable())
                };
                var result = _peopleCountService.InsertPeople(peopleCount);
            }
            return true;
        }

        public async Task<bool> AddVehicleCountFromWiseAi(string ip, string userName, string password, string deviceId, int channel)
        {
            var apiResponse = await _deviceApiService.CallDeviceApi<ObjectCountingLiveResponse>("http://" + ip + WiseAPIConstant.PeopleCountCheck + channel, userName, password);
            if (apiResponse != null)
            {
                var vehicleCount = new VehicleCount
                {
                    DeviceId = deviceId,
                    CameraIP = ip,
                    ChannelNo = channel,
                    VehicleCounts = apiResponse.ObjectCountingLive.Select(x => new VehicleCountData
                    {
                        Channel = x.Channel,
                        Lines = x.CountingRules
                    .SelectMany(cr => cr.Lines.Select(line => new VehicleLine
                    {
                        LineIndex = line.Index,
                        Name = "",
                        InCount = line.DirectionBasedResult.FirstOrDefault(d => d.Direction == "IN")?.Count ?? 0,
                        OutCount = line.DirectionBasedResult.FirstOrDefault(d => d.Direction == "OUT")?.Count ?? 0,
                        In = ExtractVehicleData(line.DirectionBasedResult.FirstOrDefault(d => d.Direction == "IN")),
                        Out = ExtractVehicleData(line.DirectionBasedResult.FirstOrDefault(d => d.Direction == "OUT"))
                    })).AsEnumerable()
                    }).AsEnumerable()
                };
                var result = _vehicleService.InsertVehicle(vehicleCount);
            }
            return true;
        }

        private VehicleData ExtractVehicleData(DirectionBasedResult? directionResult)
        {
            if (directionResult == null || directionResult.VehicleInfo == null)
                return new VehicleData();

            return new VehicleData
            {
                Car = directionResult.VehicleInfo.FirstOrDefault(v => v.VehicleType == "Car")?.Count ?? 0,
                Bus = directionResult.VehicleInfo.FirstOrDefault(v => v.VehicleType == "Bus")?.Count ?? 0,
                Truck = directionResult.VehicleInfo.FirstOrDefault(v => v.VehicleType == "Truck")?.Count ?? 0,
                Motorcycle = directionResult.VehicleInfo.FirstOrDefault(v => v.VehicleType == "Motorcycle")?.Count ?? 0,
                Bicycle = directionResult.VehicleInfo.FirstOrDefault(v => v.VehicleType == "Bicycle")?.Count ?? 0
            };
        }






    }
}
