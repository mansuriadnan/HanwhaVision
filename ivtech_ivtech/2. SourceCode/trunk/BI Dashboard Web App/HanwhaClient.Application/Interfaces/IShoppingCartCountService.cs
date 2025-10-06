using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Application.Interfaces
{
    public interface IShoppingCartCountService
    {
        Task<String> InsertShoppingCartCount(ShoppingCartCount shoppingCartCount);
    }
}
