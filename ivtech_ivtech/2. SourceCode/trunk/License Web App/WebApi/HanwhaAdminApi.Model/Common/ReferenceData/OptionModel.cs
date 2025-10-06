using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.Common.ReferenceData
{
    public class OptionModel<VValue, LValue>
    {
        public OptionModel(VValue _value, LValue _label, bool _active = true, bool _default = false, string _type = "", int? _order = null, string _additionalProperty = "", int? _parentValue = null, string _hoverText = "")
        {
            value = _value;
            label = _label;
            isDisabled = !_active;
            isDefault = _default;
            type = _type;
            order = _order;
            additionalProperty = _additionalProperty;
            parentValue = _parentValue;
            hoverText = _hoverText;
        }

        public VValue value { get; set; }
        public LValue label { get; set; }
        public bool readOnly { get; set; }
        public bool isDisabled { get; set; }
        public bool isDefault { get; set; }
        public int? parentValue { get; set; }
        public string type { get; set; }
        public int? order { get; set; }
        /// <summary>
        /// The value to display as the title of the selected option.
        /// </summary>
        public string hoverText { get; set; }
        public string additionalProperty { get; set; }

    }
}
