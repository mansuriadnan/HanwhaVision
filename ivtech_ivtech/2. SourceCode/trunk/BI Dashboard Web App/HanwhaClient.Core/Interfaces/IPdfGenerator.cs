using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HanwhaClient.Model.Dto;

namespace HanwhaClient.Core.Interfaces
{
    public interface IPdfGenerator
    {
        Task<byte[]> GeneratePdfFromHtml(PdfGenerationOptions options);
    }
}
