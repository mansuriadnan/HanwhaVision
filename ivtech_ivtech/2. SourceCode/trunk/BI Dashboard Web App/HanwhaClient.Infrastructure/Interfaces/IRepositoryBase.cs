using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IRepositoryBase<T> where T : class
    {
        /// <summary>
        /// Retrieves all documents from the collection.
        /// </summary>
        Task<IEnumerable<T>> GetAllAsync(ProjectionDefinition<T> projection = null, bool includeDeleted = false);

        /// <summary>
        /// Retrieves a single document by its ID.
        /// </summary>
        Task<T> GetAsync(string id);

        /// <summary>
        /// Retrieves multiple documents by their IDs.
        /// </summary>
        Task<IEnumerable<T>> GetManyAsync(IEnumerable<string> ids, ProjectionDefinition<T> projection = null);

        /// <summary>
        /// Inserts a single document into the collection.
        /// </summary>
        Task<string> InsertAsync(T entity);

        /// <summary>
        /// Inserts multiple documents into the collection.
        /// </summary>
        Task<bool> InsertManyAsync(IEnumerable<T> entities);

        /// <summary>
        /// Replaces an entire document in the collection by its ID.
        /// </summary>
        Task<bool> UpdateAsync(T entity);

        /// <summary>
        /// Partially updates fields in a document by its ID.
        /// </summary>
        Task<bool> UpdateFieldsAsync(string id, UpdateDefinition<T> updateDefinition, UpdateOptions updateOptions = null);

        Task<bool> UpdateManyFieldsAsync(FilterDefinition<T> filter, UpdateDefinition<T> updateDefinition);

        /// <summary>
        /// Marks a document as soft-deleted by setting an `IsDeleted` flag.
        /// </summary>
        Task<bool> SoftDeleteAsync(string id, string userId);

        /// <summary>
        /// Marks multiple documents as soft-deleted by setting an `IsDeleted` flag.
        /// </summary>
        Task<long> SoftDeleteManyAsync(IEnumerable<string> ids, string userId);
    }
}
