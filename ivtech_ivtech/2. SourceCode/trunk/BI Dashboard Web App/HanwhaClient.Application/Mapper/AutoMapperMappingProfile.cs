using AutoMapper;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.License;
using HanwhaClient.Model.User;

namespace HanwhaClient.Application.Mapper
{
    public class AutoMapperMappingProfile : Profile
    {
        public AutoMapperMappingProfile()
        {
            CreateMap<UsersRequestModel, UserMaster>();
            CreateMap<DeviceMaster, DevicesWithoutZonesResponseDto>();
            CreateMap<SiteMaster, SiteDto>();
            CreateMap<ChildSite, ChildSiteDto>();
            CreateMap<DashboardPreference, GetDashboardPreferenceResponse > ();
            //.ForMember(m => m.RoleId, x => x.MapFrom(c => c.RoleId));
        }
    }
}
