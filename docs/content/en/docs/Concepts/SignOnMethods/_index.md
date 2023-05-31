## Sign On Methods
There are two types of external authorizion configurations available in M9.
OAuth and LDAP

## Azure OAuth2
This type of configuration requires first registering your application in the Azure portal to establish a trust relationship between your app and the Microsoft identity platform.
https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app

Once it is established, user can use the information from the Azure portal to setup in M9 Sign On Methods as following:

- Click on Add External Auth Configuration button
- Choose OAUTH2 as Auth Type
- Choose Azure as Provider Type
- Give it an Auth Name
- Client Id can be found in the Azure portal/ App registrations/  Your_App_Name/ Overview pane
- Authorization Url can be found in the Azure portal/ App registrations/ Your_App_Name/ Authentication pane/ Redirect URLs
- Access Scopes can be found in Azure portal/ lApp registrations/ Your_App_Name/ API permissions pane/ Configured permissions. Permissions should be separated by commas i.e. openid,profile,email
- select the Active checkbox and Submit
- The new user should be setup by default as a Read-only user and be able to login.




