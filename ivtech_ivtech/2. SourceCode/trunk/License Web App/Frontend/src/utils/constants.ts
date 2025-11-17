export const LABELS = {
    // Dashboard_Preference_master: "Dashboard Preference Master",

    // User_master: "User Master",
    // Can_View_User:"Can View User",
    // Can_Add_Update_User:"Can Add Or Update User",
    // Can_Delete_USer:"Can Delete the User",

    // Role_master: "Role Master",
    // Can_View_Role: "Can View Role",
    // Can_Edit_Role: "Can Edit Role",
    // Can_Delete_Role:"Can Delete Role",
    // Can_Add_Or_Update_Role: "Can Add Or Update Role",

    // Role_Screen_Mapping_master: "Role Screen Mapping Master",
    // // Can_Add_Or_Update_Permission: "Can Add Or Update Role Screen",
    // Can_Add_Or_Update_Permission: "Can Add Or Update Permission",
    // Can_View_Permission: "Can View Permission",

    // Client_master: "Client Master",
    // Can_View_Client : "Can View Client",
    // Can_Add_Or_Update_Client: "Can Add Or Update Client",
    // Can_Delete_Client: "Can Delete the Client",

    // License_master: "License Master",
    // Can_View_License: "Can View License",
    // Can_Add_Or_Update_License: "Can Add Or Update License",

    // Change_Password: "Change Password",
       
    // Can_View_Role_Screen: "Can View Role Screen",
    // Can_Add_Or_Update_Role_Screen: "Can Add Or Update Role Screen",
    
    // Can_Add_Customer: "Can Add Customer",
    // Can_Update_Customer: "Can Update Customer",
    // Can_Delete_Customer: "Can Delete Customer",

    // Distributors_Master:"Distributor Master",
    // Can_View_Distributor:"Can View Distributor",
    // Can_Add_Or_Update_Distributor:"Can Add Or Update Distributor",
    // Can_Delete_the_Distributor:"Can Delete the Distributor",

    // Customer_License_Master:"Customer License Master",
    // Can_Generate_License:"Can Generate License",
    // Can_View_Customer:"Can View Customer",
    // Can_Add_Or_Update_Customer:"Can Add Or Update Customer",
    // Can_Delete_the_Customer:"Can Delete the Customer"

    User_master: "Users",
    Can_View_User: "View the list of users",
    Can_Add_Update_User: "Add or update user details",
    Can_Delete_USer: "Delete an existing user",

    Role_master: "Roles",
    Can_View_Role: "View the list of roles",
    Can_Add_Or_Update_Role: "Add or update role details",
    Can_Delete_Role: "Delete an existing role",

    Role_Screen_Mapping_master: "Permissions",
    Can_View_Permission: "View and update permissions for a specific role",

    Distributors_Master: "Distributors",
    Can_View_Distributor: "View the list of distributors",
    Can_Add_Or_Update_Distributor: "Add or update distributor details",
    Can_Delete_the_Distributor: "Delete an existing distributor",

    Customer_License_Master: "Customers & Licenses",
    Can_View_Customer: "View the list of customers",
    Can_Add_Or_Update_Customer: "Add or update customer details",
    Can_Delete_the_Customer: "Delete an existing customer",
    Can_View_License: "View license details",
    Can_Generate_License: "Generate or upgrade a license",
    Can_Download_License_File: "Download the license file",
    Can_Resend_License: "Resend the license email to the distributor",

    Change_Password: "Change Password",
  };
  

  export const SIDEBAR_TITLES = {
    Dashboard: "Dashboard",
    CustomerAndLicense:"Customers & Licenses",
    Distributors:"Distributors",

    UserManagement:"User Management",    
    Users:"Users",
    Roles:"Roles",
    Permissions:"Permissions",

    Profile: "Profile",
    WelcomePage: "Welcome back!"
  };

  export const REGEX ={
    Email_Regex : /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    // Allowed Characters: Letters (A-Z, a-z), numbers (0-9), underscores (_), and dots (.) only. 
    // Start & End: Must start with a letter and cannot start or end with _ or . 
    // No Consecutive _ or . (e.g., John..Doe is not allowed).
    UserName_Regex:/^(?!.*(?:\._|_\.)|.*\.\.|.*__)[a-zA-Z0-9._]+$/,

    // min length 3 to max length 20
    Name_Regex:/^[A-Za-z ]{3,20}$/,
    ZipCode_Regex:/^[a-zA-Z0-9]+$/,
    Mobile_Regex:/^\d{10}$/,
    MACAddress_Regex:/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
    IPAddess_Regex:/^((25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)|(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])))$/,
    Password_Regex:/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\d\s*]).{8,}$/,
    Role_Regex:/^[A-Za-z][A-Za-z0-9 _-]{2,29}$/

  }