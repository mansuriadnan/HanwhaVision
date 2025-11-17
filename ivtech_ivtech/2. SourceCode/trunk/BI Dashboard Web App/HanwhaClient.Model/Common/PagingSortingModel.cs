using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Common
{
    public class PagingSortingModel
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 100;
        public string? SortBy { get; set; }
        public int? SortOrder { get; set; }
    }
}
