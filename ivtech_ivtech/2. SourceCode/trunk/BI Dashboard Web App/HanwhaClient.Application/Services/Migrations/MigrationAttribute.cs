using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Services.Migrations
{
    [AttributeUsage(AttributeTargets.Class, Inherited = false, AllowMultiple = false)]
    public class MigrationAttribute : Attribute
    {
        public long Version { get; }
        public string Description { get; }

        public MigrationAttribute(long version, string description)
        {
            Version = version;
            Description = description;
        }
    }
}
