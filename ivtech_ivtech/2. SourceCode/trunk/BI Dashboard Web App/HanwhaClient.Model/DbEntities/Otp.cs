using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.DbEntities
{
    public class Otp : BaseModel
    {

        [BsonElement("Email")]
        public string Email { get; set; }

        [BsonElement("OtpCode")]
        public string OtpCode { get; set; }

        [BsonElement("expiredOn")]
        public DateTime ExpiredOn { get; set; }

        [BsonElement("isUtilized")]
        public bool IsUtilized { get; set; }
    }
}
