using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.Dto
{
    public class CountryStateCityHierarchy
    {
        public Dictionary<string, Dictionary<string, List<string>>> CountryStateCities { get; set; } = new();
        public Dictionary<string, List<string>> CountryOnlyCities { get; set; } = new();
    }
}
