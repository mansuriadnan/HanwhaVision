using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class FinalizeUploadRequest
    {
        public string UploadId { get; set; }
        public string FileName { get; set; }
    }
}
