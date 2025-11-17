import { AveragePeopleCountWidget } from "../AveragePeopleCount/AveragePeopleCountWidget";
import { AverageVehicleCountWidget } from "../AverageVehicleCount/AverageVehicleCountWidget";
import { BlockedExitDetectionWidget } from "../BlockedExitDetection/BlockedExitDetectionWidget";
import { CameraOnlineOfflineWidget } from "../CameraOnlineOffline/CameraOnlineOfflineWidget";
import { CameraByFeatureWidget } from "../CametaByfeature/CameraByFeatureWidget";
import { CapacityUtilizationForPeopleWidget } from "../CapacityUtilizationForPeople/CapacityUtilizationForPeopleWidget";
import { CapacityUtilizationForVehicleWidget } from "../CapacityUtilizationforVehicle/CapacityUtilizationForVehicleWidget";
import { CountingForForkliftWidget } from "../CountingForForklift/CountingForForkliftWidget";
import { CumulativePeopleWidget } from "../CumulativePeople/CumulativePeopleWidget";
import { DetectForkliftsWidget } from "../DetectForklifts/DetectForkliftsWidget";
import { FloorPlanWidget } from "../FloorPlan/FloorPlanWidget";
import { ForkliftHeatmapWidget } from "../ForkliftHeatmap/ForkliftHeatmapWidget";
import { ForkliftQueueEventWidget } from "../ForkliftQueueEvent/ForkliftQueueEventWidget";
import { ForkliftSpeedDetectionWidget } from "../ForkliftSpeedDetection/ForkliftSpeedDetectionWidget";
import { GenderWidget } from "../Gender/GenderWidget";
import { MapPlanWidget } from "../MapPlan/MapPlanWidget";
import { ModaltypesWidget } from "../ModalTypes/ModaltypesWidget";
import { NewVsTotalVisitorsWidget } from "../NewVsTotalVisitors/NewVsTotalVisitorsWidget";
import { PedestrianDetectionWidget } from "../PedestrianDetection/PedestrianDetectionWidget";
import { PeopleCountingHeatmapWidget } from "../PeopleCountingHeatmap/PeopleCountingHeatmapWidget";
import { PeopleInOutWidget } from "../PeopleInOut/PeopleInOutWidget";
import { PeopleQueueEventWidget } from "../PeopleQueueEvent/PeopleQueueEventWidget";
import { SafetyMeasuresWidgets } from "../SafetyMeasures/SafetyMeasuresWidgets";
import { ShoppingCartCountingWidget } from "../ShoppingCartCounting/ShoppingCartCountingWidget";
import { ShoppingcartHeatmapWidget } from "../ShoppingcartHeatmap/ShoppingcartHeatmapWidget";
import { ShoppingQueueEventWidget } from "../ShoppingQueueEvent/ShoppingQueueEventWidget";
import { SlipAndFallDetectionWidget } from "../SlipAndFallDetection/SlipAndFallDetectionWidget";
import { SpeedViolationbyVehicleWidget } from "../SpeedViolationbyVehicle/SpeedViolationbyVehicleWidget";
import { StoppedVehicleCountByTypeWidget } from "../StoppedVehicleCountByType/StoppedVehicleCountByTypeWidget";
import { TrafficJambyDayWidget } from "../TrafficJambyDay/TrafficJambyDayWidget";
import { VehicleByTypeWidget } from "../VehicleByType/VehicleByTypeWidget";
import { VehicleDetectionHeatmapWidget } from "../VehicleDetectionHeapmap/VehicleDetectionHeatmapWidget";
import { VehicleInOutWidget } from "../VehicleInOut/VehicleInOutWidget";
import { VehicleInWrongDirectionWidget } from "../VehicleInWrongDirection/VehicleInWrongDirectionWidget";
import { VehicleQueueAnalysisWidget } from "../VehicleQueueAnalysis/VehicleQueueAnalysisWidget";
import { VehicleTurningMovementWidget } from "../VehicleTurningMovement/VehicleTurningMovementWidget";
import { VehicleUTurnWidget } from "../VehicleUTurn/VehicleUTurnWidget";
import { ZoneWiseCapacityUtilizationForPeopleWidget } from "../ZoneWiseCapacityUtilizationForPeople/ZoneWiseCapacityUtilizationForPeopleWidget";
import { ZoneWiseCapacityUtilizationForVehicleWidget } from "../ZoneWiseCapacityUtilizationForVehicle/ZoneWiseCapacityUtilizationForVehicleWidget";
import { ZoneWisePeopleCountingWidget } from "../ZoneWisePeopleCounting/ZoneWisePeopleCountingWidget";


export const WidgetComponentMap: {
  [key: string]: React.FC<any>;
} = {
  "Capacity Utilization for People": CapacityUtilizationForPeopleWidget,
  "Capacity Utilization for Vehicle": CapacityUtilizationForVehicleWidget,
  "Zone Wise Capacity Utilization for People": ZoneWiseCapacityUtilizationForPeopleWidget,
  "Zone Wise Capacity Utilization for Vehicle": ZoneWiseCapacityUtilizationForVehicleWidget,
  "Zone wise People Counting": ZoneWisePeopleCountingWidget,
  "Model Types": ModaltypesWidget,
  "Feature Types": CameraByFeatureWidget,
  "Camera Online/Offline": CameraOnlineOfflineWidget,
  "Vehicle Queue Analysis": VehicleQueueAnalysisWidget,
  "Vehicle by Type": VehicleByTypeWidget,
  "New vs Total Visitors": NewVsTotalVisitorsWidget,
  "Average People Counting": AveragePeopleCountWidget,
  "Average Vehicle Counting": AverageVehicleCountWidget,
  "Blocked exit detection": BlockedExitDetectionWidget,
  "Factory Blocked exit detection": BlockedExitDetectionWidget,
  "Stopped Vehicle Count Time": StoppedVehicleCountByTypeWidget,
  "Queue events for people": PeopleQueueEventWidget,
  "Detect Forklifts": DetectForkliftsWidget,
  "Safety Measures": SafetyMeasuresWidgets,
  "Vehicle Detection Heatmap": VehicleDetectionHeatmapWidget,
  "Forklift Heatmap": ForkliftHeatmapWidget,
  "Shopping Cart Heatmap": ShoppingcartHeatmapWidget,
  "People Counting Heatmap": PeopleCountingHeatmapWidget,
  "Gender": GenderWidget,
  "People": PeopleInOutWidget,
  "Cumulative People Count": CumulativePeopleWidget,
  "Pedestrian Detection": PedestrianDetectionWidget,
  "Slip & Fall Detection": SlipAndFallDetectionWidget,
  "Vehicle in Wrong Direction": VehicleInWrongDirectionWidget,
  "Vehicle U Turn detection": VehicleUTurnWidget,
  "Vehicle Turning Movement counts": VehicleTurningMovementWidget,
  "Queue events for shopping cart": ShoppingQueueEventWidget,
  "Queue events for forklift": ForkliftQueueEventWidget,
  "Speed Violation by Vehicle": SpeedViolationbyVehicleWidget,
  "Traffic Jam by Day": TrafficJambyDayWidget,
  "Vehicle": VehicleInOutWidget,
  "Counting for forklift": CountingForForkliftWidget,
  "Map Plan": MapPlanWidget,
  "Floor Plan": FloorPlanWidget,
  "Forklift Speed Detection": ForkliftSpeedDetectionWidget,
  "Shopping Cart Counting": ShoppingCartCountingWidget,
};
