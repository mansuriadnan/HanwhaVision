using HanwhaClient.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IPermissionRepository : IRepositoryBase<Permission>
    {
        //Task<Role> Ge(string username);
    }
}
