using HanwhaClient.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Services.Migrations.Migratation
{
    public static class TimeZoneList
    {
        public static List<ClientTimezones> GetAllTimeZones()
        {
            return new List<ClientTimezones>
                       {
                           new() { Name = "Brazil", TimeZoneName = "Brazil Standard Time", TimeZoneAbbr = "BRT", UtcOffset = "-03:00" },
                           new() { Name = "UAE", TimeZoneName = "Gulf Standard Time", TimeZoneAbbr = "GST", UtcOffset = "+04:00" },
                           new() { Name = "Qatar", TimeZoneName = "Arabian Standard Time", TimeZoneAbbr = "AST", UtcOffset = "+03:00" },
                           new() { Name = "India", TimeZoneName = "India Standard Time", TimeZoneAbbr = "IST", UtcOffset = "+05:30" },
                           new() { Name = "Thailand", TimeZoneName = "Indochina Time", TimeZoneAbbr = "ICT", UtcOffset = "+07:00" },
                           new() { Name = "South Africa", TimeZoneName = "South Africa Standard Time", TimeZoneAbbr = "SAST", UtcOffset = "+02:00" },
                           new() { Name = "Tunisia", TimeZoneName = "Central European Time", TimeZoneAbbr = "CET", UtcOffset = "+01:00" },
                           new() { Name = "Algeria", TimeZoneName = "Central European Time", TimeZoneAbbr = "CET", UtcOffset = "+01:00" },
                           new() { Name = "Iraq", TimeZoneName = "Arabian Standard Time", TimeZoneAbbr = "AST", UtcOffset = "+03:00" },
                           new() { Name = "China", TimeZoneName = "China Standard Time", TimeZoneAbbr = "CST", UtcOffset = "+08:00" },
                           new() { Name = "Kenya", TimeZoneName = "East Africa Time", TimeZoneAbbr = "EAT", UtcOffset = "+03:00" },
                           new() { Name = "Argentina", TimeZoneName = "Argentina Time", TimeZoneAbbr = "ART", UtcOffset = "-03:00" },
                           new() { Name = "Kuwait", TimeZoneName = "Arabian Standard Time", TimeZoneAbbr = "AST", UtcOffset = "+03:00" },
                           new() { Name = "France", TimeZoneName = "Central European Time", TimeZoneAbbr = "CET", UtcOffset = "+01:00" },
                           new() { Name = "KSA", TimeZoneName = "Arabian Standard Time", TimeZoneAbbr = "AST", UtcOffset = "+03:00" },
                           new() { Name = "Singapore", TimeZoneName = "Singapore Standard Time", TimeZoneAbbr = "SGT", UtcOffset = "+08:00" },
                           new() { Name = "Mexico", TimeZoneName = "Central Standard Time", TimeZoneAbbr = "CST", UtcOffset = "-06:00" },
                           new() { Name = "Egypt", TimeZoneName = "Eastern European Time", TimeZoneAbbr = "EET", UtcOffset = "+02:00" },
                           new() { Name = "United Kingdom", TimeZoneName = "Greenwich Mean Time", TimeZoneAbbr = "GMT", UtcOffset = "+00:00" },
                           new() { Name = "Canada", TimeZoneName = "Eastern Time (US & Canada)", TimeZoneAbbr = "EST", UtcOffset = "-05:00" },
                           new() { Name = "Bahrain", TimeZoneName = "Arabian Standard Time", TimeZoneAbbr = "AST", UtcOffset = "+03:00" },
                           new() { Name = "Australia", TimeZoneName = "Australian Eastern Standard Time", TimeZoneAbbr = "AEST", UtcOffset = "+10:00" },
                           new() { Name = "Germany", TimeZoneName = "Central European Time", TimeZoneAbbr = "CET", UtcOffset = "+01:00" },
                           new() { Name = "Japan", TimeZoneName = "Japan Standard Time", TimeZoneAbbr = "JST", UtcOffset = "+09:00" },
                           new() { Name = "South Korea", TimeZoneName = "Korea Standard Time", TimeZoneAbbr = "KST", UtcOffset = "+09:00" },
                           new() { Name = "Morocco", TimeZoneName = "Western European Time", TimeZoneAbbr = "WET", UtcOffset = "+00:00" },
                           new() { Name = "USA", TimeZoneName = "Eastern Time (US & Canada)", TimeZoneAbbr = "EST", UtcOffset = "-05:00" },
                           new() { Name = "Oman", TimeZoneName = "Gulf Standard Time", TimeZoneAbbr = "GST", UtcOffset = "+04:00" },
                           new() { Name = "Libya", TimeZoneName = "Eastern European Time", TimeZoneAbbr = "EET", UtcOffset = "+02:00" },
                           new() { Name = "Indonesia", TimeZoneName = "Western Indonesian Time", TimeZoneAbbr = "WIB", UtcOffset = "+07:00" }
                       };
        }

    }
}
