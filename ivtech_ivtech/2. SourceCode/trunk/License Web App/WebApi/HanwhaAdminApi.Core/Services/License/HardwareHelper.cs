using System.Management;

namespace HanwhaAdminApi.Core.Services.License
{
    public interface IHardwareHelper
    {
    }

    public class HardwareHelper : IHardwareHelper
    {
        public static string GetHardwareId()
        {
            string cpuId = GetCpuId();
            string macAddress = GetMacAddress();
            return $"{cpuId}-{macAddress}";
        }

        private static string GetCpuId()
        {
            string cpuId = "";
            ManagementClass management = new ManagementClass("Win32_Processor");
            foreach (ManagementObject obj in management.GetInstances())
            {
                cpuId = obj.Properties["ProcessorId"].Value.ToString();
                break;
            }
            return cpuId;
        }

        private static string GetMacAddress()
        {
            string macAddress = "";
            ManagementClass management = new ManagementClass("Win32_NetworkAdapterConfiguration");
            foreach (ManagementObject obj in management.GetInstances())
            {
                if ((bool)obj["IPEnabled"])
                {
                    macAddress = obj["MACAddress"].ToString();
                    break;
                }
            }
            return macAddress;
        }
    }
}
