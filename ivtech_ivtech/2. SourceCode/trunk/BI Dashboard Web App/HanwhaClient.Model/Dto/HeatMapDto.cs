namespace HanwhaClient.Model.Dto
{
    public class Resolution
    {
        public int Height { get; set; }
        public int Width { get; set; }
    }

    public class HeatmapItem
    {
        public int Channel { get; set; }
        public int Descriptor { get; set; }
        public List<int> Level { get; set; }
        public Resolution Resolution { get; set; }
    }

    public class HeatmapRoot
    {
        public List<HeatmapItem> Heatmap { get; set; }
    }

    public class HeatmapConfiguration
    {
        public int AutoReference { get; set; }
        public string BackgroundColorMode { get; set; }
        public int Channel { get; set; }
        public bool Enable { get; set; }
        public bool EnableManualReferenceMode { get; set; }
        public List<object> ExcludeAreas { get; set; }
        public int ManualReference { get; set; }
    }

    public class WiseAiHeatmapConfigRoot
    {
        public List<HeatmapConfiguration> HeatmapConfigurations { get; set; }
    }

    public class SunapiHeatMapConfigRoot
    {
        public List<SunapiHeatMapConfi> HeatMap { get; set; }
    }

    public class SunapiHeatMapConfi
    {
        public int Channel { get; set; }
        public bool Enable { get; set; }
        public bool ReportEnable { get; set; }
        public string ReportFilename { get; set; }
        public string ReportFileType { get; set; }
        public int BackgroundColourLevel { get; set; }
        public bool ManualModeEnable { get; set; }
        public int ManualReference { get; set; }
        public int AutoReference { get; set; }
        
    }

    public class SunapiHeatMapLevelRoot
    {
        public List<SunapiHeatMapLevel> HeatMap { get; set; }
    }

    public class SunapiHeatMapLevel
    {
        public int Channel { get; set; }
        public List<int> Level { get; set; }
        public int Descriptor { get; set; }
        public string Resolution { get; set; }
    }
}
