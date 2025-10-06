using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.Dto.Role
{
    public class RoleScreenMappingRequestDto
    {
        public string Id { get; set; }
        public string roleId { get; set; }
        public string ScreenId { get; set; }
        public bool AccessAllowed { get; set; }
    }
}
