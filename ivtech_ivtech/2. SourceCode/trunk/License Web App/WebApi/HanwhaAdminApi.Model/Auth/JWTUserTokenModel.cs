using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.Auth
{
    public class JWTUserTokenModel
    {
        public string Id { get; set; } = null!;
        public string Username { get; set; } = null!;
        public List<string> RoleId { get; set; } = null!;
        public List<string> RoleName { get; set; } = null!;
        //public string RoleName { get; set; } = null!;
    }
}
