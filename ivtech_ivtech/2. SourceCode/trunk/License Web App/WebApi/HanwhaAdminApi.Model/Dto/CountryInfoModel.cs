using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.Dto
{
    public class CountryInfoModel
    {
        public string CountryName { get; set; }
        public string CountryCode { get; set; }
        public bool HasState { get; set; }
    }
}
