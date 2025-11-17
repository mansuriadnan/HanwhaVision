using HanwhaClient.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface IScreenMasterService
    {
        Task<IEnumerable<ScreenMaster>> GetAllScreenMasters();
        Task<IEnumerable<WidgetMaster>> GetAllWidgetMasters();
    }
}
