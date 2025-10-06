using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.Common
{
    public class StandardAPIResponse<T>
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }
        public Dictionary<string, object> ReferenceData { get; set; }
        public List<string> errors { get; set; }
        public int StatusCode { get; set; }

        public StandardAPIResponse(T data, bool status, string message = null, List<string> errors = null, int statusCode = 0, Dictionary<string, object> referenceData = null)
        {
            IsSuccess = status;
            this.Message = message;
            this.errors = errors;
            this.Data = data;
            this.StatusCode = statusCode;
            this.ReferenceData = referenceData;
        }

        public static StandardAPIResponse<T> SuccessResponse(T data, string message = null, int statusCode = 200, Dictionary<string, object> ReferenceData = null)
        {
            return new StandardAPIResponse<T>(data, true, message ?? "Success", null, statusCode, ReferenceData);
        }

        public static StandardAPIResponse<T> ErrorResponse(T data, string message = null, int statusCode = 0, List<string> errors = null)
        {
            return new StandardAPIResponse<T>(data, false, message ?? "Failed", errors, statusCode);
        }

    }
}
