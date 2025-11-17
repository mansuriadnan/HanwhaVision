using HanwhaClient.Core.Interfaces;
using DinkToPdf;
using DinkToPdf.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.Packaging;
using Microsoft.Extensions.Options;
using HanwhaClient.Model.Dto;

namespace HanwhaClient.Core.Services
{
    public class PdfGeneratorService : IPdfGenerator
    {
        private readonly IConverter _converter;
        public PdfGeneratorService(IConverter converter)
        {
            _converter = converter ?? throw new ArgumentNullException(nameof(converter));
        }

        public async Task<byte[]> GeneratePdfFromHtml(PdfGenerationOptions options)
        {
            if (string.IsNullOrWhiteSpace(options.HtmlContent))
                throw new ArgumentException("HTML content cannot be null or empty.", nameof(options.HtmlContent));

            var pdfDoc = new HtmlToPdfDocument
            {
                GlobalSettings = new GlobalSettings
                {
                    ColorMode = ColorMode.Color,
                    Orientation = Orientation.Portrait,
                    PaperSize = PaperKind.A4,
                    Margins = new MarginSettings
                    {
                        Top = 20,
                        Bottom = 20 
                    },

                },
                Objects = {
                    new ObjectSettings()
                    {
                        HtmlContent = options.HtmlContent,
                        HeaderSettings = new HeaderSettings
                        {
                            HtmUrl = string.IsNullOrWhiteSpace(options.HeaderHtmlPath) ? null :
                                  $"file:///{options.HeaderHtmlPath.Replace("\\", "/")}",
                            Spacing = 5
                        },
                        //FooterSettings = new FooterSettings
                        //{
                        //    HtmUrl = string.IsNullOrWhiteSpace(options.FooterHtmlPath) ? null :
                        //          $"file:///{Path.GetFullPath(options.FooterHtmlPath).Replace("\\", "/")}",
                        //    Spacing = 5,
                        //    ReplaceSymbols = true
                        //}
                        FooterSettings = new FooterSettings
                        {
                            Right = "Page [page] of [topage]",
                            FontSize = 9,
                            Line = true,                          
                            Spacing = 5
                        },
                        WebSettings = new WebSettings
                        {
                            LoadImages = true,
                            EnableIntelligentShrinking = true,
                            PrintMediaType = true,                            
                        }
                    }
                }
            };

            return _converter.Convert(pdfDoc);
        }
    }
}
