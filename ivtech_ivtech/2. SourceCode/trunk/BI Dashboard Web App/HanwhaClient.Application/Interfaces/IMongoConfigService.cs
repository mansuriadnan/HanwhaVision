using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface IMongoConfigService
    {
        string BackupDatabase(List<string> collections = null);

        (bool IsSuccess, string Error) RestoreDatabase(string backupPath, List<string> collections = null);
    }

}
