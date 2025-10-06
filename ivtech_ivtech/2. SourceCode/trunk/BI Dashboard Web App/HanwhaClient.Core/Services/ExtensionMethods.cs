using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace HanwhaClient.Core.Services
{
    public static class ExtensionMethods
    {
        /// <summary>
        /// Replace plain text with *
        /// </summary>
        /// <param name="plainText">Input for mask</param>
        /// <param name="Start">Starting index of mask</param>
        /// <param name="Length">Chacter length for mask</param>
        /// <returns>return string with masking character</returns>
        public static string MaskString(this string plainText, int Start, int Length)
        {
            //MaskString("0123456789", 2, 6); Result > "01******89"
            Regex rg = new Regex("([0-9,a-z,A-Z,+])");
            if (plainText.Length >= (Start + Length) && Length > 0)
            {
                string dataforM = plainText.Substring(Start, Length);
                string Mdata = rg.Replace(dataforM, "*");
                string data1 = plainText.Substring(0, Start);
                string data2 = plainText.Substring(Start + Length);
                string final = data1 + Mdata + data2;
                return final;
            }
            else
            {
                return rg.Replace(plainText, "*");
            }
        }
    }
}
