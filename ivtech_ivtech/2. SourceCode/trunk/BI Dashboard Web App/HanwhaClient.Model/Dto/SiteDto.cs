using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class SiteDto
    {
        public string? Id { get; set; }
        public string? SiteName { get; set; }
        public string? HostingAddress { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? UpdatedOn { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsParent { get; set; } = true;
        public List<ChildSiteDto>? ChildSites { get; set; } = new List<ChildSiteDto>();
    }

    public class ChildSiteDto
    {
        public string? parentSiteId { get; set; }
        public string? Id { get; set; }
        public string? SiteName { get; set; }
        public string? HostingAddress { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? UpdatedOn { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsParent { get; set; } = false;
    }

    public class SiteChileRequestDto
    {
        public string? Id { get; set; }
        public string? SiteName { get; set; }
        public string? HostingAddress { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
