using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.DbEntities
{
    public class Otp : BaseModel
    {

        [BsonElement("email")]
        public string Email { get; set; }

        [BsonElement("otpCode")]
        public string OtpCode { get; set; }

        [BsonElement("expiredOn")]
        public DateTime ExpiredOn { get; set; }

        [BsonElement("isUtilized")]
        public bool IsUtilized { get; set; }
    }
}
