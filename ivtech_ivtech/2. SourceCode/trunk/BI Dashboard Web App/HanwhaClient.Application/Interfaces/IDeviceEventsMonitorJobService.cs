using HanwhaClient.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface IDeviceEventsMonitorJobService
    {
        void StartTaskForDevice(DeviceMaster device);
        void KillAllTaskofDevice();
    }
}
