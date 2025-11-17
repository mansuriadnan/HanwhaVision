using HanwhaClient.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Core.Services
{
    public class DateConvert : IDateConvert
    {
        public TimeSpan GetTimeSpanByOffset(string utcOffset)
        {
            TimeSpan offset = TimeSpan.Zero;

            if (string.IsNullOrEmpty(utcOffset))
                throw new ArgumentException("UTC offset cannot be null or empty.", nameof(utcOffset));


            if (utcOffset.StartsWith("+"))
            {
                utcOffset = utcOffset.Substring(1);
            }

            // Parse the UTC offset
            if (!TimeSpan.TryParse(utcOffset, out offset))
                throw new ArgumentException("Invalid UTC offset format. Use '+HH:mm' or '-HH:mm'.", nameof(utcOffset));

            return offset;
        }
    }
}
