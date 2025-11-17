using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Common
{
    public class MongoSettings
    {
        public string? ConnectionString { get; set; }
        public string? DatabaseName { get; set; }
        public string? EncryptionKey { get; set; }
        public string? MongoDumpPath { get; set; }
        public string? MongoRestorePath { get; set; }
    }

}
