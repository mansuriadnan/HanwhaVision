using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.Dto
{
    public class CustomerResponseDto
    {
        public string Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;

        public string ContactPersonName { get; set; } = string.Empty;

        public string OfficePhone { get; set; } = string.Empty;

        public string ContactPersonMobile { get; set; } = string.Empty;

        public string EmailAddress { get; set; } = string.Empty;

        public DateTime? CreatedOn { get; set; }
        public string? CreatedBy { get; set; } = string.Empty;
        public DateTime? UpdatedOn { get; set; }
        public string? UpdatedBy { get; set; } = string.Empty;
        public string DistributorId { get; set; } = string.Empty;
        public string CountryId { get; set; } = string.Empty;
        public string StateId { get; set; } = string.Empty;
        public string CityId { get; set; } = string.Empty;
        public string Address { get; set; }
        public string CustomerNo { get; set; }
        public string PostalCode { get; set; }
    }
}
