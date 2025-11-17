using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HanwhaClient.Core.Interfaces;

namespace HanwhaClient.Core.Services
{
    public class Base64Generator : IBase64Generator
    {
        public string ConvertImageToBase64String(string imagePath)
        {
            if (!File.Exists(imagePath))
                throw new FileNotFoundException("Image not found", imagePath);
            var ext = Path.GetExtension(imagePath).ToLower();
            var mime = ext switch
            {
                ".png" => "image/png",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".svg" => "image/svg+xml",
                ".gif" => "image/gif",
                _ => throw new NotSupportedException("Unsupported image type")
            };
            var bytes = File.ReadAllBytes(imagePath);
            var base64 = Convert.ToBase64String(bytes);
            return $"data:{mime};base64,{base64}";

        }
        
    }
}
