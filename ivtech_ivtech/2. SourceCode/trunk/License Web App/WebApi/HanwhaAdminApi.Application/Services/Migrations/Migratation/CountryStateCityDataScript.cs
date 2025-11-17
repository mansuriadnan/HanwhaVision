using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.Common;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Runtime;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;
using static HanwhaAdminApi.Application.Services.Migrations.Migratation.CountryStateCityDataScript;

namespace HanwhaAdminApi.Application.Services.Migrations.Migratation
{

    public static class CountryStateCityDataScript
    {
        public async static Task InsertCountryStateCity(IMongoDatabase database, string systemAdminUserId)
        {

            var countryCollection = database.GetCollection<CountryMaster>(AppDBConstants.CountryMaster);
            var stateCollection = database.GetCollection<StateMaster>(AppDBConstants.StateMaster);
            var cityCollection = database.GetCollection<CityMaster>(AppDBConstants.CityMaster);

            // Sample data (replace with your actual data)
            var countries = new List<CountryInfoModel>
{
    new CountryInfoModel { CountryName = "United Arab Emirates", CountryCode = "AE", HasState = false },
    new CountryInfoModel { CountryName = "KSA", CountryCode = "SA", HasState = false },
    new CountryInfoModel { CountryName = "EGYPT", CountryCode = "EG", HasState = false },
    new CountryInfoModel { CountryName = "Israel", CountryCode = "IL", HasState = false },
    new CountryInfoModel { CountryName = "Iraq", CountryCode = "IQ", HasState = false },
    new CountryInfoModel { CountryName = "Oman", CountryCode = "OM", HasState = false },
    new CountryInfoModel { CountryName = "Kuwait", CountryCode = "KW", HasState = false },
    new CountryInfoModel { CountryName = "Jordan", CountryCode = "JO", HasState = false },
    new CountryInfoModel { CountryName = "Morocco", CountryCode = "MA", HasState = false },
    new CountryInfoModel { CountryName = "South Africa", CountryCode = "ZA", HasState = true },
    new CountryInfoModel { CountryName = "Kenya", CountryCode = "KE", HasState = false },
    new CountryInfoModel { CountryName = "Tunisia", CountryCode = "TN", HasState = false },
    new CountryInfoModel { CountryName = "Algeria", CountryCode = "DZ", HasState = false },
    new CountryInfoModel { CountryName = "France", CountryCode = "FR", HasState = false },
    new CountryInfoModel { CountryName = "Germany", CountryCode = "DE", HasState = true },
    new CountryInfoModel { CountryName = "United Kingdom", CountryCode = "GB", HasState = false },
    new CountryInfoModel { CountryName = "Netherlands", CountryCode = "NL", HasState = false },
    new CountryInfoModel { CountryName = "Italy", CountryCode = "IT", HasState = false },
    new CountryInfoModel { CountryName = "Czech Republic", CountryCode = "CZ", HasState = false },
    new CountryInfoModel { CountryName = "Austria", CountryCode = "AT", HasState = true },
    new CountryInfoModel { CountryName = "Belgium", CountryCode = "BE", HasState = false },
    new CountryInfoModel { CountryName = "Spain", CountryCode = "ES", HasState = false },
    new CountryInfoModel { CountryName = "Portugal", CountryCode = "PT", HasState = false },
    new CountryInfoModel { CountryName = "Denmark", CountryCode = "DK", HasState = false },
    new CountryInfoModel { CountryName = "Poland", CountryCode = "PL", HasState = false },
    new CountryInfoModel { CountryName = "Sweden", CountryCode = "SE", HasState = false },
    new CountryInfoModel { CountryName = "Norway", CountryCode = "NO", HasState = false },
    new CountryInfoModel { CountryName = "Ireland", CountryCode = "IE", HasState = false },
    new CountryInfoModel { CountryName = "Iceland", CountryCode = "IS", HasState = false },
    new CountryInfoModel { CountryName = "Hungary", CountryCode = "HU", HasState = false },
    new CountryInfoModel { CountryName = "Romania", CountryCode = "RO", HasState = false },
    new CountryInfoModel { CountryName = "Finland", CountryCode = "FI", HasState = false },
    new CountryInfoModel { CountryName = "India", CountryCode = "IN", HasState = true },
    new CountryInfoModel { CountryName = "Singapore", CountryCode = "SG", HasState = false },
    new CountryInfoModel { CountryName = "South Korea", CountryCode = "KR", HasState = false },
    new CountryInfoModel { CountryName = "Japan", CountryCode = "JP", HasState = false },
    new CountryInfoModel { CountryName = "Australia", CountryCode = "AU", HasState = true },
    new CountryInfoModel { CountryName = "New Zealand", CountryCode = "NZ", HasState = false },
    new CountryInfoModel { CountryName = "United States of America", CountryCode = "US", HasState = true },
    new CountryInfoModel { CountryName = "Mexico", CountryCode = "MX", HasState = true }
};

            var states = new List<StateInfoModel>
            {
                // South Africa (ZA)
                new StateInfoModel { CountryCode = "ZA", StateName = "Gauteng" },
                new StateInfoModel { CountryCode = "ZA", StateName = "Western Cape" },
                new StateInfoModel { CountryCode = "ZA", StateName = "KwaZulu-Natal" },
                new StateInfoModel { CountryCode = "ZA", StateName = "Eastern Cape" },
                new StateInfoModel { CountryCode = "ZA", StateName = "Free State" },
                new StateInfoModel { CountryCode = "ZA", StateName = "Limpopo" },
                new StateInfoModel { CountryCode = "ZA", StateName = "Mpumalanga" },
                new StateInfoModel { CountryCode = "ZA", StateName = "North West" },
                new StateInfoModel { CountryCode = "ZA", StateName = "Northern Cape" },
            
                // Germany (DE)
                new StateInfoModel { CountryCode = "DE", StateName = "Bavaria" },
                new StateInfoModel { CountryCode = "DE", StateName = "Berlin" },
                new StateInfoModel { CountryCode = "DE", StateName = "Hamburg" },
                new StateInfoModel { CountryCode = "DE", StateName = "Hesse" },
                new StateInfoModel { CountryCode = "DE", StateName = "Saxony" },
                new StateInfoModel { CountryCode = "DE", StateName = "Brandenburg" },
                new StateInfoModel { CountryCode = "DE", StateName = "Lower Saxony" },
                new StateInfoModel { CountryCode = "DE", StateName = "North Rhine-Westphalia" },
                new StateInfoModel { CountryCode = "DE", StateName = "Baden-Württemberg" },
                new StateInfoModel { CountryCode = "DE", StateName = "Thuringia" },
                new StateInfoModel { CountryCode = "DE", StateName = "Rhineland-Palatinate" },
                new StateInfoModel { CountryCode = "DE", StateName = "Saarland" },
                new StateInfoModel { CountryCode = "DE", StateName = "Schleswig-Holstein" },
                new StateInfoModel { CountryCode = "DE", StateName = "Saxony-Anhalt" },
                new StateInfoModel { CountryCode = "DE", StateName = "Mecklenburg-Vorpommern" },
                new StateInfoModel { CountryCode = "DE", StateName = "Bremen" },
            
                // Austria (AT)
                new StateInfoModel { CountryCode = "AT", StateName = "Vienna" },
                new StateInfoModel { CountryCode = "AT", StateName = "Lower Austria" },
                new StateInfoModel { CountryCode = "AT", StateName = "Upper Austria" },
                new StateInfoModel { CountryCode = "AT", StateName = "Styria" },
                new StateInfoModel { CountryCode = "AT", StateName = "Tyrol" },
                new StateInfoModel { CountryCode = "AT", StateName = "Carinthia" },
                new StateInfoModel { CountryCode = "AT", StateName = "Salzburg" },
                new StateInfoModel { CountryCode = "AT", StateName = "Burgenland" },
                new StateInfoModel { CountryCode = "AT", StateName = "Vorarlberg" },
            
                // India (IN)
                new StateInfoModel { CountryCode = "IN", StateName = "Maharashtra" },
                new StateInfoModel { CountryCode = "IN", StateName = "Tamil Nadu" },
                new StateInfoModel { CountryCode = "IN", StateName = "Karnataka" },
                new StateInfoModel { CountryCode = "IN", StateName = "Uttar Pradesh" },
                new StateInfoModel { CountryCode = "IN", StateName = "West Bengal" },
                new StateInfoModel { CountryCode = "IN", StateName = "Gujarat" },
                new StateInfoModel { CountryCode = "IN", StateName = "Rajasthan" },
                new StateInfoModel { CountryCode = "IN", StateName = "Bihar" },
                new StateInfoModel { CountryCode = "IN", StateName = "Kerala" },
                new StateInfoModel { CountryCode = "IN", StateName = "Punjab" },
                new StateInfoModel { CountryCode = "IN", StateName = "Haryana" },
                new StateInfoModel { CountryCode = "IN", StateName = "Madhya Pradesh" },
                new StateInfoModel { CountryCode = "IN", StateName = "Odisha" },
                new StateInfoModel { CountryCode = "IN", StateName = "Telangana" },
                new StateInfoModel { CountryCode = "IN", StateName = "Andhra Pradesh" },
                new StateInfoModel { CountryCode = "IN", StateName = "Assam" },
                new StateInfoModel { CountryCode = "IN", StateName = "Chhattisgarh" },
                new StateInfoModel { CountryCode = "IN", StateName = "Jharkhand" },
                new StateInfoModel { CountryCode = "IN", StateName = "Uttarakhand" },
                new StateInfoModel { CountryCode = "IN", StateName = "Himachal Pradesh" },
                new StateInfoModel { CountryCode = "IN", StateName = "Goa" },
                new StateInfoModel { CountryCode = "IN", StateName = "Tripura" },
                new StateInfoModel { CountryCode = "IN", StateName = "Manipur" },
                new StateInfoModel { CountryCode = "IN", StateName = "Meghalaya" },
                new StateInfoModel { CountryCode = "IN", StateName = "Nagaland" },
                new StateInfoModel { CountryCode = "IN", StateName = "Arunachal Pradesh" },
                new StateInfoModel { CountryCode = "IN", StateName = "Mizoram" },
                new StateInfoModel { CountryCode = "IN", StateName = "Sikkim" },
            
                // Australia (AU)
                new StateInfoModel { CountryCode = "AU", StateName = "New South Wales" },
                new StateInfoModel { CountryCode = "AU", StateName = "Victoria" },
                new StateInfoModel { CountryCode = "AU", StateName = "Queensland" },
                new StateInfoModel { CountryCode = "AU", StateName = "Western Australia" },
                new StateInfoModel { CountryCode = "AU", StateName = "South Australia" },
                new StateInfoModel { CountryCode = "AU", StateName = "Tasmania" },
                new StateInfoModel { CountryCode = "AU", StateName = "Australian Capital Territory" },
                new StateInfoModel { CountryCode = "AU", StateName = "Northern Territory" },
            
                // United States of America (US)
                new StateInfoModel { CountryCode = "US", StateName = "California" },
                new StateInfoModel { CountryCode = "US", StateName = "Texas" },
                new StateInfoModel { CountryCode = "US", StateName = "Florida" },
                new StateInfoModel { CountryCode = "US", StateName = "New York" },
                new StateInfoModel { CountryCode = "US", StateName = "Illinois" },
                new StateInfoModel { CountryCode = "US", StateName = "Pennsylvania" },
                new StateInfoModel { CountryCode = "US", StateName = "Ohio" },
                new StateInfoModel { CountryCode = "US", StateName = "Georgia" },
                new StateInfoModel { CountryCode = "US", StateName = "North Carolina" },
                new StateInfoModel { CountryCode = "US", StateName = "Michigan" },
                new StateInfoModel { CountryCode = "US", StateName = "New Jersey" },
                new StateInfoModel { CountryCode = "US", StateName = "Virginia" },
                new StateInfoModel { CountryCode = "US", StateName = "Washington" },
                new StateInfoModel { CountryCode = "US", StateName = "Arizona" },
                new StateInfoModel { CountryCode = "US", StateName = "Massachusetts" },
                new StateInfoModel { CountryCode = "US", StateName = "Tennessee" },
                new StateInfoModel { CountryCode = "US", StateName = "Indiana" },
                new StateInfoModel { CountryCode = "US", StateName = "Missouri" },
                new StateInfoModel { CountryCode = "US", StateName = "Maryland" },
                new StateInfoModel { CountryCode = "US", StateName = "Wisconsin" },
                new StateInfoModel { CountryCode = "US", StateName = "Colorado" },
                new StateInfoModel { CountryCode = "US", StateName = "Minnesota" },
                new StateInfoModel { CountryCode = "US", StateName = "South Carolina" },
                new StateInfoModel { CountryCode = "US", StateName = "Alabama" },
                new StateInfoModel { CountryCode = "US", StateName = "Louisiana" },
                new StateInfoModel { CountryCode = "US", StateName = "Kentucky" },
                new StateInfoModel { CountryCode = "US", StateName = "Oregon" },
                new StateInfoModel { CountryCode = "US", StateName = "Oklahoma" },
                new StateInfoModel { CountryCode = "US", StateName = "Connecticut" },
                new StateInfoModel { CountryCode = "US", StateName = "Iowa" },
                new StateInfoModel { CountryCode = "US", StateName = "Mississippi" },
                new StateInfoModel { CountryCode = "US", StateName = "Arkansas" },
                new StateInfoModel { CountryCode = "US", StateName = "Kansas" },
                new StateInfoModel { CountryCode = "US", StateName = "Nevada" },
                new StateInfoModel { CountryCode = "US", StateName = "New Mexico" },
                new StateInfoModel { CountryCode = "US", StateName = "Nebraska" },
                new StateInfoModel { CountryCode = "US", StateName = "West Virginia" },
                new StateInfoModel { CountryCode = "US", StateName = "Idaho" },
                new StateInfoModel { CountryCode = "US", StateName = "Hawaii" },
                new StateInfoModel { CountryCode = "US", StateName = "New Hampshire" },
                new StateInfoModel { CountryCode = "US", StateName = "Maine" },
                new StateInfoModel { CountryCode = "US", StateName = "Montana" },
                new StateInfoModel { CountryCode = "US", StateName = "Rhode Island" },
                new StateInfoModel { CountryCode = "US", StateName = "Delaware" },
                new StateInfoModel { CountryCode = "US", StateName = "South Dakota" },
                new StateInfoModel { CountryCode = "US", StateName = "North Dakota" },
                new StateInfoModel { CountryCode = "US", StateName = "Alaska" },
                new StateInfoModel { CountryCode = "US", StateName = "Vermont" },
                new StateInfoModel { CountryCode = "US", StateName = "Wyoming" },
            
                // Mexico (MX)
                new StateInfoModel { CountryCode = "MX", StateName = "Aguascalientes" },
                new StateInfoModel { CountryCode = "MX", StateName = "Baja California" },
                new StateInfoModel { CountryCode = "MX", StateName = "Baja California Sur" },
                new StateInfoModel { CountryCode = "MX", StateName = "Campeche" },
                new StateInfoModel { CountryCode = "MX", StateName = "Chiapas" },
                new StateInfoModel { CountryCode = "MX", StateName = "Chihuahua" },
                new StateInfoModel { CountryCode = "MX", StateName = "Coahuila" },
                new StateInfoModel { CountryCode = "MX", StateName = "Colima" },
                new StateInfoModel { CountryCode = "MX", StateName = "Durango" },
                new StateInfoModel { CountryCode = "MX", StateName = "Guanajuato" },
                new StateInfoModel { CountryCode = "MX", StateName = "Guerrero" },
                new StateInfoModel { CountryCode = "MX", StateName = "Hidalgo" },
                new StateInfoModel { CountryCode = "MX", StateName = "Jalisco" },
                new StateInfoModel { CountryCode = "MX", StateName = "Mexico State" },
                new StateInfoModel { CountryCode = "MX", StateName = "Mexico City" },
                new StateInfoModel { CountryCode = "MX", StateName = "Michoacán" },
                new StateInfoModel { CountryCode = "MX", StateName = "Morelos" },
                new StateInfoModel { CountryCode = "MX", StateName = "Nayarit" },
                new StateInfoModel { CountryCode = "MX", StateName = "Nuevo León" },
                new StateInfoModel { CountryCode = "MX", StateName = "Oaxaca" },
                new StateInfoModel { CountryCode = "MX", StateName = "Puebla" },
                new StateInfoModel { CountryCode = "MX", StateName = "Querétaro" },
                new StateInfoModel { CountryCode = "MX", StateName = "Quintana Roo" },
                new StateInfoModel { CountryCode = "MX", StateName = "San Luis Potosí" },
                new StateInfoModel { CountryCode = "MX", StateName = "Sinaloa" },
                new StateInfoModel { CountryCode = "MX", StateName = "Sonora" },
                new StateInfoModel { CountryCode = "MX", StateName = "Tabasco" },
                new StateInfoModel { CountryCode = "MX", StateName = "Tamaulipas" },
                new StateInfoModel { CountryCode = "MX", StateName = "Tlaxcala" },
                new StateInfoModel { CountryCode = "MX", StateName = "Veracruz" },
                new StateInfoModel { CountryCode = "MX", StateName = "Yucatán" },
                new StateInfoModel { CountryCode = "MX", StateName = "Zacatecas" }
            };

            var locationHierarchy = new CountryStateCityHierarchy
            {
                CountryStateCities = new Dictionary<string, Dictionary<string, List<string>>>
                {
                    ["IN"] = new Dictionary<string, List<string>>
                    {
                        ["Maharashtra"] = new List<string> {
        "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Thane", "Amravati",
        "Kolhapur", "Sangli", "Nanded", "Akola", "Latur", "Dhule", "Ahmednagar", "Chandrapur",
        "Parbhani", "Jalgaon", "Bhiwandi", "Navi Mumbai", "Ulhasnagar", "Malegaon", "Mira-Bhayandar",
        "Vasai-Virar", "Kalyan-Dombivli", "Panvel", "Nandurbar", "Wardha", "Yavatmal", "Beed",
        "Osmanabad", "Satara", "Ratnagiri", "Sindhudurg", "Gadchiroli", "Gondia", "Washim",
        "Buldhana", "Hingoli", "Jalna", "Raigad", "Palghar"
    },

                        ["Tamil Nadu"] = new List<string> {
        "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur",
        "Vellore", "Erode", "Thoothukkudi", "Dindigul", "Thanjavur", "Ranipet", "Sivakasi",
        "Karur", "Udhagamandalam", "Hosur", "Nagercoil", "Kanchipuram", "Kumarakonam", "Karaikkudi",
        "Neyveli", "Cuddalore", "Kumbakonam", "Tiruvannamalai", "Pollachi", "Rajapalayam",
        "Gudiyatham", "Pudukkottai", "Vaniyambadi", "Ambur", "Nagapattinam", "Viluppuram",
        "Tiruvallur", "Tindivanam", "Arakkonam", "Paramakudi", "Tenkasi", "Virudhunagar",
        "Ariyalur", "Chengalpattu", "Dharmapuri", "Krishnagiri", "Mayiladuthurai", "Tirupathur"
    },

                        ["Karnataka"] = new List<string> {
        "Bengaluru", "Mysuru", "Hubli-Dharwad", "Mangaluru", "Belagavi", "Gulbarga", "Davanagere",
        "Ballari", "Vijayapura", "Shivamogga", "Tumakuru", "Raichur", "Bidar", "Hosapete",
        "Gadag-Betageri", "Udupi", "Robertson Pet", "Bhadravati", "Chitradurga", "Hassan",
        "Mandya", "Chikkamagaluru", "Bagalkot", "Haveri", "Karwar", "Ranebennuru", "Gangavati",
        "Sirsi", "Sindhanur", "Sanduru", "Jagalur", "Koppal", "Ramanagara", "Gokak",
        "Yadgir", "Rabkavi Banhatti", "Shahabad", "Siruguppa", "Mudhol", "Adyar",
        "Naregal", "Saundatti-Yellamma", "Wadi", "Manvi", "Nelamangala", "Lakshmeshwar",
        "Jewargi", "Shiggaon", "Ankola", "Muddebihal", "Tarikere", "Magadi", "Bangarpet",
        "Malur"
    },

                        ["Uttar Pradesh"] = new List<string> {
        "Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly",
        "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Noida", "Firozabad", "Loni", "Jhansi",
        "Muzaffarnagar", "Mathura", "Budaun", "Rampur", "Shahjahanpur", "Farrukhabad", "Maunath Bhanjan",
        "Hapur", "Ayodhya", "Etawah", "Mirzapur", "Bulandshahr", "Sambhal", "Amroha", "Hardoi",
        "Fatehpur", "Raebareli", "Orai", "Sitapur", "Bahraich", "Modinagar", "Unnao", "Jaunpur",
        "Lakhimpur", "Hathras", "Banda", "Pilibhit", "Barabanki", "Khurja", "Gonda", "Mainpuri",
        "Lalitpur", "Etah", "Deoria", "Ujhani", "Ghazipur", "Sultanpur", "Azamgarh", "Bijnor",
        "Sahaswan", "Basti", "Chandausi", "Akbarpur", "Ballia", "Tanda", "Greater Noida",
        "Shikohabad", "Shamli", "Awagarh", "Kasganj"
    },

                        ["West Bengal"] = new List<string> {
        "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Malda", "Bardhaman", "Baharampur",
        "Habra", "Kharagpur", "Shantipur", "Dankuni", "Dhulian", "Ranaghat", "Haldia", "Raiganj",
        "Krishnanagar", "Nabadwip", "Medinipur", "Jalpaiguri", "Balurghat", "Basirhat", "Bankura",
        "Chakdaha", "Darjeeling", "Alipurduar", "Purulia", "Jangipur", "Bangaon", "Cooch Behar",
        "Bidhannagar", "Tamluk", "Raghunathganj", "Arambagh", "Taherpur", "Habiganj", "Naihati",
        "Titagarh", "Suri", "Midnapore", "Barrackpur", "Khardaha", "Barasat", "Rajarhat",
        "New Town", "Uttarpara", "Serampore", "Champdani", "Berhampore", "Bolpur", "Jhargram",
        "Murshidabad", "Birbhum", "Nadia", "North 24 Parganas", "South 24 Parganas"
    },

                        ["Gujarat"] = new List<string> {
        "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar",
        "Anand", "Navsari", "Morbi", "Nadiad", "Surendranagar", "Bharuch", "Mehsana", "Bhuj",
        "Porbandar", "Palanpur", "Vapi", "Godhra", "Kalol", "Dahod", "Botad", "Amreli", "Deesa",
        "Jetpur", "Siddhapur", "Veraval", "Upleta", "Dhoraji", "Gondal", "Sihor", "Wankaner",
        "Limbdi", "Mandvi", "Thangadh", "Mahuva", "Mangrol", "Viramgam", "Modasa", "Palitana",
        "Petlad", "Kapadvanj", "Sidhpur", "Wapi", "Kadi", "Tarapur", "Mahemdabad", "Khambhat",
        "Padra", "Lunawada", "Rajpipla", "Valsad", "Vansda", "Dharampur", "Dang", "Narmada",
        "Tapi", "Kheda", "Panchmahal", "Sabarkantha", "Banaskantha", "Patan", "Arvalli"
    },

                        ["Rajasthan"] = new List<string> {
        "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Bharatpur",
        "Pali", "Barmer", "Sikar", "Tonk", "Sawai Madhopur", "Jaisalmer", "Hanumangarh", "Kishangarh",
        "Beawar", "Jhunjhunu", "Gangapur City", "Churu", "Dhaulpur", "Makrana", "Fatehpur", "Nokha",
        "Bundi", "Mount Abu", "Banswara", "Pratapgarh", "Chittorgarh", "Nathdwara", "Dungarpur",
        "Jhalawar", "Sirohi", "Karauli", "Sri Ganganagar", "Nagaur", "Dausa", "Rajsamand",
        "Dholpur", "Jalore", "Baran", "Jhalawar", "Balotra", "Phalodi", "Laxmangarh", "Nohar",
        "Sujangarh", "Sadri", "Sojat", "Nimbahera", "Sagwara", "Raisinghnagar", "Merta City",
        "Kapasan", "Ladnu", "Didwana", "Ratangarh", "Rawatbhata", "Rajakhera", "Shahpura", "Reengus"
    },

                        ["Bihar"] = new List<string> {
        "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah",
        "Begusarai", "Katihar", "Munger", "Chhapra", "Danapur", "Saharsa", "Sasaram", "Hajipur",
        "Dehri", "Siwan", "Motihari", "Nawada", "Bagaha", "Buxar", "Kishanganj", "Sitamarhi",
        "Jamalpur", "Jehanabad", "Aurangabad", "Lakhisarai", "Sheikhpura", "Nalanda", "Jamui",
        "Rohtas", "Kaimur", "West Champaran", "East Champaran", "Sheohar", "Supaul", "Madhepura",
        "Araria", "Khagaria", "Banka", "Madhubani", "Gopalganj", "Saran", "Vaishali", "Samastipur",
        "Forbesganj", "Manihari", "Bettiah", "Raxaul", "Sugauli", "Narkatia", "Bagaha", "Chanpatia",
        "Ghorasahan", "Mainatand", "Narkatiaganj", "Piprasi", "Sikta", "Shikarpur", "Madhubani"
    },

                        ["Kerala"] = new List<string> {
        "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad", "Alappuzha",
        "Malappuram", "Kannur", "Kasaragod", "Idukki", "Ernakulam", "Kottayam", "Pathanamthitta",
        "Wayanad", "Thalassery", "Kanhangad", "Payyanur", "Koyilandy", "Parappanangadi", "Tanur",
        "Tirur", "Ponnani", "Kodungallur", "Chalakudy", "Perumbavoor", "Angamaly", "Kalamassery",
        "Aluva", "Kothamangalam", "Muvattupuzha", "Thodupuzha", "Kattappana", "Munnar", "Devikulam",
        "Udumbanchola", "Kumily", "Vandanmedu", "Adimaly", "Cheruthoni", "Painavu", "Thodupuzha",
        "Muvattupuzha", "Piravom", "Kolenchery", "Kizhakkambalam", "Malayattoor", "Kalady", "Neryamangalam"
    },

                        ["Punjab"] = new List<string> {
        "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Firozpur", "Batala",
        "Hoshiarpur", "Malerkotla", "Khanna", "Phagwara", "Muktsar", "Barnala", "Rajpura", "Kapurthala",
        "Sangrur", "Fazilka", "Gurdaspur", "Kharar", "Gobindgarh", "Moga", "Abohar", "Pathankot",
        "Sunam", "Longowal", "Dhuri", "Maler Kotla", "Nabha", "Malout", "Faridkot", "Kotkapura",
        "Sadiq", "Zira", "Ferozeshah", "Maur", "Rampura Phul", "Budhlada", "Lehragaga", "Moonak",
        "Ahmedgarh", "Sunam", "Dirba", "Bhadaur", "Ghanaur", "Samana", "Patran", "Sanaur",
        "Dera Bassi", "Zirakpur", "Derabassi", "Lalru", "Banur", "Kurali", "Ropar", "Morinda",
        "Samrala", "Payal", "Raikot", "Jagraon", "Sidhwan Bet", "Machhiwara", "Rahon", "Nakodar"
    },

                        ["Haryana"] = new List<string> {
        "Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal",
        "Sonipat", "Panchkula", "Bhiwani", "Sirsa", "Bahadurgarh", "Jind", "Thanesar", "Kaithal",
        "Rewari", "Narnaul", "Pundri", "Kosli", "Palwal", "Hansi", "Fatehabad", "Gohana",
        "Tohana", "Narwana", "Mandi Dabwali", "Charkhi Dadri", "Shahabad", "Pehowa", "Samalkha",
        "Pinjore", "Ladwa", "Sohna", "Safidon", "Taraori", "Mahendragarh", "Ratia", "Rania",
        "Siwani", "Dabwali", "Ellenabad", "Kalanwali", "Sirsa", "Adampur", "Uklana", "Meham",
        "Barwala", "Assandh", "Safidon", "Panipat", "Israna", "Gharaunda", "Nilokheri", "Indri",
        "Karnal", "Ballabgarh", "Hodal", "Hathin", "Nuh", "Ferozepur Jhirka", "Nagina", "Punahana"
    },

                        ["Madhya Pradesh"] = new List<string> {
        "Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam",
        "Rewa", "Murwara", "Singrauli", "Burhanpur", "Khandwa", "Morena", "Bhind", "Chhindwara",
        "Guna", "Shivpuri", "Vidisha", "Chhatarpur", "Damoh", "Mandsaur", "Khargone", "Neemuch",
        "Pithampur", "Narmadapuram", "Itarsi", "Sehore", "Betul", "Seoni", "Datia", "Nagda",
        "Dhar", "Tikamgarh", "Harda", "Hosangabad", "Jaora", "Shamgarh", "Sendhwa", "Mandla",
        "Balaghat", "Shahdol", "Sidhi", "Anuppur", "Umaria", "Katni", "Panna", "Ashok Nagar",
        "Rajgarh", "Shajapur", "Agar Malwa", "Alirajpur", "Jhabua", "Barwani", "Khargone",
        "Badwani", "Sendhwa", "Maheshwar", "Omkareshwar", "Mhow", "Sarni", "Multai", "Betul"
    },

                        ["Odisha"] = new List<string> {
        "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak",
        "Baripada", "Jharsuguda", "Jeypore", "Barbil", "Khordha", "Balangir", "Rayagada", "Koraput",
        "Nabarangpur", "Malkangiri", "Nuapada", "Kalahandi", "Kandhamal", "Gajapati", "Ganjam",
        "Nayagarh", "Dhenkanal", "Angul", "Jajpur", "Kendrapara", "Jagatsinghpur", "Mayurbhanj",
        "Keonjhar", "Sundargarh", "Deogarh", "Boudh", "Sonepur", "Bargarh", "Jharsuguda",
        "Sambalpur", "Debgarh", "Padampur", "Bijepur", "Barpali", "Ambabhona", "Laikera",
        "Brajarajnagar", "Belpahar", "Talsara", "Vedvyas", "Rajgangpur", "Tangarpali", "Kuarmunda",
        "Panposh", "Bisra", "Bondamunda", "Raghunathpali", "Hemgir", "Lahunipara", "Udit Nagar"
    },

                        ["Telangana"] = new List<string> {
        "Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahabubnagar",
        "Nalgonda", "Adilabad", "Suryapet", "Miryalaguda", "Jagtial", "Mancherial", "Nirmal",
        "Kothagudem", "Palvancha", "Bodhan", "Sangareddy", "Metpally", "Zahirabad", "Medak",
        "Siddipet", "Jangaon", "Manthani", "Choppadandi", "Huzurabad", "Karimnagar", "Peddapalli",
        "Sultanabad", "Korutla", "Jagtial", "Dharmapuri", "Velgatoor", "Gambhiraopet", "Kodimial",
        "Choppadandi", "Pegadapalli", "Godavarikhani", "Srirampur", "Jammikunta", "Huzurabad",
        "Elkathurthy", "Vemulawada", "Konaraopeta", "Thimmapur", "Bheemadevarapally", "Husnabad",
        "Bejjanki", "Ibrahimpatnam", "Ghatkesar", "Keesara", "Medchal", "Shamirpet", "Kompally"
    },

                        ["Andhra Pradesh"] = new List<string> {
        "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kakinada", "Rajahmundry",
        "Tirupati", "Anantapur", "Kadapa", "Vizianagaram", "Eluru", "Ongole", "Nandyal",
        "Machilipatnam", "Adoni", "Tenali", "Chittoor", "Hindupur", "Proddatur", "Bhimavaram",
        "Madanapalle", "Guntakal", "Dharmavaram", "Gudivada", "Narasaraopet", "Tadipatri",
        "Mangalagiri", "Chilakaluripet", "Yemmiganur", "Kadiri", "Chirala", "Anakapalle",
        "Kavali", "Palacole", "Sullurpeta", "Tanuku", "Rayachoti", "Srikalahasti", "Bapatla",
        "Naidupet", "Nagari", "Tadepalligudem", "Repalle", "Nuzvidu", "Pithapuram", "Akividu",
        "Challapalli", "Gudur", "Sullurpeta", "Venkatagiri", "Atmakur", "Chandragiri", "Punganur"
    },

                        ["Assam"] = new List<string> {
        "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon",
        "Dhubri", "North Lakhimpur", "Karimganj", "Sivasagar", "Goalpara", "Barpeta", "Mangaldoi",
        "Nalbari", "Rangia", "Hailakandi", "Haflong", "Kokrajhar", "Mushalpur", "Naharkatiya",
        "Margherita", "Digboi", "Duliajan", "Namrup", "Golaghat", "Dergaon", "Bokakhat",
        "Kharupetia", "Tangla", "Udalguri", "Rowta", "Marigaon", "Laharighat", "Raha",
        "Nowgong", "Hojai", "Lumding", "Diphu", "Hamren", "Donkamukam", "Bokajan", "Howraghat",
        "Sarupathar", "Golaghat", "Khumtai", "Mariani", "Sapekhati", "Sonari", "Charaideo",
        "Chabua", "Lahowal", "Doom Dooma", "Makum", "Ledo", "Margherita", "Lekhapani", "Jaipur"
    },

                        ["Chhattisgarh"] = new List<string> {
        "Raipur", "Bhilai Nagar", "Korba", "Bilaspur", "Durg", "Rajnandgaon", "Jagdalpur",
        "Raigarh", "Ambikapur", "Mahasamund", "Dhamtari", "Chirmiri", "Janjgir", "Sakti",
        "Tilda Newra", "Mungeli", "Manendragarh", "Naila Janjgir", "Kawardha", "Baikunthpur",
        "Kanker", "Narayanpur", "Bastar", "Kondagaon", "Sukma", "Bijapur", "Dantewada",
        "Gariaband", "Balod", "Baloda Bazar", "Bemetara", "Kabirdham", "Jashpur", "Surguja",
        "Surajpur", "Koriya", "Gaurella-Pendra-Marwahi", "Raigarh", "Janjgir-Champa", "Korba",
        "Bilaspur", "Ratanpur", "Kota", "Lormi", "Mungeli", "Akaltara", "Shivrinarayan",
        "Champa", "Pamgarh", "Sarangarh", "Raigarh", "Gharghoda", "Kharsia", "Dharamjaigarh"
    },

                        ["Jharkhand"] = new List<string> {
        "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Phusro", "Adityapur",
        "Hazaribag", "Giridih", "Ramgarh", "Medininagar", "Chirkunda", "Pakaur", "Chaibasa",
        "Dumka", "Sahibganj", "Jhumri Telaiya", "Chatra", "Gumla", "Simdega", "Koderma",
        "Khunti", "Godda", "Sahebganj", "Pakur", "Jamtara", "Latehar", "Garhwa", "Palamu",
        "Lohardaga", "East Singhbhum", "West Singhbhum", "Seraikela Kharsawan", "Saraikela",
        "Kharsawan", "Chakulia", "Ghatsila", "Musabani", "Baharagora", "Rajmahal", "Barhait",
        "Littipara", "Mandro", "Hiranpur", "Barharwa", "Borio", "Rajmahal", "Farakka",
        "Mihijam", "Jamua", "Gandey", "Bagodar", "Giridih", "Pirtand", "Deori", "Dumri"
    },

                        ["Uttarakhand"] = new List<string> {
        "Dehradun", "Haridwar", "Roorkee", "Haldwani-cum-Kathgodam", "Rudrapur", "Kashipur",
        "Rishikesh", "Pithoragarh", "Jaspur", "Kichha", "Manglaur", "Nainital", "Mussoorie",
        "Tehri", "Pauri", "Almora", "Bageshwar", "Chamoli", "Champawat", "Rudraprayag",
        "Uttarkashi", "Kotdwar", "Ramnagar", "Tanakpur", "Sitarganj", "Bazpur", "Laksar",
        "Jwalapur", "Sahaspur", "Selaqui", "Vikasnagar", "Herbertpur", "Doiwala", "Premnagar",
        "Clement Town", "Rajpur", "Sahastradhara", "Jolly Grant", "Kanwali", "Patel Nagar",
        "Hathibarkala", "Bindal", "Kanwali", "Jakhan", "Sahaspur", "Selaqui", "Vikasnagar",
        "Herbertpur", "Doiwala", "Premnagar", "Clement Town", "Rajpur", "Sahastradhara"
    },

                        ["Himachal Pradesh"] = new List<string> {
        "Shimla", "Mandi", "Solan", "Nahan", "Sundernagar", "Palampur", "Kullu", "Hamirpur",
        "Una", "Bilaspur", "Chamba", "Kangra", "Kinnaur", "Lahaul and Spiti", "Sirmaur",
        "Dharamshala", "Manali", "Kasauli", "Dalhousie", "Keylong", "Kalpa", "Rekong Peo",
        "Rohru", "Theog", "Arki", "Kandaghat", "Subathu", "Dagshai", "Parwanoo", "Baddi",
        "Nalagarh", "Amb", "Mehatpur", "Gagret", "Haroli", "Daulatpur", "Chintpurni",
        "Bangana", "Talwara", "Mukerian", "Pathankot", "Nurpur", "Indora", "Fatehpur",
        "Jawali", "Dehra Gopipur", "Panchrukhi", "Multhan", "Bhoranj", "Sujanpur", "Nadaun",
        "Tihra", "Bijhari", "Amb", "Mehatpur", "Gagret", "Haroli", "Daulatpur" },
                        ["Goa"] = new List<string> { "Panaji", "Margao", "Vasco da Gama", "Mapusa" },
                        ["Tripura"] = new List<string> { "Agartala", "Udaipur", "Dharmanagar", "Kailasahar" },
                        ["Manipur"] = new List<string> { "Imphal", "Thoubal", "Bishnupur", "Churachandpur" },
                        ["Meghalaya"] = new List<string> { "Shillong", "Tura", "Nongstoin", "Baghmara" },
                        ["Nagaland"] = new List<string> { "Kohima", "Dimapur", "Mokokchung", "Tuensang" },
                        ["Arunachal Pradesh"] = new List<string> { "Itanagar", "Naharlagun", "Tawang", "Pasighat" },
                        ["Mizoram"] = new List<string> { "Aizawl", "Lunglei", "Champhai", "Serchhip" },
                        ["Sikkim"] = new List<string> { "Gangtok", "Namchi", "Gyalshing", "Mangan" },
                    },

                    ["US"] = new Dictionary<string, List<string>>
                    {
                        ["California"] = new List<string> { "Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", "Sacramento", "Long Beach", "Oakland", "Bakersfield", "Anaheim", "Stockton", "Riverside", "Irvine", "Santa Ana", "Chula Vista", "Fremont", "Santa Clarita", "San Bernardino", "Modesto", "Fontana", "Moreno Valley", "Oxnard", "Huntington Beach", "Glendale", "Ontario", "Elk Grove", "Santa Rosa", "Rancho Cucamonga", "Oceanside", "Garden Grove" },
                        ["Texas"] = new List<string> { "Houston", "San Antonio", "Dallas", "Fort Worth", "Austin", "El Paso", "Arlington", "Corpus Christi", "Plano", "Lubbock", "Laredo", "Irving", "Garland", "Frisco", "McKinney", "Grand Prairie", "Amarillo", "Brownsville", "Denton", "Killeen" },
                        ["Florida"] = new List<string> { "Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Port St. Lucie", "Cape Coral", "Hialeah", "Tallahassee", "Fort Lauderdale", "Pembroke Pines", "Hollywood", "Gainesville", "Miramar", "Palm Bay", "Coral Springs", "Lehigh Acres", "West Palm Beach", "Lakeland", "Spring Hill" },
                        ["New York"] = new List<string> { "New York City", "Hempstead", "Brookhaven", "Islip", "Oyster Bay", "Buffalo", "North Hempstead", "Babylon", "Yonkers", "Rochester", "Huntington", "Ramapo", "Syracuse", "Amherst", "Smithtown", "Albany", "Greece", "Greenburgh", "Cheektowaga", "Colonie" },
                        ["Illinois"] = new List<string> {
                        "Chicago",
                        "Aurora",
                        "Naperville",
                        "Joliet",
                        "Rockford",
                        "Elgin",
                        "Springfield",
                        "Peoria",
                        "Champaign",
                        "Waukegan",
                        "Bloomington",
                        "Cicero",
                        "Bolingbrook",
                        "Schaumburg",
                        "Evanston",
                        "Arlington Heights",
                        "Decatur",
                        "Wheaton",
                        "Waukegan",
                        "Evanston" },
                        ["Pennsylvania"] = new List<string> {
                        "Philadelphia",
                        "Pittsburgh",
                        "Allentown",
                        "Erie",
                        "Reading",
                        "Scranton",
                        "Bethlehem",
                        "Lancaster",
                        "Upper Darby",
                        "Bensalem",
                        "Abington",
                        "Lower Merion",
                        "Harrisburg",
                        "York",
                        "Altoona",
                        "Wilkes-Barre",
                        "State College",
                        "West Chester",
                        "Chester",
                        "Pittsburgh"
                    },
                        ["Ohio"] = new List<string> {
                        "Columbus",
                        "Cleveland",
                        "Cincinnati",
                        "Toledo",
                        "Akron",
                        "Dayton",
                        "Parma",
                        "Canton",
                        "Lorain",
                        "Hamilton",
                        "Youngstown",
                        "Springfield",
                        "Kettering",
                        "Elyria",
                        "Middletown",
                        "Newark",
                        "Cuyahoga Falls",
                        "Dublin",
                        "Westerville",
                        "Massillon"
                    },
                        ["Georgia"] = new List<string> {
                        "Atlanta",
                        "Augusta-Richmond County",
                        "Columbus",
                        "Macon-Bibb County",
                        "Savannah",
                        "Athens-Clarke County",
                        "South Fulton",
                        "Sandy Springs",
                        "Roswell",
                        "Warner Robins",
                        "Johns Creek",
                        "Alpharetta",
                        "Albany",
                        "Marietta",
                        "Stonecrest",
                        "Brookhaven",
                        "Smyrna",
                        "Valdosta",
                        "Dunwoody",
                        "Gainesville"
                    },
                        ["North Carolina"] = new List<string> {
                        "Charlotte",
                        "Raleigh",
                        "Greensboro",
                        "Durham",
                        "Winston-Salem",
                        "Fayetteville",
                        "Cary",
                        "Wilmington",
                        "High Point",
                        "Concord",
                        "Asheville",
                        "Greenville",
                        "Gastonia",
                        "Jacksonville",
                        "Apex",
                        "Huntersville",
                        "Cary",
                        "Wilmington",
                        "High Point",
                        "Concord"
                    },
                        ["Michigan"] = new List<string> {
                        "Detroit",
                        "Grand Rapids",
                        "Warren",
                        "Sterling Heights",
                        "Ann Arbor",
                        "Lansing",
                        "Dearborn",
                        "Livonia",
                        "Troy",
                        "Westland",
                        "Farmington Hills",
                        "Flint",
                        "Wyoming",
                        "Southfield",
                        "Kalamazoo",
                        "Clinton Charter Township",
                        "Canton Charter Township",
                        "Macomb",
                        "Rochester Hills",
                        "Novi"
                    },
                        ["New Jersey"] = new List<string> {
                        "Newark",
                        "Jersey City",
                        "Paterson",
                        "Lakewood",
                        "Elizabeth",
                        "Edison",
                        "Woodbridge",
                        "Toms River",
                        "Hamilton Township",
                        "Trenton",
                        "Clifton",
                        "Cherry Hill",
                        "Brick",
                        "Camden",
                        "Bayonne"
                    },
                        ["Virginia"] = new List<string> {
                        "Virginia Beach",
                        "Chesapeake",
                        "Arlington",
                        "Norfolk",
                        "Richmond",
                        "Newport News",
                        "Alexandria",
                        "Hampton",
                        "Suffolk",
                        "Portsmouth",
                        "Lynchburg",
                        "Roanoke",
                        "Blacksburg",
                        "Charlottesville",
                        "Manassas"
                    },
                        ["Washington"] = new List<string> {
                        "Seattle",
                        "Spokane",
                        "Tacoma",
                        "Vancouver",
                        "Bellevue",
                        "Kent",
                        "Everett",
                        "Spokane Valley",
                        "Renton",
                        "Federal Way"
},
                        ["Arizona"] = new List<string> {
                        "Phoenix",
                        "Tucson",
                        "Mesa",
                        "Chandler",
                        "Gilbert",
                        "Glendale",
                        "Scottsdale",
                        "Peoria",
                        "Tempe",
                        "Surprise",
                        "Goodyear",
                        "Yuma",
                        "Avondale",
                        "Flagstaff",
                        "Lake Havasu City"
                    },
                        ["Massachusetts"] = new List<string> {
                        "Boston",
                        "Worcester",
                        "Springfield",
                        "Cambridge",
                        "Lowell",
                        "Brockton",
                        "Quincy",
                        "Lynn",
                        "New Bedford",
                        "Fall River"
                    },

                        ["Tennessee"] = new List<string> {
                        "Nashville",
                        "Memphis",
                        "Knoxville",
                        "Chattanooga",
                        "Clarksville",
                        "Murfreesboro",
                        "Franklin",
                        "Johnson City",
                        "Jackson",
                        "Hendersonville"
                    },

                        ["Indiana"] = new List<string> {
                        "Indianapolis",
                        "Fort Wayne",
                        "Evansville",
                        "Fishers",
                        "Carmel",
                        "South Bend",
                        "Bloomington",
                        "Hammond",
                        "Noblesville",
                        "Lafayette"
                    },

                        ["Missouri"] = new List<string> {
                        "Kansas City",
                        "St. Louis",
                        "Springfield",
                        "Columbia",
                        "Independence",
                        "Lee's Summit",
                        "O'Fallon",
                        "St. Charles",
                        "St. Joseph",
                        "Blue Springs"
                    },

                        ["Maryland"] = new List<string> {
                        "Baltimore",
                        "Columbia",
                        "Germantown",
                        "Frederick",
                        "Waldorf",
                        "Silver Spring",
                        "Ellicott City",
                        "Glen Burnie",
                        "Gaithersburg",
                        "Bethesda"
                    },
                        ["Wisconsin"] = new List<string> {
                        "Milwaukee",
                        "Madison",
                        "Green Bay",
                        "Kenosha",
                        "Racine",
                        "Appleton",
                        "Eau Claire",
                        "Waukesha",
                        "Oshkosh",
                        "Janesville"
                    },

                        ["Colorado"] = new List<string> {
                        "Denver",
                        "Colorado Springs",
                        "Aurora",
                        "Fort Collins",
                        "Lakewood",
                        "Thornton",
                        "Arvada",
                        "Westminster",
                        "Greeley",
                        "Pueblo"
                    },

                        ["Minnesota"] = new List<string> {
                        "Minneapolis",
                        "St. Paul",
                        "Rochester",
                        "Duluth",
                        "Bloomington",
                        "Brooklyn Park",
                        "Woodbury",
                        "Lakeville",
                        "Blaine",
                        "Plymouth"
                    },

                        ["South Carolina"] = new List<string> {
                        "Charleston",
                        "Columbia",
                        "North Charleston",
                        "Mount Pleasant",
                        "Rock Hill",
                        "Greenville",
                        "Summerville",
                        "Goose Creek",
                        "Greer",
                        "Sumter"
                    },

                        ["Alabama"] = new List<string> {
                        "Huntsville",
                        "Birmingham",
                        "Montgomery",
                        "Mobile",
                        "Tuscaloosa",
                        "Hoover",
                        "Auburn",
                        "Dothan",
                        "Madison",
                        "Decatur"
                    },
                        ["Louisiana"] = new List<string> {
                        "New Orleans",
                        "Baton Rouge",
                        "Shreveport",
                        "Metairie",
                        "Lafayette",
                        "Lake Charles",
                        "Kenner",
                        "Bossier City",
                        "Monroe",
                        "Alexandria"
                    },

                        ["Kentucky"] = new List<string> {
                        "Louisville",
                        "Lexington",
                        "Bowling Green",
                        "Owensboro",
                        "Covington",
                        "Georgetown",
                        "Richmond",
                        "Elizabethtown",
                        "Florence",
                        "Nicholasville"
                    },

                        ["Oregon"] = new List<string> {
                        "Portland",
                        "Salem",
                        "Eugene",
                        "Gresham",
                        "Hillsboro",
                        "Beaverton",
                        "Bend",
                        "Medford",
                        "Springfield",
                        "Corvallis"
                    },

                        ["Oklahoma"] = new List<string> {
                        "Oklahoma City",
                        "Tulsa",
                        "Norman",
                        "Broken Arrow",
                        "Edmond",
                        "Lawton",
                        "Moore",
                        "Midwest City",
                        "Enid",
                        "Stillwater"
                    },

                        ["Connecticut"] = new List<string> {
                        "Bridgeport",
                        "New Haven",
                        "Stamford",
                        "Hartford",
                        "Waterbury",
                        "Norwalk",
                        "Danbury",
                        "New Britain",
                        "Meriden",
                        "Bristol"
                    },

                        ["Iowa"] = new List<string> {
                        "Des Moines",
                        "Cedar Rapids",
                        "Davenport",
                        "Sioux City",
                        "Iowa City",
                        "Waterloo",
                        "Ames",
                        "West Des Moines",
                        "Council Bluffs",
                        "Ankeny"
                    },

                        ["Mississippi"] = new List<string> {
                        "Jackson",
                        "Gulfport",
                        "Southaven",
                        "Hattiesburg",
                        "Biloxi",
                        "Meridian",
                        "Tupelo",
                        "Olive Branch",
                        "Greenville",
                        "Horn Lake"
                    },
                        ["Arkansas"] = new List<string> {
                        "Little Rock",
                        "Fayetteville",
                        "Fort Smith",
                        "Springdale",
                        "Jonesboro",
                        "Rogers",
                        "Conway",
                        "North Little Rock",
                        "Bentonville",
                        "Pine Bluff"
                    },

                        ["Kansas"] = new List<string> {
                        "Wichita",
                        "Overland Park",
                        "Kansas City",
                        "Olathe",
                        "Topeka",
                        "Lawrence",
                        "Manhattan",
                        "Lenexa",
                        "Olathe",
                        "Salina"
                    },

                        ["Nevada"] = new List<string> {
                        "Las Vegas",
                        "Henderson",
                        "Reno",
                        "North Las Vegas",
                        "Paradise",
                        "Enterprise",
                        "Sparks",
                        "Carson City",
                        "Fernley",
                        "Mesquite"
                    },

                        ["New Mexico"] = new List<string> {
                        "Albuquerque",
                        "Las Cruces",
                        "Rio Rancho",
                        "Santa Fe",
                        "Roswell",
                        "Farmington",
                        "Hobbs",
                        "Clovis",
                        "South Valley",
                        "Alamogordo"
                    },

                        ["Nebraska"] = new List<string> {
                        "Omaha",
                        "Lincoln",
                        "Bellevue",
                        "Grand Island",
                        "Kearney",
                        "Fremont",
                        "Norfolk",
                        "Hastings",
                        "Columbus",
                        "Papillion"
                    },

                        ["West Virginia"] = new List<string> {
                        "Charleston",
                        "Huntington",
                        "Morgantown",
                        "Parkersburg",
                        "Wheeling",
                        "Martinsburg",
                        "Fairmont",
                        "Beckley",
                        "Clarksburg",
                        "Weirton"
                    },
                        ["Idaho"] = new List<string> {
                        "Boise",
                        "Meridian",
                        "Nampa",
                        "Caldwell",
                        "Idaho Falls",
                        "Pocatello",
                        "Coeur d'Alene",
                        "Twin Falls",
                        "Post Falls",
                        "Rexburg"
                    },

                        ["Hawaii"] = new List<string> {
                        "Honolulu"
                    },

                        ["New Hampshire"] = new List<string> {
                        "Manchester",
                        "Nashua",
                        "Concord",
                        "Rochester",
                        "Dover"
                    },

                        ["Maine"] = new List<string> {
                        "Portland",
                        "Lewiston",
                        "Bangor",
                        "South Portland",
                        "Auburn"
                    },

                        ["Montana"] = new List<string> {
                        "Billings",
                        "Missoula",
                        "Great Falls",
                        "Bozeman",
                        "Butte"
                    },

                        ["Rhode Island"] = new List<string> {
                        "Providence",
                        "Warwick",
                        "Cranston",
                        "Pawtucket",
                        "East Providence",
                        "Woonsocket",
                        "Cumberland",
                        "Coventry",
                        "North Providence",
                        "South Kingstown"
                    },
                        ["Delaware"] = new List<string> {
                        "Wilmington",
                        "Dover",
                        "Newark",
                        "Middletown",
                        "Bear",
                        "Glasgow",
                        "Milford",
                        "Brookside",
                        "Hockessin",
                        "Smyrna"
                    },

                        ["South Dakota"] = new List<string> {
                        "Sioux Falls",
                        "Rapid City",
                        "Aberdeen",
                        "Brookings",
                        "Watertown",
                        "Yankton",
                        "Mitchell",
                        "Huron",
                        "Box Elder",
                        "Spearfish"
                    },

                        ["North Dakota"] = new List<string> {
                        "Fargo",
                        "Bismarck",
                        "Grand Forks",
                        "Minot",
                        "West Fargo",
                        "Williston",
                        "Mandan",
                        "Dickinson",
                        "Jamestown",
                        "Wahpeton"
                    },

                        ["Alaska"] = new List<string> {
                        "Anchorage",
                        "Fairbanks",
                        "Juneau",
                        "Knik-Fairview",
                        "Badger",
                        "Wasilla",
                        "Eagle River",
                        "North Lakes",
                        "College",
                        "Meadow Lakes"
                    },

                        ["Vermont"] = new List<string> {
                        "Burlington",
                        "South Burlington",
                        "Colchester",
                        "Rutland",
                        "Bennington",
                        "Brattleboro",
                        "Essex Junction",
                        "Milton",
                        "Hartford",
                        "Winooski"
                    },

                        ["Wyoming"] = new List<string> {
                        "Cheyenne",
                        "Casper",
                        "Gillette",
                        "Laramie",
                        "Rock Springs",
                        "Sheridan",
                        "Evanston",
                        "Green River",
                        "Riverton",
                        "Jackson"
                    }



                    },

                    ["AU"] = new Dictionary<string, List<string>>
                    {
                        ["New South Wales"] = new List<string> { "Sydney", "Newcastle", "Wollongong", "Central Coast", "Albury", "Wagga Wagga", "Port Macquarie", "Tamworth", "Orange", "Dubbo" },
                        ["Victoria"] = new List<string> { "Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton", "Latrobe City", "Albury-Wodonga", "Warrnambool", "Horsham", "Mildura" },
                        ["Queensland"] = new List<string> { "Brisbane", "Gold Coast", "Sunshine Coast", "Townsville", "Cairns", "Toowoomba", "Rockhampton", "Mackay", "Bundaberg", "Hervey Bay" },
                        ["Western Australia"] = new List<string> { "Perth", "Mandurah", "Bunbury", "Kalgoorlie", "Geraldton", "Albany", "Busselton", "Broome", "Port Hedland", "Carnarvon" },
                        ["South Australia"] = new List<string> { "Adelaide", "Mount Gambier", "Whyalla", "Murray Bridge", "Port Lincoln", "Port Pirie", "Victor Harbor", "Gawler", "Port Augusta", "Kadina" },
                        ["Tasmania"] = new List<string> { "Hobart", "Launceston", "Devonport", "Burnie", "Somerset", "Wynyard", "New Norfolk", "George Town", "Smithton", "Queenstown" },
                        ["Australian Capital Territory"] = new List<string> { "Canberra", "Queanbeyan", "Gungahlin", "Tuggeranong", "Belconnen", "Woden", "Molonglo Valley" },
                        ["Northern Territory"] = new List<string> { "Darwin", "Alice Springs", "Palmerston", "Katherine", "Nhulunbuy", "Tennant Creek", "Jabiru", "Pine Creek", "Mataranka", "Borroloola" }
                    },

                    ["MX"] = new Dictionary<string, List<string>>
                    {
                        ["Aguascalientes"] = new List<string> { "Aguascalientes", "Calvillo", "Rincón de Romos", "Jesús María", "Pabellón de Arteaga" },
                        ["Baja California"] = new List<string> { "Tijuana", "Mexicali", "Ensenada", "Tecate", "Rosarito", "San Felipe" },
                        ["Baja California Sur"] = new List<string> { "La Paz", "Los Cabos", "Cabo San Lucas", "San José del Cabo", "Ciudad Constitución", "Loreto" },
                        ["Campeche"] = new List<string> { "Campeche", "Ciudad del Carmen", "Champotón", "Escárcega", "Calkiní" },
                        ["Chiapas"] = new List<string> { "Tuxtla Gutiérrez", "San Cristóbal de las Casas", "Tapachula", "Comitán", "Palenque", "Ocosingo" },
                        ["Chihuahua"] = new List<string> { "Chihuahua", "Ciudad Juárez", "Delicias", "Parral", "Nuevo Casas Grandes", "Cuauhtémoc" },
                        ["Coahuila"] = new List<string> { "Saltillo", "Torreón", "Monclova", "Piedras Negras", "Acuña", "Sabinas" },
                        ["Colima"] = new List<string> { "Colima", "Manzanillo", "Tecomán", "Villa de Álvarez", "Armería" },
                        ["Durango"] = new List<string> { "Durango", "Gómez Palacio", "Lerdo", "Santiago Papasquiaro", "Guadalupe Victoria" },
                        ["Guanajuato"] = new List<string> { "León", "Irapuato", "Celaya", "Salamanca", "Guanajuato", "Pénjamo", "San Miguel de Allende" },
                        ["Guerrero"] = new List<string> { "Acapulco", "Chilpancingo", "Iguala", "Taxco", "Zihuatanejo", "Tlapa" },
                        ["Hidalgo"] = new List<string> { "Pachuca", "Tulancingo", "Tizayuca", "Huejutla", "Ixmiquilpan", "Actopan" },
                        ["Jalisco"] = new List<string> { "Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá", "Puerto Vallarta", "Tlajomulco", "Tepatitlán" },
                        ["Mexico State"] = new List<string> { "Toluca", "Ecatepec", "Naucalpan", "Nezahualcóyotl", "Tlalnepantla", "Chimalhuacán", "Cuautitlán Izcalli" },
                        ["Mexico City"] = new List<string> { "Mexico City", "Álvaro Obregón", "Gustavo A. Madero", "Iztapalapa", "Tlalpan", "Coyoacán" },
                        ["Michoacán"] = new List<string> { "Morelia", "Uruapan", "Zamora", "Lázaro Cárdenas", "Apatzingán", "Zitácuaro" },
                        ["Morelos"] = new List<string> { "Cuernavaca", "Jiutepec", "Temixco", "Cuautla", "Yautepec", "Emiliano Zapata" },
                        ["Nayarit"] = new List<string> { "Tepic", "Bahía de Banderas", "Santiago Ixcuintla", "Compostela", "Acaponeta" },
                        ["Nuevo León"] = new List<string> { "Monterrey", "Guadalupe", "San Nicolás de los Garza", "Apodaca", "Santa Catarina", "Escobedo" },
                        ["Oaxaca"] = new List<string> { "Oaxaca de Juárez", "Salina Cruz", "Tuxtepec", "Juchitán", "Huajuapan de León", "Puerto Escondido" },
                        ["Puebla"] = new List<string> { "Puebla", "Tehuacán", "San Martín Texmelucan", "Atlixco", "San Pedro Cholula", "Amozoc" },
                        ["Querétaro"] = new List<string> { "Santiago de Querétaro", "San Juan del Río", "Corregidora", "El Marqués", "Tequisquiapan" },
                        ["Quintana Roo"] = new List<string> { "Cancún", "Chetumal", "Playa del Carmen", "Cozumel", "Tulum", "Felipe Carrillo Puerto" },
                        ["San Luis Potosí"] = new List<string> { "San Luis Potosí", "Soledad de Graciano Sánchez", "Ciudad Valles", "Matehuala", "Rioverde" },
                        ["Sinaloa"] = new List<string> { "Culiacán", "Mazatlán", "Los Mochis", "Guasave", "Navolato", "Guamúchil" },
                        ["Sonora"] = new List<string> { "Hermosillo", "Ciudad Obregón", "Nogales", "San Luis Río Colorado", "Navojoa", "Guaymas" },
                        ["Tabasco"] = new List<string> { "Villahermosa", "Cárdenas", "Comalcalco", "Huimanguillo", "Macuspana", "Centla" },
                        ["Tamaulipas"] = new List<string> { "Ciudad Victoria", "Reynosa", "Matamoros", "Nuevo Laredo", "Tampico", "Altamira" },
                        ["Tlaxcala"] = new List<string> { "Tlaxcala", "Apizaco", "Huamantla", "San Pablo del Monte", "Chiautempan" },
                        ["Veracruz"] = new List<string> { "Veracruz", "Xalapa", "Coatzacoalcos", "Córdoba", "Poza Rica", "Orizaba", "Minatitlán" },
                        ["Yucatán"] = new List<string> { "Mérida", "Kanasín", "Valladolid", "Progreso", "Tizimín", "Motul" },
                        ["Zacatecas"] = new List<string> { "Zacatecas", "Fresnillo", "Guadalupe", "Jerez", "Río Grande", "Sombrerete" }
                    },

                    ["DE"] = new Dictionary<string, List<string>>
                    {
                        ["Vienna"] = new List<string> {
                        "Vienna"
                    },

                        ["Lower Austria"] = new List<string> {
                        "Sankt Pölten",
                        "Wiener Neustadt",
                        "Krems an der Donau",
                        "Klosterneuburg",
                        "Baden",
                        "Mödling",
                        "Schwechat",
                        "Amstetten",
                        "Stockerau",
                        "Traiskirchen",
                        "Tulln an der Donau",
                        "Perchtoldsdorf",
                        "Gänserndorf",
                        "Neunkirchen",
                        "Purkersdorf",
                        "Korneuburg",
                        "Laa an der Thaya",
                        "Bad Vöslau"
                    },

                        ["Upper Austria"] = new List<string> {
                        "Linz",
                        "Wels",
                        "Steyr",
                        "Leonding",
                        "Traun",
                        "Ansfelden",
                        "Marchtrenk",
                        "Braunau am Inn",
                        "Gmunden",
                        "Ried im Innkreis",
                        "Vöcklabruck",
                        "Enns",
                        "Schärding",
                        "Bad Ischl",
                        "Freistadt",
                        "Eferding"
                    },

                        ["Styria"] = new List<string> {
                        "Graz",
                        "Leoben",
                        "Kapfenberg",
                        "Bruck an der Mur",
                        "Feldbach",
                        "Knittelfeld",
                        "Voitsberg",
                        "Judenburg",
                        "Weiz",
                        "Deutschlandsberg",
                        "Liezen",
                        "Hartberg",
                        "Murau",
                        "Radkersburg",
                        "Fürstenfeld",
                        "Frohnleiten"
                    },
                        ["Tyrol"] = new List<string> {
                        "Innsbruck",
                        "Kufstein",
                        "Telfs",
                        "Hall in Tirol",
                        "Wörgl",
                        "Schwaz",
                        "Lienz",
                        "Imst",
                        "Rum",
                        "Reutte",
                        "Jenbach",
                        "Zirl"
                    },

                        ["Carinthia"] = new List<string> {
                        "Klagenfurt am Wörthersee",
                        "Villach",
                        "Wolfsberg",
                        "Spittal an der Drau",
                        "Völkermarkt",
                        "Feldkirchen in Kärnten",
                        "Sankt Veit an der Glan",
                        "Ferlach",
                        "Hermagor",
                        "Friesach",
                        "Althofen",
                        "Radenthein"
                    },

                        ["Salzburg"] = new List<string> {
                        "Salzburg",
                        "Hallein",
                        "Saalfelden am Steinernen Meer",
                        "Zell am See",
                        "Bischofshofen",
                        "Wals-Siezenheim",
                        "Seekirchen am Wallersee",
                        "Neumarkt am Wallersee",
                        "Mittersill",
                        "Tamsweg",
                        "Oberndorf bei Salzburg"
                    },

                        ["Burgenland"] = new List<string> {
                        "Eisenstadt",
                        "Rust",
                        "Mattersburg",
                        "Neusiedl am See",
                        "Oberwart",
                        "Güssing",
                        "Jennersdorf",
                        "Oberpullendorf",
                        "Pinkafeld",
                        "Deutschkreutz",
                        "Stadtschlaining"
                    },

                        ["Vorarlberg"] = new List<string> {
                        "Dornbirn",
                        "Feldkirch",
                        "Bregenz",
                        "Hohenems",
                        "Bludenz",
                        "Lustenau",
                        "Rankweil",
                        "Götzis",
                        "Hard",
                        "Wolfurt",
                        "Altach"
                    }


                    },

                    ["AT"] = new Dictionary<string, List<string>>
                    {
                        ["Vienna"] = new List<string> {
                        "Vienna"
                    },

                        ["Lower Austria"] = new List<string> {
                        "Sankt Pölten",
                        "Wiener Neustadt",
                        "Krems an der Donau",
                        "Klosterneuburg",
                        "Baden",
                        "Amstetten",
                        "Schwechat",
                        "Mödling",
                        "Traiskirchen",
                        "Stockerau"
                    },

                        ["Upper Austria"] = new List<string> {
                        "Linz",
                        "Wels",
                        "Steyr",
                        "Leonding",
                        "Traun",
                        "Ansfelden",
                        "Braunau am Inn",
                        "Marchtrenk",
                        "Bad Ischl",
                        "Gmunden"
                    },

                        ["Styria"] = new List<string> {
                        "Graz",
                        "Leoben",
                        "Kapfenberg",
                        "Bruck an der Mur",
                        "Feldbach",
                        "Leibnitz",
                        "Knittelfeld",
                        "Gratwein-Straßengel",
                        "Seiersberg-Pirka"
                    },

                        ["Tyrol"] = new List<string> {
                        "Innsbruck",
                        "Kitzbühel",
                        "Kufstein",
                        "Lienz",
                        "Hall in Tirol"
                    },
                        ["Carinthia"] = new List<string> {
                        "Klagenfurt am Wörthersee",
                        "Villach",
                        "Wolfsberg",
                        "Spittal an der Drau",
                        "Völkermarkt",
                        "Feldkirchen",
                        "Bleiburg",
                        "Ferlach",
                        "Friesach",
                        "Sankt Veit an der Glan"
                    },

                        ["Salzburg"] = new List<string> {
                        "Salzburg",
                        "Hallein",
                        "Saalfelden am Steinernen Meer",
                        "Zell am See",
                        "Bischofshofen",
                        "Wals-Siezenheim",
                        "Seekirchen am Wallersee",
                        "Straßwalchen",
                        "Kuchl"
                    },

                        ["Burgenland"] = new List<string> {
                        "Eisenstadt",
                        "Rust",
                        "Sopron? (Hungarian twin)",
                        "Neusiedl am See",
                        "Güssing",
                        "Jennersdorf",
                        "Mattersburg",
                        "Oberwart",
                        "Bad Tatzmannsdorf",
                        "Oberpullendorf"
                    },

                        ["Vorarlberg"] = new List<string> {
                        "Dornbirn",
                        "Feldkirch",
                        "Bregenz",
                        "Hohenems",
                        "Bludenz"
                    }


                    },

                    ["ZA"] = new Dictionary<string, List<string>>
                    {
                        ["Gauteng"] = new List<string> {
        "Alexandra", "Diepsloot", "Ennerdale", "Johannesburg", "Lenasia", "Makaka Town",
        "Modderfontein", "Orange Farm", "Randburg", "Roodepoort", "Sandton", "Soweto",
        "Naturena", "Alberton", "Bedfordview", "Benoni", "Boksburg", "Brakpan",
        "Bapsfontein", "Clayville", "Daveyton", "Duduza", "Edenvale", "Etwatwa",
        "Germiston", "Isando", "Katlehong", "Kempton Park", "KwaThema", "Dunnottar",
        "Nigel", "Reiger Park", "Springs", "Thembisa", "Thokoza", "Tsakane",
        "Vosloorus", "Wattville", "Atteridgeville", "Bronberg", "Bronkhorstspruit",
        "Centurion", "Cullinan", "Ekangala", "Ga-Rankuwa", "Hammanskraal", "Irene",
        "Mabopane", "Mamelodi", "Pretoria", "Rayton", "Refilwe", "Soshanguve",
        "Winterveld", "Zithobeni", "Bekkersdal", "Westonaria", "Simunye", "Borwa",
        "Carletonville", "Krugersdorp", "Heidelberg", "Vereeniging", "Vanderbijlpark",
        "Sebokeng", "Ratanda", "Sharpeville", "Boipatong", "Bophelong", "Evaton"
    },

                        ["Western Cape"] = new List<string> {
        "Cape Town", "Bellville", "Paarl", "Stellenbosch", "George", "Mossel Bay",
        "Knysna", "Plettenberg Bay", "Oudtshoorn", "Worcester", "Caledon", "Hermanus",
        "Swellendam", "Robertson", "Tulbagh", "Ceres", "Wellington", "Malmesbury",
        "Saldanha", "Vredenburg", "Langebaan", "Hopefield", "Vredendal", "Clanwilliam",
        "Vanrhynsdorp", "Springbok", "Calvinia", "Carnarvon", "Fraserburg", "Sutherland",
        "Laingsburg", "Prince Albert", "Beaufort West", "Murraysburg", "Graaff-Reinet",
        "Aberdeen", "Willowmore", "Steytlerville", "Jansenville", "Pearston", "Somerset East",
        "Fish Hoek", "Muizenberg", "Khayelitsha", "Mitchells Plain", "Athlone", "Goodwood",
        "Parow", "Elsies River", "Bishop Lavis", "Delft", "Maitland", "Wynberg", "Claremont",
        "Rondebosch", "Newlands", "Observatory", "Woodstock", "Salt River", "Camps Bay",
        "Sea Point", "Green Point", "V&A Waterfront", "Hout Bay", "Constantia", "Tokai"
    },

                        ["KwaZulu-Natal"] = new List<string> {
        "Durban", "Pietermaritzburg", "Newcastle", "Ladysmith", "Dundee", "Glencoe",
        "Vryheid", "Ulundi", "Eshowe", "Empangeni", "Richards Bay", "Mtubatuba",
        "Hluhluwe", "Mkhuze", "Jozini", "Pongola", "Paulpietersburg", "Utrecht",
        "Dannhauser", "Estcourt", "Bergville", "Winterton", "Colenso", "Weenen",
        "Mooi River", "Nottingham Road", "Howick", "Hilton", "Richmond", "Ixopo",
        "Underberg", "Himeville", "Bulwer", "Kokstad", "Mount Currie", "Creighton",
        "Harding", "Izingolweni", "Port Shepstone", "Margate", "Ramsgate", "Southbroom",
        "Scottburgh", "Amanzimtoti", "Chatsworth", "Pinetown", "Westville", "Kloof",
        "Hillcrest", "Gillitts", "Assagay", "Cato Ridge", "Camperdown", "Drummond",
        "Dalton", "Greytown", "Kranskop", "Stanger", "Verulam", "Phoenix", "Inanda",
        "Umlazi", "Kwa-Mashu", "Ntuzuma", "Newlands East", "Lamontville", "Isipingo",
        "Chatsworth", "Clairwood", "Merebank", "Wentworth", "Mobeni", "Jacobs"
    },

                        ["Eastern Cape"] = new List<string> {
        "East London", "Port Elizabeth", "Uitenhage", "Despatch", "Kirkwood", "Addo",
        "Humansdorp", "Jeffreys Bay", "Steytlerville", "Willowmore", "Aberdeen",
        "Graaff-Reinet", "Middelburg", "Cradock", "Somerset East", "Adelaide",
        "Bedford", "Fort Beaufort", "Alice", "Hogsback", "Cathcart", "Stutterheim",
        "King Williams Town", "Zwelitsha", "Mdantsane", "Berlin", "Potsdam", "Bhisho",
        "Bisho", "Dimbaza", "Ginsberg", "Duncan Village", "Gonubie", "Beacon Bay",
        "Nahoon", "Southernwood", "Vincent", "Braelyn", "Amalinda", "Selborne",
        "Berea", "Arcadia", "Baysville", "Chiselhurst", "Greenfields", "Nahoon Valley",
        "Bonnie Doon", "Bunkers Hill", "Cambridge", "Dorchester Heights", "Gonubie Hills",
        "Haven Hills", "Loerie Park", "Nahoon Mouth", "Parkridge", "Quigney",
        "Reeston", "Stirling", "Sunnyridge", "Umtiza", "University", "Vincent Heights",
        "Grahamstown", "Makhanda", "Port Alfred", "Kenton-on-Sea", "Alexandria",
        "Bathurst", "Salem", "Riebeeck East", "Alicedale", "Mthatha", "Umtata",
        "Butterworth", "Idutywa", "Willowvale", "Centane", "Elliotdale", "Mqanduli"
    },

                        ["Free State"] = new List<string> {
        "Bloemfontein", "Welkom", "Kroonstad", "Bethlehem", "Sasolburg", "Parys",
        "Potchefstroom", "Klerksdorp", "Virginia", "Odendaalsrus", "Hennenman",
        "Allanridge", "Theunissen", "Winburg", "Brandfort", "Dewetsdorp", "Reddersburg",
        "Edenburg", "Fauresmith", "Jagersfontein", "Koffiefontein", "Luckhoff",
        "Philippolis", "Petrusburg", "Springfontein", "Trompsburg", "Zastron",
        "Rouxville", "Smithfield", "Aliwal North", "Burgersdorp", "Venterstad",
        "Steynsburg", "Hofmeyr", "Noupoort", "Colesberg", "Norvalspont", "De Aar",
        "Hanover", "Richmond", "Victoria West", "Hutchinson", "Carnarvon", "Williston",
        "Calvinia", "Brandvlei", "Kenhardt", "Upington", "Keimoes", "Kakamas",
        "Augrabies", "Groblershoop", "Postmasburg", "Kathu", "Kuruman", "Hotazel",
        "Phuthaditjhaba", "Qwa-Qwa", "Harrismith", "Kestell", "Clarens", "Fouriesburg",
        "Ficksburg", "Clocolan", "Marquard", "Senekal", "Paul Roux", "Lindley"
    },

                        ["Limpopo"] = new List<string> {
        "Polokwane", "Thohoyandou", "Lebowakgomo", "Musina", "Tzaneen", "Mokopane",
        "Bela-Bela", "Modimolle", "Thabazimbi", "Lephalale", "Ellisras", "Vaalwater",
        "Naboomspruit", "Pietersburg", "Seshego", "Mankweng", "Ga-Kgapane", "Duiwelskloof",
        "Haenertsburg", "Magoebaskloof", "Giyani", "Malamulele", "Hoedspruit", "Phalaborwa",
        "Burgersfort", "Steelpoort", "Lydenburg", "Dullstroom", "Mashishing", "Pilgrim's Rest",
        "Sabie", "Graskop", "Hazyview", "White River", "Barberton", "Nelspruit", "Mbombela",
        "Komatipoort", "Malelane", "Hectorspruit", "Marloth Park", "Crocodile Bridge",
        "Skukuza", "Pretoriuskop", "Berg-en-Dal", "Maroela", "Orpen", "Satara", "Olifants",
        "Letaba", "Mopani", "Shingwedzi", "Punda Maria", "Pafuri", "Crook's Corner",
        "Messina", "Pontdrif", "Mapungubwe", "Alldays", "Dendron", "Potgietersrus",
        "Moria", "Boyne", "Chuniespoort", "Marble Hall", "Groblersdal", "Jane Furse",
        "Sekhukhune", "Praktiseer", "Roossenekal", "Stoffberg", "Ohrigstad"
    },

                        ["Mpumalanga"] = new List<string> {
        "Mbombela", "Nelspruit", "White River", "Hazyview", "Sabie", "Graskop",
        "Pilgrim's Rest", "Lydenburg", "Mashishing", "Dullstroom", "Belfast",
        "Machadodorp", "Waterval Boven", "Waterval Onder", "Schoemanskloof",
        "Bergendal", "Kaapsehoop", "Barberton", "Kaapmuiden", "Malelane", "Komatipoort",
        "Hectorspruit", "Marloth Park", "Crocodile Bridge", "Tonga", "Jeppe's Reef",
        "Nsikazi", "Kanyamazane", "KaBokweni", "Matsulu", "Tekwane", "Calcutta",
        "Malalane", "Riverside", "Legogote", "Kiepersol", "Karino", "Ngodwana",
        "Kaapschehoop", "Badplaas", "Amsterdam", "Carolina", "Ermelo", "Volksrust",
        "Wakkerstroom", "Standerton", "Bethal", "Govan Mbeki", "Secunda", "Trichardt",
        "Evander", "Kinross", "Leslie", "Grootvlei", "Balfour", "Delmas", "Bronkhorstspruit",
        "Emalahleni", "Witbank", "Middelburg", "Hendrina", "Komati", "Steve Tshwete",
        "Pullenshope", "Ogies", "Kriel", "Kendal", "Clewer", "Emakhazeni"
    },

                        ["North West"] = new List<string> {
        "Mahikeng", "Mafikeng", "Rustenburg", "Klerksdorp", "Potchefstroom", "Brits",
        "Vryburg", "Lichtenburg", "Schweizer-Reneke", "Wolmaransstad", "Bloemhof",
        "Christiana", "Barkly West", "Warrenton", "Kimberley", "Kuruman", "Kathu",
        "Postmasburg", "Hotazel", "Groblershoop", "Upington", "Keimoes", "Kakamas",
        "Augrabies", "Olifantshoek", "Sishen", "Deben", "Kathu", "Danielskuil",
        "Lime Acres", "Postmasburg", "Tsantsabane", "Beeshoek", "Black Rock",
        "Bankhara-Bodulong", "Ga-Segonyana", "Kuruman", "Mothibistad", "Kudumane",
        "Santoy", "Dingleton", "Wrenchville", "Mapoteng", "Bothithong", "Logageng",
        "Mmabatho", "Montshiwa", "Lotlhakane", "Mogwase", "Madibeng", "Hartbeespoort",
        "Broederstroom", "Kosmos", "Schoemansville", "Ifafi", "Melodie", "Letlhabile",
        "Zeerust", "Groot Marico", "Swartruggens", "Koster", "Derby", "Sannieshof",
        "Delareyville", "Ottosdal", "Hartbeesfontein", "Tigane", "Ganyesa", "Stella"
    },

                        ["Northern Cape"] = new List<string> {
        "Kimberley", "Upington", "Kuruman", "De Aar", "Springbok", "Alexander Bay",
        "Port Nolloth", "Kleinzee", "Koingnaas", "McDougall's Bay", "Hondeklipbaai",
        "Kamieskroon", "Garies", "Vanrhynsdorp", "Niewoudtville", "Calvinia", "Brandvlei",
        "Kenhardt", "Pofadder", "Aggeneys", "Onseepkans", "Vioolsdrif", "Goodhouse",
        "Steinkopf", "Kuboes", "Lekkersing", "Eksteenfontein", "Sanddrift", "Richtersveld",
        "Orange River", "Augrabies", "Kakamas", "Keimoes", "Groblershoop", "Upington",
        "Askham", "Rietfontein", "Andriesvale", "Twee Rivieren", "Mata-Mata", "Nossob",
        "Welkom", "Barkly West", "Warrenton", "Jan Kempdorp", "Hartswater", "Pampierstad",
        "Taung", "Reivilo", "Tosca", "Ganspan", "Windsorton", "Delportshoop", "Boshof",
        "Hertzogville", "Dealesville", "Koffiefontein", "Jacobsdal", "Petrusville",
        "Britstown", "Hanover", "Richmond", "Victoria West", "Loxton", "Carnarvon",
        "Williston", "Fraserburg", "Sutherland", "Laingsburg", "Prince Albert", "Beaufort West"
    }
                    }
                },
                CountryOnlyCities = new Dictionary<string, List<string>>
                {
                    ["AE"] = new List<string> { "Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Khor Fakkan" },

                    ["SA"] = new List<string> { "Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Tabuk", "Abha", "Buraidah", "Hail" },
                    ["EG"] = new List<string> { "Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez", "Luxor", "Asyut", "Ismailia", "Aswan" },
                    ["IL"] = new List<string> { "Jerusalem", "Tel Aviv", "Haifa", "Rishon LeZion", "Petah Tikva", "Ashdod", "Netanya", "Beer Sheva", "Holon", "Bnei Brak" },
                    ["IQ"] = new List<string> { "Baghdad", "Basra", "Mosul", "Erbil", "Karbala", "Najaf", "Kirkuk", "Sulaymaniyah", "Nasiriyah", "Amarah" },

                    ["OM"] = new List<string> { "Muscat", "Salalah", "Sohar", "Nizwa", "Sur", "Barka", "Ibri", "Rustaq" },

                    ["KW"] = new List<string> { "Kuwait City", "Al Ahmadi", "Hawally", "Salmiya", "Farwaniya", "Jahra", "Fahaheel" },

                    ["JO"] = new List<string> { "Amman", "Zarqa", "Irbid", "Aqaba", "Russeifa", "Salt", "Madaba", "Jerash" },

                    ["MA"] = new List<string> { "Casablanca", "Rabat", "Fes", "Marrakesh", "Tangier", "Agadir", "Oujda", "Kenitra", "Meknes" },

                    ["KE"] = new List<string> { "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Kitale" },

                    ["TN"] = new List<string> { "Tunis", "Sfax", "Sousse", "Kairouan", "Gabès", "Bizerte", "Ariana", "Gafsa" },

                    ["DZ"] = new List<string> { "Algiers", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Sétif", "Tlemcen" },

                    ["FR"] = new List<string> { "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux" },

                    ["GB"] = new List<string> { "London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Glasgow", "Edinburgh", "Bristol", "Sheffield", "Nottingham" },

                    ["NL"] = new List<string> { "Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Tilburg", "Groningen", "Breda", "Nijmegen" },

                    ["IT"] = new List<string> { "Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari" },

                    ["CZ"] = new List<string> { "Prague", "Brno", "Ostrava", "Plzeň", "Liberec", "Olomouc", "Ústí nad Labem", "Hradec Králové" },

                    ["BE"] = new List<string> { "Brussels", "Antwerp", "Ghent", "Charleroi", "Liège", "Bruges", "Namur", "Leuven" },

                    ["ES"] = new List<string> { "Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Murcia", "Palma", "Bilbao" },

                    ["PT"] = new List<string> { "Lisbon", "Porto", "Amadora", "Braga", "Coimbra", "Funchal", "Setúbal", "Almada" },

                    ["DK"] = new List<string> { "Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg" },

                    ["PL"] = new List<string> { "Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Szczecin", "Bydgoszcz" },

                    ["SE"] = new List<string> { "Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping" },

                    ["NO"] = new List<string> { "Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen", "Kristiansand", "Tromsø" },

                    ["IE"] = new List<string> { "Dublin", "Cork", "Limerick", "Galway", "Waterford", "Drogheda", "Dundalk" },

                    ["IS"] = new List<string> { "Reykjavik", "Kopavogur", "Hafnarfjordur", "Akureyri", "Reykjanesbær" },

                    ["HU"] = new List<string> { "Budapest", "Debrecen", "Szeged", "Miskolc", "Pécs", "Győr", "Nyíregyháza" },

                    ["RO"] = new List<string> { "Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța", "Craiova", "Brașov", "Galați" },

                    ["FI"] = new List<string> { "Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku", "Jyväskylä" },

                    ["SG"] = new List<string> { "Singapore" }, // City-state

                    ["KR"] = new List<string> { "Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Suwon", "Ulsan" },

                    ["JP"] = new List<string> { "Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kyoto", "Hiroshima", "Sendai" },

                    ["NZ"] = new List<string> { "Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Dunedin", "Palmerston North", "Napier" },

                    // Add more non-state countries as needed
                }
            };

            // Create a dictionary for quick lookup of states by CountryCode
            var statesByCountryCode = states.GroupBy(s => s.CountryCode)
                                            .ToDictionary(g => g.Key, g => g.ToList());

            foreach (var countryInfo in countries)
            {
                // Insert Country
                var country = new CountryMaster
                {
                    Name = countryInfo.CountryName,
                    Code = countryInfo.CountryCode,
                    HasStates = countryInfo.HasState,
                    CreatedOn = DateTime.UtcNow,
                    CreatedBy = systemAdminUserId,
                    UpdatedOn = DateTime.UtcNow,
                    UpdatedBy = systemAdminUserId,
                };

                await countryCollection.InsertOneAsync(country);

                if (country.HasStates)
                {
                    // Get the specific states for this country from our pre-defined list
                    if (statesByCountryCode.TryGetValue(country.Code, out var countryStates))
                    {
                        foreach (var stateInfo in countryStates)
                        {
                            var state = new StateMaster
                            {
                                Name = stateInfo.StateName,
                                CountryId = country.Id.ToString(), // Link to the newly inserted country
                                CreatedOn = DateTime.UtcNow,
                                CreatedBy = systemAdminUserId,
                                UpdatedOn = DateTime.UtcNow,
                                UpdatedBy = systemAdminUserId,
                            };
                            await stateCollection.InsertOneAsync(state);

                            if (locationHierarchy.CountryStateCities.TryGetValue(country.Code, out var stateCities))
                            {
                                if (stateCities.TryGetValue(stateInfo.StateName, out var citiesData))
                                {
                                    foreach (var city in citiesData)
                                    {
                                        var cityInsert = new CityMaster
                                        {
                                            Name = city, // Generic name
                                            CountryId = country.Id.ToString(),
                                            StateId = state.Id.ToString(),
                                            CreatedOn = DateTime.UtcNow,
                                            CreatedBy = systemAdminUserId,
                                            UpdatedOn = DateTime.UtcNow,
                                            UpdatedBy = systemAdminUserId,
                                        };
                                        await cityCollection.InsertOneAsync(cityInsert);
                                    }
                                }
                                else
                                {
                                    Console.WriteLine("No cities found for this state.");
                                }
                            }
                        }
                    }

                }
                else // Country does not have states
                {
                    // Get the specific cities for this country from our pre-defined list
                    if (locationHierarchy.CountryOnlyCities.TryGetValue(country.Code, out var countryCities))
                    {
                        foreach (var cityName in countryCities)
                        {
                            var city = new CityMaster
                            {
                                Name = cityName,
                                CountryId = country.Id.ToString(),
                                StateId = null, // No state for this country
                                CreatedOn = DateTime.UtcNow,
                                CreatedBy = systemAdminUserId,
                                UpdatedOn = DateTime.UtcNow,
                                UpdatedBy = systemAdminUserId,
                            };
                            await cityCollection.InsertOneAsync(city);
                        }
                    }
                }
            }
        }
    }
}