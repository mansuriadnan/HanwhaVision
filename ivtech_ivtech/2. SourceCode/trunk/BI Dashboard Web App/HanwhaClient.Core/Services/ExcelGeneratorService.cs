using ClosedXML.Excel;
using HanwhaClient.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Core.Services
{
    public class ExcelGeneratorService : IExcelGenerator
    {
        public byte[] ConvertDatatoExcel(dynamic Data)
        {
            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Sheet1");
                var rows = (IEnumerable<dynamic>)Data;

                if (rows.Any())
                {
                    var firstRow = rows.First();
                    var headers = firstRow.GetType().GetProperties();

                    int colIndex = 1;
                    foreach (var header in headers) { 
                        worksheet.Cell(1,colIndex).Value = header.Name;
                        colIndex++;
                    }

                    int rowIndex = 2;
                    foreach (var row in Data)
                    {
                        colIndex = 1;
                        foreach (var property in headers)
                        {
                            worksheet.Cell(rowIndex, colIndex).Value = property.GetValue(row) != null ? property.GetValue(row).ToString() : "";
                            colIndex++;
                        }
                        rowIndex++;
                    }
                    worksheet.Columns().AdjustToContents();
                }
                
                var stream = new MemoryStream();
                workbook.SaveAs(stream);
                stream.Position = 0;

                return stream.ToArray();
            }
        }
    }
}
