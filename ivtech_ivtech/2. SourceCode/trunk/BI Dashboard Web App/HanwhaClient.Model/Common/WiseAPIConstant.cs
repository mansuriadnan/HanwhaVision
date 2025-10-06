namespace HanwhaClient.Model.Common
{
    public class WiseAPIConstant
    {
        public const string ChannelWiseAPI = "/opensdk/WiseAI/configuration/objectcounting?channel=#channelnumber#";
        public const string PeopleCountCheck = "/opensdk/WiseAI/search/objectcounting/check?channel=";
        public const string ConfigurationCapability = "/opensdk/WiseAI/configuration/capability";
        /// <summary>
        /// View running event of camera
        /// </summary>
        public const string EventTrack = "/stw-cgi/eventstatus.cgi?msubmenu=eventstatus&action=monitordiff&SchemaBased=True";
        /// <summary>
        /// Get data of vehicle lane count
        /// </summary>
        public const string MultiLaneVehicleCount = "/opensdk/WiseAI/search/multilanevehiclecounting/check?channel=";
        /// <summary>
        /// Get data of vehicle lane names
        /// </summary>
        public const string MultiLaneVehicleConfiguration = "/opensdk/WiseAI/configuration/multilanevehiclecounting?channel=";
        /// <summary>
        /// Get data of Shopping cart heat map
        /// </summary>
        public const string ShoppingCartHeatMap = "/opensdk/WiseAI/search/shoppingcartheatmap/check?channel=";

        /// <summary>
        /// Get data of Configuration of Shopping heat map
        /// </summary>
        public const string ShoppingCartHeatMapConfiguration = "/opensdk/WiseAI/configuration/shoppingcartheatmap?channel=";

        /// <summary>
        /// Get data of People heat map
        /// </summary>
        public const string PeopleHeatMap = "/opensdk/WiseAI/search/heatmap/check?channel=";

        /// <summary>
        /// Get data of Configuration of People heat map
        /// </summary>
        public const string PeopleHeatMapConfiguration = "/opensdk/WiseAI/configuration/heatmap?channel=";

        /// <summary>
        /// Get data of Configuration of vehicle heat map
        /// </summary>
        public const string VehicleHeatMapConfiguration = "/opensdk/WiseAI/configuration/vehicleheatmap?channel=";

        /// <summary>
        /// Get data of vehicle heat map
        /// </summary>
        public const string VehicleHeatMap = "/opensdk/WiseAI/search/vehicleheatmap/check?channel=";

        /// <summary>
        /// Get data of Configuration of Forklift heat map
        /// </summary>
        public const string ForkliftHeatMapConfiguration = "/opensdk/WiseAI/configuration/forkliftheatmap?channel=";

        /// <summary>
        /// Get data of forklift heat map
        /// </summary>
        public const string ForkliftHeatMap = "/opensdk/WiseAI/search/forkliftheatmap/check?channel=";

        /// <summary>
        /// Reset the forklift heat map
        /// </summary>
        public const string ResetForkliftHeatMap = "/configuration/forkliftheatmap/data?channel=";

        /// <summary>
        /// Reset the shopping cart heat map
        /// </summary>
        public const string ResetShoppingCartHeatMap = "/configuration/shoppingcartheatmap/data?channel=";

        /// <summary>
        /// Reset the vehicle heat map
        /// </summary>
        public const string ResetVehicleHeatMap = "/configuration/vehicleheatmap/data?channel=";

        /// <summary>
        /// Reset the Object Couting this reset people, vehicle, shopping cart and forklift
        /// </summary>
        public const string ResetObjectCouting = "/opensdk/WiseAI/configuration/objectcounting/data?channel=";


    }
}
