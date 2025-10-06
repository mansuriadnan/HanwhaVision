using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Core.Interfaces
{
    public interface ICsvGenerator
    {
        public string ConvertJsonToCsv(string json);
    }
}
