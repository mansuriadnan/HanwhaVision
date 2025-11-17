using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class RoleScreenResponseDto
    {
        public string Id { get; set; }
        public string ScreenId { get; set; }
        public string ScreenName { get; set; }
        public bool AccessAllowed { get; set; }
        public bool IsParent { get; set; }
    }
}
