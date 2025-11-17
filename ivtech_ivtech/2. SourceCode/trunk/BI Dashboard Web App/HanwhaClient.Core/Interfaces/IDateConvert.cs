using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Core.Interfaces
{
    public interface IDateConvert
    {
        TimeSpan GetTimeSpanByOffset(string utcOffset);
    }
}
