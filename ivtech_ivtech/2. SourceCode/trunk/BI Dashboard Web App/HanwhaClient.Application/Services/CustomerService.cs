using DocumentFormat.OpenXml.Spreadsheet;
using HanwhaClient.Application.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.DbEntities;
using MongoDB.Driver;

namespace HanwhaClient.Application.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _customerRepository;

        public CustomerService(ICustomerRepository customerRepository)
        {
            this._customerRepository = customerRepository;
        }

        public async Task<IEnumerable<Customer>> GetAllCustomersAsync()
        {
            var data = await _customerRepository.GetAllAsync();
            return await Task.FromResult(data);
        }

        public async Task<Customer> GetCustomerAsync(string id)
        {
            var data = await _customerRepository.GetAsync(id);
            return await Task.FromResult(data);
        }
        public async Task<string> CreateCustomerAsync(Customer customer, string userId)
        {
            customer.CreatedBy = userId;
            customer.UpdatedBy = userId;
            customer.CreatedOn = DateTime.UtcNow;
            customer.UpdatedOn = DateTime.UtcNow;
            var id = await _customerRepository.InsertAsync(customer);
            return await Task.FromResult(id);
        }

        public async Task<bool> CreateCustomerAsync(List<Customer> customers, string userId)
        {
            var currentDateTime = DateTime.UtcNow;

            // Set CreatedOn and CreatedBy for each customer
            customers.ForEach(customer =>
            {
                customer.CreatedOn = currentDateTime;
                customer.CreatedBy = userId;
                customer.UpdatedOn = currentDateTime;
                customer.UpdatedBy = userId;
            });

            var result = await _customerRepository.InsertManyAsync(customers);
            return await Task.FromResult(result);
        }

        public async Task<bool> UpdateCustomerAsync(Customer customer, string userId)
        {
            customer.UpdatedOn = DateTime.UtcNow;
            customer.UpdatedBy = userId;
            var data = await _customerRepository.UpdateAsync(customer);
            return await Task.FromResult(data);
        }

        public async Task<bool> UpdateCustomerFieldsAsync(Customer customer, string userId)
        {
            var update = Builders<Customer>.Update
                        .Set(c => c.CustomerName, customer.CustomerName)
                        .Set(c => c.UpdatedBy, userId)
                        .Set(c => c.UpdatedOn, DateTime.UtcNow);

            var data = await _customerRepository.UpdateFieldsAsync(customer.Id, update);
            return await Task.FromResult(data);
        }

        public async Task<bool> DeleteCustomerAsync(string id, string userId)
        {
            var data = await _customerRepository.SoftDeleteAsync(id, userId);
            return await Task.FromResult(data);
        }

        public async Task<long> DeleteCustomerAsync(IEnumerable<string> ids, string userId)
        {
            var data = await _customerRepository.SoftDeleteManyAsync(ids, userId);
            return await Task.FromResult(data);
        }
    }
}
