import { RadialProgressBar } from "./Dashboard/Chart_Polygon/CameraOnlineOffline/RadialProgressBar";
import { ErrorBoundary } from "./ErrorBoundary/ErrorBoundary";
import { CustomErrorBoundary } from "./ErrorBoundary/RouterErrorBoundry";
import { Header } from "./Layout/Header";
import { Sidebar } from "./Layout/Sidebar";
import { NotificationDeatil } from "./Layout/NotificationDeatil";
import { showToast } from "./Reusable/Toast";
import { ChangePassword } from "./Users/ChangePassword";
import { UserAddEditForm } from "./Users/UserAddEditForm";
import { CommonDialog } from "./Reusable/CommonDialog";
import { CustomButton } from "./Reusable/CustomButton";
import { CustomTextField } from "./Reusable/CustomTextField";
import { CustomSelect } from "./Reusable/CustomSelect";
import { CustomMultiSelect } from "./Reusable/CustomMultiSelect";
import { CustomSelectToggleButton } from "./Reusable/CustomSelectToggleButton";
import { EmailTemplatesTable } from "./EmailTemplates/EmailTemplatesTable";
import { CurrentLicenseDetail } from "./Setting/CurrentLicenseDetail";
import { MachineIdDisplay } from "./Setting/MachineIdDisplay";
import { OperationalTiming } from "./Setting/OperationalTiming";
import { SmtpSetting } from "./Setting/SmtpSetting";
import { UploadClientLicense } from "./Setting/UploadClientLicense";
import { UploadClientLicenseKey } from "./Setting/UploadClientLicenseKey";
import { UploadCustomerLogo } from "./Setting/UploadCustomerLogo";
import { LicenseHistoryDetail } from "./Setting/LicenseHistoryDetail";
import { NoFloorData } from "./FloorPlansAndZones/NoFloorData";
import { FloorAndZoneList } from "./FloorPlansAndZones/FloorAndZoneList";
import { FloorList } from "./FloorPlansAndZones/FloorList";
import { RectanglePolygon } from "./FloorPlansAndZones/RectanglePolygon";
import { RoleAndPermissionsManagement } from "./RolesAndPermissions/RoleAndPermissionsManagement";
import { ZoneList } from "./FloorPlansAndZones/ZoneList";
import { ProgressBar } from "./Dashboard/Chart_Polygon/CameraOnlineOffline/Progressbar";
import { DeviceListComponent } from "./FloorPlansAndZones/DeviceListComponent";
import { CustomTextFieldWithButton } from "./Reusable/CustomTextFieldWithButton";
import { VehicleQueueAnalysisWidget } from "./Dashboard/Chart_Polygon/VehicleQueueAnalysis/VehicleQueueAnalysisWidget";
import { VehicleQueueAnalysis1_1 } from "./Dashboard/Chart_Polygon/VehicleQueueAnalysis/VehicleQueueAnalysis1_1";
import { VehicleQueueAnalysis2_1_Option1 } from "./Dashboard/Chart_Polygon/VehicleQueueAnalysis/VehicleQueueAnalysis2_1_Option1";
import { VehicleQueueAnalysis2_1_Option2 } from "./Dashboard/Chart_Polygon/VehicleQueueAnalysis/VehicleQueueAnalysis2_1_Option2";
import { VehicleQueueAnalysis2_1_Option3 } from "./Dashboard/Chart_Polygon/VehicleQueueAnalysis/VehicleQueueAnalysis2_1_Option3";
import { OperationalTimePicker } from "./Setting/OperationalTimePicker";
import { UploadClientLicenseAndPem } from "./Setting/UploadClientLicenseAndPem";
import { UserProfileDetails } from "./Users/UserProfileDetails";
import { CameraOnlineOfflineWidget } from "./Dashboard/Chart_Polygon/CameraOnlineOffline/CameraOnlineOfflineWidget";
import { CameraOnlineOffline1_1 } from "./Dashboard/Chart_Polygon/CameraOnlineOffline/CameraOnlineOffline1_1";
import { CameraOnlineOffline2_1_Option1 } from "./Dashboard/Chart_Polygon/CameraOnlineOffline/CameraOnlineOffline2_1_Option1";
import { CameraOnlineOffline2_1_Option2 } from "./Dashboard/Chart_Polygon/CameraOnlineOffline/CameraOnlineOffline2_1_Option2";
import { CapacityUtilizationForPeopleWidget } from "./Dashboard/Chart_Polygon/CapacityUtilizationForPeople/CapacityUtilizationForPeopleWidget";
import { CapacityUtilizationForPeople1_1 } from "./Dashboard/Chart_Polygon/CapacityUtilizationForPeople/CapacityUtilizationForPeople1_1";
import { CapacityUtilizationForPeople2_1_Option1 } from "./Dashboard/Chart_Polygon/CapacityUtilizationForPeople/CapacityUtilizationForPeople2_1_Option1";
import { CapacityUtilizationForPeople2_1_Option2 } from "./Dashboard/Chart_Polygon/CapacityUtilizationForPeople/CapacityUtilizationForPeople2_1_Option2";
import { CapacityUtilizationForPeople2_1_Option3 } from "./Dashboard/Chart_Polygon/CapacityUtilizationForPeople/CapacityUtilizationForPeople2_1_Option3";
import { CapacityUtilizationForPeople2_1_Option4 } from "./Dashboard/Chart_Polygon/CapacityUtilizationForPeople/CapacityUtilizationForPeople2_1_Option4";
import { CameraByFeatureWidget } from "./Dashboard/Chart_Polygon/CametaByfeature/CameraByFeatureWidget";
import { CameraByFeature1_1 } from "./Dashboard/Chart_Polygon/CametaByfeature/CameraByFeature1_1";
import { CameraByFeature2_1_Option1 } from "./Dashboard/Chart_Polygon/CametaByfeature/CameraByFeature2_1_Option1";
import { CameraByFeature2_1_Option2 } from "./Dashboard/Chart_Polygon/CametaByfeature/CameraByFeature2_1_Option2";
import { ModaltypesWidget } from "./Dashboard/Chart_Polygon/ModalTypes/ModaltypesWidget";
import { ModaltypesWidget1_1 } from "./Dashboard/Chart_Polygon/ModalTypes/ModaltypesWidget1_1";
import { ModaltypesWidget2_1_Option1 } from "./Dashboard/Chart_Polygon/ModalTypes/ModaltypesWidget2_1_Option1";
import { ModaltypesWidget2_1_Option2 } from "./Dashboard/Chart_Polygon/ModalTypes/ModaltypesWidget2_1_Option2";
import { SeriesBadge } from "./Dashboard/Chart_Polygon/ModalTypes/SeriesBadge";
import { UserPreferences } from "./Users/UserPreferences";
import { GenderWidget } from "./Dashboard/Chart_Polygon/Gender/GenderWidget";
import { Gender1_1 } from "./Dashboard/Chart_Polygon/Gender/Gender1_1";
import { Gender2_1_Option1 } from "./Dashboard/Chart_Polygon/Gender/Gender2_1_Option1";
import { Gender2_1_Option2 } from "./Dashboard/Chart_Polygon/Gender/Gender2_1_Option2";
import { Gender3_1_Option1 } from "./Dashboard/Chart_Polygon/Gender/Gender3_1_Option1";
import { SlipAndFallDetectionWidget } from "./Dashboard/Chart_Polygon/SlipAndFallDetection/SlipAndFallDetectionWidget";
import { SlipAndFallDetection1_1 } from "./Dashboard/Chart_Polygon/SlipAndFallDetection/SlipAndFallDetection1_1";
import { SlipAndFallDetection2_1_Option1 } from "./Dashboard/Chart_Polygon/SlipAndFallDetection/SlipAndFallDetection2_1_Option1";
import { SlipAndFallDetection2_1_Option2 } from "./Dashboard/Chart_Polygon/SlipAndFallDetection/SlipAndFallDetection2_1_Option2";
import { ZoneWiseCapacityUtilizationForPeopleWidget } from "./Dashboard/Chart_Polygon/ZoneWiseCapacityUtilizationForPeople/ZoneWiseCapacityUtilizationForPeopleWidget";
import { ZoneWiseCapacityUtilizationForPeople1_1 } from "./Dashboard/Chart_Polygon/ZoneWiseCapacityUtilizationForPeople/ZoneWiseCapacityUtilizationForPeople1_1";
import { ZoneWiseCapacityUtilizationForPeople2_1_Option2 } from "./Dashboard/Chart_Polygon/ZoneWiseCapacityUtilizationForPeople/ZoneWiseCapacityUtilizationForPeople2_1_Option2";
import { ZoneWiseCapacityUtilizationForPeople2_1_Option3 } from "./Dashboard/Chart_Polygon/ZoneWiseCapacityUtilizationForPeople/ZoneWiseCapacityUtilizationForPeople2_1_Option3";
import { PedestrianDetectionWidget } from "./Dashboard/Chart_Polygon/PedestrianDetection/PedestrianDetectionWidget";
import { PedestrianDetection1_1 } from "./Dashboard/Chart_Polygon/PedestrianDetection/PedestrianDetection1_1";
import { PedestrianDetection2_1_Option1 } from "./Dashboard/Chart_Polygon/PedestrianDetection/PedestrianDetection2_1_Option1";
import { PedestrianDetection2_1_Option2 } from "./Dashboard/Chart_Polygon/PedestrianDetection/PedestrianDetection2_1_Option2";
import { CapacityUtilizationForVehicleWidget } from "./Dashboard/Chart_Polygon/CapacityUtilizationforVehicle/CapacityUtilizationForVehicleWidget";
import { CapacityUtilizationForVehicle1_1 } from "./Dashboard/Chart_Polygon/CapacityUtilizationforVehicle/CapacityUtilizationForVehicle1_1";
import { CapacityUtilizationForVehicle2_1Option1 } from "./Dashboard/Chart_Polygon/CapacityUtilizationforVehicle/CapacityUtilizationForVehicle2_1Option1";
import { CapacityUtilizationForVehicle2_1Option2 } from "./Dashboard/Chart_Polygon/CapacityUtilizationforVehicle/CapacityUtilizationForVehicle2_1Option2";
import { CapacityUtilizationForVehicle2_1Option3 } from "./Dashboard/Chart_Polygon/CapacityUtilizationforVehicle/CapacityUtilizationForVehicle2_1Option3";
import { CapacityUtilizationForVehicle2_1Option4 } from "./Dashboard/Chart_Polygon/CapacityUtilizationforVehicle/CapacityUtilizationForVehicle2_1Option4";
import { VehicleInWrongDirectionWidget } from "./Dashboard/Chart_Polygon/VehicleInWrongDirection/VehicleInWrongDirectionWidget";
import { VehicleInWrongDirection1_1 } from "./Dashboard/Chart_Polygon/VehicleInWrongDirection/VehicleInWrongDirection1_1";
import { VehicleInWrongDirection2_1_Option1 } from "./Dashboard/Chart_Polygon/VehicleInWrongDirection/VehicleInWrongDirection2_1_Option1";
import { VehicleInWrongDirection2_1_Option2 } from "./Dashboard/Chart_Polygon/VehicleInWrongDirection/VehicleInWrongDirection2_1_Option2";
import { VehicleUTurnWidget } from "./Dashboard/Chart_Polygon/VehicleUTurn/VehicleUTurnWidget";
import { VehicleUTurn1_1 } from "./Dashboard/Chart_Polygon/VehicleUTurn/VehicleUTurn1_1";
import { VehicleUTurn2_1_Option1 } from "./Dashboard/Chart_Polygon/VehicleUTurn/VehicleUTurn2_1_Option1";
import { VehicleUTurn2_1_Option2 } from "./Dashboard/Chart_Polygon/VehicleUTurn/VehicleUTurn2_1_Option2";
import { ZoneWiseCapacityUtilizationForVehicleWidget } from "./Dashboard/Chart_Polygon/ZoneWiseCapacityUtilizationForVehicle/ZoneWiseCapacityUtilizationForVehicleWidget";
import { ZoneWiseCapacityUtilizationForVehicle1_1 } from "./Dashboard/Chart_Polygon/ZoneWiseCapacityUtilizationForVehicle/ZoneWiseCapacityUtilizationForVehicle1_1";
import { ZoneWiseCapacityUtilizationForVehicle2_1_Option2 } from "./Dashboard/Chart_Polygon/ZoneWiseCapacityUtilizationForVehicle/ZoneWiseCapacityUtilizationForVehicle2_1_Option2";
import { ZoneWiseCapacityUtilizationForVehicle2_1_Option3 } from "./Dashboard/Chart_Polygon/ZoneWiseCapacityUtilizationForVehicle/ZoneWiseCapacityUtilizationForVehicle2_1_Option3";
import { VehicleTurningMovementWidget } from "./Dashboard/Chart_Polygon/VehicleTurningMovement/VehicleTurningMovementWidget";
import { VehicleTurningMovement1_1 } from "./Dashboard/Chart_Polygon/VehicleTurningMovement/VehicleTurningMovement1_1";
import { VehicleTurningMovement2_1_Option1 } from "./Dashboard/Chart_Polygon/VehicleTurningMovement/VehicleTurningMovement2_1_Option1";
import { VehicleTurningMovement2_1_Option2 } from "./Dashboard/Chart_Polygon/VehicleTurningMovement/VehicleTurningMovement2_1_Option2";
import { VehicleTurningMovement2_1_Option3 } from "./Dashboard/Chart_Polygon/VehicleTurningMovement/VehicleTurningMovement2_1_Option3";
import { CumulativePeopleWidget } from "./Dashboard/Chart_Polygon/CumulativePeople/CumulativePeopleWidget";
import { CumulativePeople1_1 } from "./Dashboard/Chart_Polygon/CumulativePeople/CumulativePeople1_1";
import { CumulativePeople2_1_Option1 } from "./Dashboard/Chart_Polygon/CumulativePeople/CumulativePeople2_1_Option1";
import { CumulativePeople2_1_Option2 } from "./Dashboard/Chart_Polygon/CumulativePeople/CumulativePeople2_1_Option2";
import { ShoppingQueueEventWidget } from "./Dashboard/Chart_Polygon/ShoppingQueueEvent/ShoppingQueueEventWidget";
import { ShoppingQueueEvent1_1 } from "./Dashboard/Chart_Polygon/ShoppingQueueEvent/ShoppingQueueEvent1_1";
import { ShoppingQueueEvent2_1_Option1 } from "./Dashboard/Chart_Polygon/ShoppingQueueEvent/ShoppingQueueEvent2_1_Option1";
import { ShoppingQueueEvent2_1_Option2 } from "./Dashboard/Chart_Polygon/ShoppingQueueEvent/ShoppingQueueEvent2_1_Option2";
import { ShoppingQueueEvent2_1_Option3 } from "./Dashboard/Chart_Polygon/ShoppingQueueEvent/ShoppingQueueEvent2_1_Option3";
import { ForkliftQueueEventWidget } from "./Dashboard/Chart_Polygon/ForkliftQueueEvent/ForkliftQueueEventWidget";
import { ForkliftQueueEvent1_1 } from "./Dashboard/Chart_Polygon/ForkliftQueueEvent/ForkliftQueueEvent1_1";
import { ForkliftQueueEvent2_1_Option1 } from "./Dashboard/Chart_Polygon/ForkliftQueueEvent/ForkliftQueueEvent2_1_Option1";
import { ForkliftQueueEvent2_1_Option2 } from "./Dashboard/Chart_Polygon/ForkliftQueueEvent/ForkliftQueueEvent2_1_Option2";
import { ForkliftQueueEvent2_1_Option3 } from "./Dashboard/Chart_Polygon/ForkliftQueueEvent/ForkliftQueueEvent2_1_Option3";
import { ZoneWisePeopleCountingWidget } from "./Dashboard/Chart_Polygon/ZoneWisePeopleCounting/ZoneWisePeopleCountingWidget";
import { ZoneWisePeopleCounting1_1 } from "./Dashboard/Chart_Polygon/ZoneWisePeopleCounting/ZoneWisePeopleCounting1_1";
import { ZoneWisePeopleCounting2_1Option1 } from "./Dashboard/Chart_Polygon/ZoneWisePeopleCounting/ZoneWisePeopleCounting2_1Option1";
import { ZoneWisePeopleCounting2_1Option2 } from "./Dashboard/Chart_Polygon/ZoneWisePeopleCounting/ZoneWisePeopleCounting2_1Option2";
import { SpeedViolationbyVehicleWidget } from "./Dashboard/Chart_Polygon/SpeedViolationbyVehicle/SpeedViolationbyVehicleWidget";
import { SpeedViolationbyVehicle1_1 } from "./Dashboard/Chart_Polygon/SpeedViolationbyVehicle/SpeedViolationbyVehicle1_1";
import { SpeedViolationbyVehicle2_1_Option1 } from "./Dashboard/Chart_Polygon/SpeedViolationbyVehicle/SpeedViolationbyVehicle2_1_Option1";
import { SpeedViolationbyVehicle2_1_Option2 } from "./Dashboard/Chart_Polygon/SpeedViolationbyVehicle/SpeedViolationbyVehicle2_1_Option2";
import { TrafficJambyDayWidget } from "./Dashboard/Chart_Polygon/TrafficJambyDay/TrafficJambyDayWidget";
import { TrafficJambyDay1_1 } from "./Dashboard/Chart_Polygon/TrafficJambyDay/TrafficJambyDay1_1";
import { TrafficJambyDay2_1_Option1 } from "./Dashboard/Chart_Polygon/TrafficJambyDay/TrafficJambyDay2_1_Option1";
import { TrafficJambyDay2_1_Option2 } from "./Dashboard/Chart_Polygon/TrafficJambyDay/TrafficJambyDay2_1_Option2";
import { TrafficJambyDay2_1_Option3 } from "./Dashboard/Chart_Polygon/TrafficJambyDay/TrafficJambyDay2_1_Option3";
import { CustomEditableWidgetName } from "./Reusable/CustomEditableWidgetName";
import { CountingForForkliftWidget } from "./Dashboard/Chart_Polygon/CountingForForklift/CountingForForkliftWidget";
import { CountingForForklift1_1 } from "./Dashboard/Chart_Polygon/CountingForForklift/CountingForForklift1_1";
import { CountingForForklift2_1Option1 } from "./Dashboard/Chart_Polygon/CountingForForklift/CountingForForklift2_1Option1";
import { CountingForForklift2_1Option2 } from "./Dashboard/Chart_Polygon/CountingForForklift/CountingForForklift2_1Option2";
import { CountingForForklift2_1Option3 } from "./Dashboard/Chart_Polygon/CountingForForklift/CountingForForklift2_1Option3";
import { MapPlanWidget } from "./Dashboard/Chart_Polygon/MapPlan/MapPlanWidget";
import { MapWidgetSetup } from "./Dashboard/Chart_Polygon/MapPlan/MapWidgetSetup";
import { FloorPlanWidget } from "./Dashboard/Chart_Polygon/FloorPlan/FloorPlanWidget";
import { FloorPlanWidgetSetup } from "./Dashboard/Chart_Polygon/FloorPlan/FloorPlanWidgetSetup";
import { ChartTicksSelector } from "./Reusable/ChartTicksSelector";
import { CustomMapWidget } from "./Reusable/CustomMapWidget";
import { GoogleMapComponent } from "./Dashboard/Chart_Polygon/MapPlan/GoogleMapComponent";
import { GoogleMapApiKey } from "./Setting/GoogleMapApiKey";
import { SafetyMeasuresWidgets } from "./Dashboard/Chart_Polygon/SafetyMeasures/SafetyMeasuresWidgets";
import { SafetyMeasures1_1 } from "./Dashboard/Chart_Polygon/SafetyMeasures/SafetyMeasures1_1";
import { SafetyMeasures2_1_Option1 } from "./Dashboard/Chart_Polygon/SafetyMeasures/SafetyMeasures2_1_Option1";
import { SafetyMeasures2_1_Option2 } from "./Dashboard/Chart_Polygon/SafetyMeasures/SafetyMeasures2_1_Option2";
import { SafetyMeasures2_1_Option3 } from "./Dashboard/Chart_Polygon/SafetyMeasures/SafetyMeasures2_1_Option3";
import { AveragePeopleCountWidget } from "./Dashboard/Chart_Polygon/AveragePeopleCount/AveragePeopleCountWidget";
import { AveragePeopleCount1_1 } from "./Dashboard/Chart_Polygon/AveragePeopleCount/AveragePeopleCount1_1";
import { AveragePeopleCount2_1_Option1 } from "./Dashboard/Chart_Polygon/AveragePeopleCount/AveragePeopleCount2_1_Option1";
import { AveragePeopleCount2_1_Option2 } from "./Dashboard/Chart_Polygon/AveragePeopleCount/AveragePeopleCount2_1_Option2";
import { AveragePeopleCount3_1_Option1 } from "./Dashboard/Chart_Polygon/AveragePeopleCount/AveragePeopleCount3_1_Option1";
import { PeopleInOutWidget } from "./Dashboard/Chart_Polygon/PeopleInOut/PeopleInOutWidget";
import { PeopleInOut1_1 } from "./Dashboard/Chart_Polygon/PeopleInOut/PeopleInOut1_1";
import { PeopleInOut2_1_Option1 } from "./Dashboard/Chart_Polygon/PeopleInOut/PeopleInOut2_1_Option1";
import { PeopleInOut2_1_Option2 } from "./Dashboard/Chart_Polygon/PeopleInOut/PeopleInOut2_1_Option2";
import { PeopleInOut2_1_Option3 } from "./Dashboard/Chart_Polygon/PeopleInOut/PeopleInOut2_1_Option3";
import { NewVsTotalVisitorsWidget } from "./Dashboard/Chart_Polygon/NewVsTotalVisitors/NewVsTotalVisitorsWidget";
import { NewVsTotalVisitors1_1 } from "./Dashboard/Chart_Polygon/NewVsTotalVisitors/NewVsTotalVisitors1_1";
import { NewVsTotalVisitors2_1_Option1 } from "./Dashboard/Chart_Polygon/NewVsTotalVisitors/NewVsTotalVisitors2_1_Option1";
import { NewVsTotalVisitors2_1_Option2 } from "./Dashboard/Chart_Polygon/NewVsTotalVisitors/NewVsTotalVisitors2_1_Option2";
import { NewVsTotalVisitors2_1_Option3 } from "./Dashboard/Chart_Polygon/NewVsTotalVisitors/NewVsTotalVisitors2_1_Option3";
import { VehicleByTypeWidget } from "./Dashboard/Chart_Polygon/VehicleByType/VehicleByTypeWidget";
import { VehicleByType1_1 } from "./Dashboard/Chart_Polygon/VehicleByType/VehicleByType1_1";
import { VehicleByType2_1_Option1 } from "./Dashboard/Chart_Polygon/VehicleByType/VehicleByType2_1_Option1";
import { VehicleByType2_1_Option2 } from "./Dashboard/Chart_Polygon/VehicleByType/VehicleByType2_1_Option2";
import { VehicleByType2_1_Option3 } from "./Dashboard/Chart_Polygon/VehicleByType/VehicleByType2_1_Option3";
import { AverageVehicleCountWidget } from "./Dashboard/Chart_Polygon/AverageVehicleCount/AverageVehicleCountWidget";
import { AverageVehicleCount1_1 } from "./Dashboard/Chart_Polygon/AverageVehicleCount/AverageVehicleCount1_1";
import { AverageVehicleCount2_1_Option1 } from "./Dashboard/Chart_Polygon/AverageVehicleCount/AverageVehicleCount2_1_Option1";
import { AverageVehicleCount2_1_Option2 } from "./Dashboard/Chart_Polygon/AverageVehicleCount/AverageVehicleCount2_1_Option2";
import { AverageVehicleCount2_1_Option3 } from "./Dashboard/Chart_Polygon/AverageVehicleCount/AverageVehicleCount2_1_Option3";
import { BlockedExitDetectionWidget } from "./Dashboard/Chart_Polygon/BlockedExitDetection/BlockedExitDetectionWidget";
import { BlockedExitDetection1_1 } from "./Dashboard/Chart_Polygon/BlockedExitDetection/BlockedExitDetection1_1";
import { BlockedExitDetection2_1_Option1 } from "./Dashboard/Chart_Polygon/BlockedExitDetection/BlockedExitDetection2_1_Option1";
import { BlockedExitDetection2_1_Option2 } from "./Dashboard/Chart_Polygon/BlockedExitDetection/BlockedExitDetection2_1_Option2";
import { BlockedExitDetection2_1_Option3 } from "./Dashboard/Chart_Polygon/BlockedExitDetection/BlockedExitDetection2_1_Option3";
import { VehicleInOutWidget } from "./Dashboard/Chart_Polygon/VehicleInOut/VehicleInOutWidget";
import { VehicleInOut1_1 } from "./Dashboard/Chart_Polygon/VehicleInOut/VehicleInOut1_1";
import { VehicleInOut2_1_Option1 } from "./Dashboard/Chart_Polygon/VehicleInOut/VehicleInOut2_1_Option1";
import { VehicleInOut2_1_Option2 } from "./Dashboard/Chart_Polygon/VehicleInOut/VehicleInOut2_1_Option2";
import { VehicleInOut2_1_Option3 } from "./Dashboard/Chart_Polygon/VehicleInOut/VehicleInOut2_1_Option3";
import { StoppedVehicleCountByTypeWidget } from "./Dashboard/Chart_Polygon/StoppedVehicleCountByType/StoppedVehicleCountByTypeWidget";
import { StoppedVehicleCountByType1_1 } from "./Dashboard/Chart_Polygon/StoppedVehicleCountByType/StoppedVehicleCountByType1_1";
import { StoppedVehicleCountByType2_1_Option1 } from "./Dashboard/Chart_Polygon/StoppedVehicleCountByType/StoppedVehicleCountByType2_1_Option1";
import { StoppedVehicleCountByType2_1_Option2 } from "./Dashboard/Chart_Polygon/StoppedVehicleCountByType/StoppedVehicleCountByType2_1_Option2";
import { StoppedVehicleCountByType2_1_Option3 } from "./Dashboard/Chart_Polygon/StoppedVehicleCountByType/StoppedVehicleCountByType2_1_Option3";
import { PeopleQueueEventWidget } from "./Dashboard/Chart_Polygon/PeopleQueueEvent/PeopleQueueEventWidget";
import { PeopleQueueEvent1_1 } from "./Dashboard/Chart_Polygon/PeopleQueueEvent/PeopleQueueEvent1_1";
import { PeopleQueueEvent2_1_Option1 } from "./Dashboard/Chart_Polygon/PeopleQueueEvent/PeopleQueueEvent2_1_Option1";
import { PeopleQueueEvent2_1_Option2 } from "./Dashboard/Chart_Polygon/PeopleQueueEvent/PeopleQueueEvent2_1_Option2";
import { PeopleQueueEvent2_1_Option3 } from "./Dashboard/Chart_Polygon/PeopleQueueEvent/PeopleQueueEvent2_1_Option3";
import { DetectForkliftsWidget } from "./Dashboard/Chart_Polygon/DetectForklifts/DetectForkliftsWidget";
import { DetectForklifts1_1 } from "./Dashboard/Chart_Polygon/DetectForklifts/DetectForklifts1_1";
import { DetectForklifts2_1_Option1 } from "./Dashboard/Chart_Polygon/DetectForklifts/DetectForklifts2_1_Option1";
import { DetectForklifts2_1_Option2 } from "./Dashboard/Chart_Polygon/DetectForklifts/DetectForklifts2_1_Option2";
import { DetectForklifts2_1_Option3 } from "./Dashboard/Chart_Polygon/DetectForklifts/DetectForklifts2_1_Option3";
import { VehicleDetectionHeatmapWidget } from "./Dashboard/Chart_Polygon/VehicleDetectionHeapmap/VehicleDetectionHeatmapWidget";
import { VehicleDetectionHeatmap1_1 } from "./Dashboard/Chart_Polygon/VehicleDetectionHeapmap/VehicleDetectionHeatmap1_1";
import { ForkliftHeatmapWidget } from "./Dashboard/Chart_Polygon/ForkliftHeatmap/ForkliftHeatmapWidget";
import { ForkliftHeatmap1_1 } from "./Dashboard/Chart_Polygon/ForkliftHeatmap/ForkliftHeatmap1_1";
import { ShoppingcartHeatmapWidget } from "./Dashboard/Chart_Polygon/ShoppingcartHeatmap/ShoppingcartHeatmapWidget";
import { ShoppingcartHeatmap1_1 } from "./Dashboard/Chart_Polygon/ShoppingcartHeatmap/ShoppingcartHeatmap1_1";
import { ForkliftSpeedDetectionWidget } from "./Dashboard/Chart_Polygon/ForkliftSpeedDetection/ForkliftSpeedDetectionWidget";
import { ForkliftSpeedDetection1_1 } from "./Dashboard/Chart_Polygon/ForkliftSpeedDetection/ForkliftSpeedDetection1_1";
import { ForkliftSpeedDetection2_1_Option1 } from "./Dashboard/Chart_Polygon/ForkliftSpeedDetection/ForkliftSpeedDetection2_1_Option1";
import { ForkliftSpeedDetection2_1_Option2 } from "./Dashboard/Chart_Polygon/ForkliftSpeedDetection/ForkliftSpeedDetection2_1_Option2";
import { ShoppingCartCountingWidget } from "./Dashboard/Chart_Polygon/ShoppingCartCounting/ShoppingCartCountingWidget";
import { ShoppingCartCounting1_1 } from "./Dashboard/Chart_Polygon/ShoppingCartCounting/ShoppingCartCounting1_1";
import { ShoppingCartCounting2_1_Option1 } from "./Dashboard/Chart_Polygon/ShoppingCartCounting/ShoppingCartCounting2_1_Option1";
import { ShoppingCartCounting2_1_Option2 } from "./Dashboard/Chart_Polygon/ShoppingCartCounting/ShoppingCartCounting2_1_Option2";
import { ShoppingCartCounting2_1_Option3 } from "./Dashboard/Chart_Polygon/ShoppingCartCounting/ShoppingCartCounting2_1_Option3";
import { LocalLoader } from "./LocalLoader";
import { CameraStream } from "./FloorPlansAndZones/CameraStream";

export {
  RadialProgressBar,
  ErrorBoundary,
  CustomErrorBoundary,
  Header,
  Sidebar,
  NotificationDeatil,
  showToast,
  ChangePassword,
  UserAddEditForm,
  CommonDialog,
  CustomButton,
  CustomTextField,
  CustomSelect,
  CustomMultiSelect,
  CustomSelectToggleButton,
  EmailTemplatesTable,
  CurrentLicenseDetail,
  MachineIdDisplay,
  OperationalTiming,
  SmtpSetting,
  UploadClientLicense,
  UploadClientLicenseKey,
  UploadCustomerLogo,
  LicenseHistoryDetail,
  NoFloorData,
  FloorAndZoneList,
  FloorList,
  RectanglePolygon,
  RoleAndPermissionsManagement,
  ZoneList,
  ProgressBar,
  DeviceListComponent,
  CustomTextFieldWithButton,
  VehicleQueueAnalysisWidget,
  VehicleQueueAnalysis1_1,
  VehicleQueueAnalysis2_1_Option1,
  VehicleQueueAnalysis2_1_Option2,
  VehicleQueueAnalysis2_1_Option3,
  OperationalTimePicker,
  UploadClientLicenseAndPem,
  UserProfileDetails,
  CameraOnlineOfflineWidget,
  CameraOnlineOffline1_1,
  CameraOnlineOffline2_1_Option1,
  CameraOnlineOffline2_1_Option2,
  CapacityUtilizationForPeopleWidget,
  CapacityUtilizationForPeople1_1,
  CapacityUtilizationForPeople2_1_Option1,
  CapacityUtilizationForPeople2_1_Option2,
  CapacityUtilizationForPeople2_1_Option3,
  CapacityUtilizationForPeople2_1_Option4,
  CameraByFeatureWidget,
  CameraByFeature1_1,
  CameraByFeature2_1_Option1,
  CameraByFeature2_1_Option2,
  ModaltypesWidget,
  ModaltypesWidget1_1,
  ModaltypesWidget2_1_Option1,
  ModaltypesWidget2_1_Option2,
  SeriesBadge,
  UserPreferences,
  GenderWidget,
  Gender1_1,
  Gender2_1_Option1,
  Gender2_1_Option2,
  Gender3_1_Option1,
  SlipAndFallDetectionWidget,
  SlipAndFallDetection1_1,
  SlipAndFallDetection2_1_Option1,
  SlipAndFallDetection2_1_Option2,
  ZoneWiseCapacityUtilizationForPeopleWidget,
  ZoneWiseCapacityUtilizationForPeople1_1,
  ZoneWiseCapacityUtilizationForPeople2_1_Option2,
  ZoneWiseCapacityUtilizationForPeople2_1_Option3,
  PedestrianDetectionWidget,
  PedestrianDetection1_1,
  PedestrianDetection2_1_Option1,
  PedestrianDetection2_1_Option2,
  CapacityUtilizationForVehicleWidget,
  CapacityUtilizationForVehicle1_1,
  CapacityUtilizationForVehicle2_1Option1,
  CapacityUtilizationForVehicle2_1Option2,
  CapacityUtilizationForVehicle2_1Option3,
  CapacityUtilizationForVehicle2_1Option4,
  VehicleInWrongDirectionWidget,
  VehicleInWrongDirection1_1,
  VehicleInWrongDirection2_1_Option1,
  VehicleInWrongDirection2_1_Option2,
  VehicleUTurnWidget,
  VehicleUTurn1_1,
  VehicleUTurn2_1_Option1,
  VehicleUTurn2_1_Option2,
  ZoneWiseCapacityUtilizationForVehicleWidget,
  ZoneWiseCapacityUtilizationForVehicle1_1,
  ZoneWiseCapacityUtilizationForVehicle2_1_Option2,
  ZoneWiseCapacityUtilizationForVehicle2_1_Option3,
  VehicleTurningMovementWidget,
  VehicleTurningMovement1_1,
  VehicleTurningMovement2_1_Option1,
  VehicleTurningMovement2_1_Option2,
  VehicleTurningMovement2_1_Option3,
  CumulativePeopleWidget,
  CumulativePeople1_1,
  CumulativePeople2_1_Option1,
  CumulativePeople2_1_Option2,
  ShoppingQueueEventWidget,
  ShoppingQueueEvent1_1,
  ShoppingQueueEvent2_1_Option1,
  ShoppingQueueEvent2_1_Option2,
  ShoppingQueueEvent2_1_Option3,
  ForkliftQueueEventWidget,
  ForkliftQueueEvent1_1,
  ForkliftQueueEvent2_1_Option1,
  ForkliftQueueEvent2_1_Option2,
  ForkliftQueueEvent2_1_Option3,
  ZoneWisePeopleCountingWidget,
  ZoneWisePeopleCounting1_1,
  ZoneWisePeopleCounting2_1Option1,
  ZoneWisePeopleCounting2_1Option2,
  SpeedViolationbyVehicleWidget,
  SpeedViolationbyVehicle1_1,
  SpeedViolationbyVehicle2_1_Option1,
  SpeedViolationbyVehicle2_1_Option2,
  TrafficJambyDayWidget,
  TrafficJambyDay1_1,
  TrafficJambyDay2_1_Option1,
  TrafficJambyDay2_1_Option2,
  TrafficJambyDay2_1_Option3,
  CustomEditableWidgetName,
  CountingForForkliftWidget,
  CountingForForklift1_1,
  CountingForForklift2_1Option1,
  CountingForForklift2_1Option2,
  CountingForForklift2_1Option3,
  MapPlanWidget,
  MapWidgetSetup,
  FloorPlanWidget,
  FloorPlanWidgetSetup,
  ChartTicksSelector,
  CustomMapWidget,
  GoogleMapComponent,
  GoogleMapApiKey,
  SafetyMeasuresWidgets,
  SafetyMeasures1_1,
  SafetyMeasures2_1_Option1,
  SafetyMeasures2_1_Option2,
  SafetyMeasures2_1_Option3,
  AveragePeopleCountWidget,
  AveragePeopleCount1_1,
  AveragePeopleCount2_1_Option1,
  AveragePeopleCount2_1_Option2,
  AveragePeopleCount3_1_Option1,
  PeopleInOutWidget,
  PeopleInOut1_1,
  PeopleInOut2_1_Option1,
  PeopleInOut2_1_Option2,
  PeopleInOut2_1_Option3,
  NewVsTotalVisitorsWidget,
  NewVsTotalVisitors1_1,
  NewVsTotalVisitors2_1_Option1,
  NewVsTotalVisitors2_1_Option2,
  NewVsTotalVisitors2_1_Option3,
  VehicleByTypeWidget,
  VehicleByType1_1,
  VehicleByType2_1_Option1,
  VehicleByType2_1_Option2,
  VehicleByType2_1_Option3,
  AverageVehicleCountWidget,
  AverageVehicleCount1_1,
  AverageVehicleCount2_1_Option1,
  AverageVehicleCount2_1_Option2,
  AverageVehicleCount2_1_Option3,
  BlockedExitDetectionWidget,
  BlockedExitDetection1_1,
  BlockedExitDetection2_1_Option1,
  BlockedExitDetection2_1_Option2,
  BlockedExitDetection2_1_Option3,
  VehicleInOutWidget,
  VehicleInOut1_1,
  VehicleInOut2_1_Option1,
  VehicleInOut2_1_Option2,
  VehicleInOut2_1_Option3,
  StoppedVehicleCountByTypeWidget,
  StoppedVehicleCountByType1_1,
  StoppedVehicleCountByType2_1_Option1,
  StoppedVehicleCountByType2_1_Option2,
  StoppedVehicleCountByType2_1_Option3,
  PeopleQueueEventWidget,
  PeopleQueueEvent1_1,
  PeopleQueueEvent2_1_Option1,
  PeopleQueueEvent2_1_Option2,
  PeopleQueueEvent2_1_Option3,
  DetectForkliftsWidget,
  DetectForklifts1_1,
  DetectForklifts2_1_Option1,
  DetectForklifts2_1_Option2,
  DetectForklifts2_1_Option3,
  VehicleDetectionHeatmapWidget,
  VehicleDetectionHeatmap1_1,
  ForkliftHeatmapWidget,
  ForkliftHeatmap1_1,
  ShoppingcartHeatmapWidget,
  ShoppingcartHeatmap1_1,
  ForkliftSpeedDetectionWidget,
  ForkliftSpeedDetection1_1,
  ForkliftSpeedDetection2_1_Option1,
  ForkliftSpeedDetection2_1_Option2,
  ShoppingCartCountingWidget,
  ShoppingCartCounting1_1,
  ShoppingCartCounting2_1_Option1,
  ShoppingCartCounting2_1_Option2,
  ShoppingCartCounting2_1_Option3,
  LocalLoader,
  CameraStream
};
