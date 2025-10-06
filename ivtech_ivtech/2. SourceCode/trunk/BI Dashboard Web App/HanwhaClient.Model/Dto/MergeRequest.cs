using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class MergeRequest
    {
        public string FileName { get; set; }
        public int TotalChunks { get; set; }
    }
}
