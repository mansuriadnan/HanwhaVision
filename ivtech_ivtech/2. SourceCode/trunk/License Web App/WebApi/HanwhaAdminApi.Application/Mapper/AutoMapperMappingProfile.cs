using AutoMapper;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto;
using HanwhaAdminApi.Model.License;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Application.Mapper
{
    public class AutoMapperMappingProfile : Profile
    {
        public AutoMapperMappingProfile()
        {
            CreateMap<UsersRequestModel, UserMaster>();
            //.ForMember(m => m.RoleId, x => x.MapFrom(c => c.RoleId));

            CreateMap<LicenseRequestModel, LicenseRequest>();
            CreateMap<CustomerMaster, CustomerResponseDto>();
            CreateMap<DistributorRequestDto, DistributorMaster>();
        }
    }
}
