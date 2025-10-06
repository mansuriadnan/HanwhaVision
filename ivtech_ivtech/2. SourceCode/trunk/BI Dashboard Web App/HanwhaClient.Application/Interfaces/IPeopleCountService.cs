using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface IPeopleCountService
    {
        //Task<List<PeopleCountDto>> GetAllAsync();
        Task<IEnumerable<PeopleCountDto>> GetCamerasBySelectedDateAsync(string? selectedDate);
        Task<string> InsertPeople(PeopleCount peopleCountDetail, string userId = "");
        Task<List<PeopleCountDto>> GetPeopleCountByZoneIdOrCameraId(string? zoneId, string? cameraId);
    }
}
