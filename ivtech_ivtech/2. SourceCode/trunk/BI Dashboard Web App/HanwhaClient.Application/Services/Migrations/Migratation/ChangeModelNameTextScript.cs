using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Services.Migrations.Migratation
{

    [Migration(2025011603, "Change Modal To Model in Widget")]
    public class ChangeModelNameTextScript : IMigration
    {

        public async Task RunAsync(IMongoDatabase database)
        {
            #region Update Widget Name

            var widgetMasterCollection = database.GetCollection<WidgetMaster>(AppDBConstants.WidgetMaster);
            var widgetData = widgetMasterCollection.Find(x=>x.CategoryName == "Camera").FirstOrDefault();

            if (widgetData !=  null)
            {

                var widgetToUpdate = widgetData.Widgets.FirstOrDefault(x => x.WidgetName == "Modal Types");
                if (widgetToUpdate != null)
                {
                    widgetToUpdate.WidgetName = "Model Types";

                    var filter = Builders<WidgetMaster>.Filter.Eq(x => x.Id, widgetData.Id);
                    var update = Builders<WidgetMaster>.Update.Set(x => x.Widgets, widgetData.Widgets);

                    widgetMasterCollection.UpdateOne(filter, update);
                }
            }

            #endregion
        }
    }
}
