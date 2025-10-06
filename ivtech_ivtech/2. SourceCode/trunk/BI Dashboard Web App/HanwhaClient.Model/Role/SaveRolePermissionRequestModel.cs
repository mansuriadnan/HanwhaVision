using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Role
{
    public class SaveRolePermissionRequestModel
    {
        public string Id { get; set; }
        public List<string> PermissionIds { get; set; } = new List<string>();
    }
}
