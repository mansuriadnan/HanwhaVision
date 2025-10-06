namespace HanwhaClient.Model.Common
{
    public static class SunapiAPIConstant
    {
        /// <summary>
        /// Get the basic device information
        /// </summary>
        public const string DeviceInfo = "/stw-cgi/system.cgi?msubmenu=deviceinfo&action=view";

        /// <summary>
        /// Check the status of events
        /// </summary>
        public const string EventStatus = "/stw-cgi/eventstatus.cgi?msubmenu=eventstatus&action=check";

        /// <summary>
        /// View the count of people detected
        /// </summary>
        public const string PeopleCountView = "/stw-cgi/eventsources.cgi?msubmenu=peoplecount&action=view";

        /// <summary>
        /// Check the count of people detected
        /// </summary>
        public const string PeopleCountCheck = "/stw-cgi/eventsources.cgi?msubmenu=peoplecount&action=check";

        /// <summary>
        /// Configure object counting for a specific channel
        /// </summary>
        public const string ChannelWiseAPI = "/opensdk/WiseAI/configuration/objectcounting?channel=#channelnumber#";

        /// <summary>
        /// Check the count of vehicles detected, including AI statistics
        /// </summary>
        public const string VehicleCountCheckSunapi = "/stw-cgi/eventsources.cgi?msubmenu=vehiclecount&action=check&ShowAIStats=True";

        /// <summary>
        /// View the count of vehicles detected
        /// </summary>
        public const string VehicleCount = "/stw-cgi/eventsources.cgi?msubmenu=vehiclecount&action=view";

        /// <summary>
        /// View the available event source options
        /// </summary>
        public const string EventSources = "/stw-cgi/eventsources.cgi?msubmenu=sourceoptions&action=view";

        /// <summary>
        /// View running event of camera
        /// </summary>
        public const string EventTrack = "/stw-cgi/eventstatus.cgi?msubmenu=eventstatus&action=monitordiff";

        /// <summary>
        /// Reset all counting of the device
        /// </summary>
        public const string ResetDeviceCount = "/stw-cgi/system.cgi?msubmenu=databasereset&action=control&IncludeDataType=All";

        /// <summary>
        /// Get People Heatmap 
        /// </summary>
        public const string PeopleHeatmap = "/stw-cgi/eventsources.cgi?msubmenu=heatmap&action=check&IncludeDataType=All";

        /// <summary>
        /// Get People Heatmap 
        /// </summary>
        public const string PeopleHeatmapConfiguration = "/stw-cgi/eventsources.cgi?msubmenu=heatmap&action=view";

        /// <summary>
        /// Get image for heatmap 
        /// </summary>
        public const string HeatmapImage = "/stw-cgi/video.cgi?msubmenu=snapshot&action=view";


    }
}
