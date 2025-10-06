using HanwhaClient.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface ICustomerService
    {
        Task<IEnumerable<Customer>> GetAllCustomersAsync();
        Task<Customer> GetCustomerAsync(string id);
        Task<string> CreateCustomerAsync(Customer customer,string userId);
        Task<bool> CreateCustomerAsync(List<Customer> customer, string userId);
        Task<bool> UpdateCustomerAsync(Customer customer, string userId);
        Task<bool> UpdateCustomerFieldsAsync(Customer customer,string userId);
        Task<bool> DeleteCustomerAsync(string id,string userId);
        Task<long> DeleteCustomerAsync(IEnumerable<string> ids, string userId);
    }
}
