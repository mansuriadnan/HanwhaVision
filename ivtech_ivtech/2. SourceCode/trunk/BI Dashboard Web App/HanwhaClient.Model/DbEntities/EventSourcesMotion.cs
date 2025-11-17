using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.DbEntities
{
    public class EventSourcesMotion
    {
        [BsonElement("eventSource")]
        public string? EventSource { get; set; }

        [BsonElement("eventAction")]
        public List<string>? EventAction { get; set; }

        [BsonElement("minimumObjectSize")]
        public ObjectSize? MinimumObjectSize { get; set; }

        [BsonElement("maximumObjectSize")]
        public ObjectSize? MaximumObjectSize { get; set; }

        [BsonElement("minimumObjectSizeInPixels")]
        public ObjectSize? MinimumObjectSizeInPixels { get; set; }

        [BsonElement("maximumObjectSizeInPixels")]
        public ObjectSize? MaximumObjectSizeInPixels { get; set; }

        [BsonElement("roiIncludeMinIndex")]
        public int? ROIIncludeMinIndex { get; set; }

        [BsonElement("roiIncludeMaxIndex")]
        public int? ROIIncludeMaxIndex { get; set; }

        [BsonElement("roiExcludeMinIndex")]
        public int? ROIExcludeMinIndex { get; set; }

        [BsonElement("roiExcludeMaxIndex")]
        public int? ROIExcludeMaxIndex { get; set; }

        [BsonElement("objectTypeFilter")]
        public List<string>? ObjectTypeFilter { get; set; }

        [BsonElement("definedAreaIncludeMinIndex")]
        public int? DefinedAreaIncludeMinIndex { get; set; }

        [BsonElement("definedAreaIncludeMaxIndex")]
        public int? DefinedAreaIncludeMaxIndex { get; set; }

        [BsonElement("definedAreaExcludeMinIndex")]
        public int? DefinedAreaExcludeMinIndex { get; set; }

        [BsonElement("definedAreaExcludeMaxIndex")]
        public int? DefinedAreaExcludeMaxIndex { get; set; }

        [BsonElement("objectTypeFilterDetails")]
        public ObjectTypeFilterDetails ObjectTypeFilterDetails { get; set; }

        [BsonElement("excludeAreaMinIndex")]
        public int? ExcludeAreaMinIndex { get; set; }

        [BsonElement("excludeAreaMaxIndex")]
        public int? ExcludeAreaMaxIndex { get; set; }

        [BsonElement("objectTypes")]
        public List<string>? ObjectTypes { get; set; }

        [BsonElement("objectTypeDetails")]
        public ObjectTypeDetails? ObjectTypeDetails { get; set; }
    }

    public class ObjectSize
    {
        [BsonElement("width")]
        public int Width { get; set; }

        [BsonElement("height")]
        public int Height { get; set; }
    }

    public class ObjectTypeFilterDetails
    {
        [BsonElement("vehicle")]
        public Vehicle Vehicle { get; set; }
    }

    public class Vehicle
    {
        [BsonElement("types")]
        public List<string> Types { get; set; }
    }

    public class ObjectTypeDetails
    {
        [BsonElement("vehicle")]
        public Vehicle Vehicle { get; set; }
    }

    public class EventSources
    {
        [BsonElement("eventSources")]
        public List<EventSourcesMotion> EventSourcesList { get; set; }
    }
}
