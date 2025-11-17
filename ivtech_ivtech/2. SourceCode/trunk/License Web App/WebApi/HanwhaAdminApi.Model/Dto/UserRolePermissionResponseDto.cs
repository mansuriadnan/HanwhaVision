using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.Dto
{
    public class UserRolePermissionResponseDto
    {
        public string Id { get; set; }
        public bool IsActive { get; set; }
        public string? ParentsScreenId { get; set; }
        public string? ScreenName { get; set; }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType())
                return false;

            var other = (UserRolePermissionResponseDto)obj;
            return Id == other.Id && ScreenName == other.ScreenName;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id, ScreenName);
        }
    }
}
