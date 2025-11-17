using CsvHelper.Configuration;
using CsvHelper;
using HanwhaClient.Core.Interfaces;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Core.Services
{
    public class CsvGeneratorService : ICsvGenerator
    {
        public string ConvertJsonToCsv(string json)
        {
            var jsonData = JArray.Parse(json);
            var columns = jsonData
                .SelectMany(obj => obj.Children<JProperty>())
                .Select(prop => prop.Name)
                .Distinct()
                .ToList();

            using (var writer = new StringWriter())
            using (var csv = new CsvWriter(writer, new CsvConfiguration(CultureInfo.InvariantCulture)))
            {
                foreach (var column in columns)
                {
                    csv.WriteField(column);
                }
                csv.NextRecord();

                foreach (var obj in jsonData)
                {
                    foreach (var column in columns)
                    {
                        csv.WriteField(obj[column]?.ToString() ?? string.Empty);
                    }
                    csv.NextRecord();
                }
                
                return writer.ToString();
            }
        }
    }
}
