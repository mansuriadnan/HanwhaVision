using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Core.Interfaces
{
    public interface IExcelGenerator
    {
        public byte[] ConvertDatatoExcel(dynamic Data);
    }
}
