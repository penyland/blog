Title: Azure App Service to Azure App Service using Managed Identities and Application Roles
Tags:
    - .NET
    - C#
    - Azure
    - DevOps
    - ARM
    - Bicep
Author: penyland
Description: A tale of passion and code! And beer and heavy metal!
Published: 2024-02-18
---
# Introduction
This post is the first in a series of posts about using managed identities and application roles to secure access to Azure resources. In this post, we will walk through the process of granting application permissions to a managed identity's Service Principal. This allows the managed identity to access APIs with the necessary permissions.
In the second post, we will look at how to use the access token to access an Azure App Service API with authentication enabled.
In the final post, we will write a console application that can automate the process of granting application permissions to a managed identity's Service Principal.


# Managed Identities and Application Roles
In this post, we will walk through the process of granting application permissions to a managed identity's Service Principal. This allows the managed identity to access APIs with the necessary permissions.

Using managed identities improves security because you don't have to manually manage client secrets or client certificates. These credentials are automatically handled by Azure, reducing the risk of exposing sensitive information.
Managed identities can be easily assigned RBAC roles, allowing secure access to various Azure resources such as Storage Accounts. This can be done through the Azure portal or using tools like Bicep.
However, managed identities can also be assigned application roles that are defined on an Azure app registration. Setting up these role assignments is a bit more complex because there is currently no way to manage them in the Azure Portal GUI. While you can verify the permissions, you cannot add or remove them directly.
To assign the necessary roles to the managed identity, you can use the [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer?tenant=YourTenant.onmicrosoft.com).

## Step 1: Obtaining an Access Token
To access an Azure App Service API with authentication enabled, you need to obtain an access token for the managed identity. This section provides a simple example of how to retrieve the access token using the Azure.Identity package.

## Step 2: Granting Application Permissions
In this section, we will walk through the process of granting application permissions to the managed identity's Service Principal. This allows the managed identity to access APIs with the necessary permissions.


Prerequisites: An app registration has been created in Azure AD.

## Step 1: Obtain an access token
To obtain an access token for making authenticated calls to an Azure App Service, you can use the following code. This code utilizes the Azure.Identity NuGet package [Azure.Identity](https://www.nuget.org/packages/Azure.Identity/1.10.4).
        
``` csharp
using Azure.Core;

public async Task<AccessToken> GetAccessTokenAsync(string scope, CancellationToken cancellationToken = default)
{
    var tokenCredential = new DefaultAzureCredential();
    retun await tokenCredential.GetTokenAsync(new TokenRequestContext(new[] { $"{scopes}" }), cancellationToken);
}
```

To obtain an access token for a specific resource, you need to define the scope. The scope can be found or defined on the "Expose an API" tab of the app registration. Scopes for Azure resources are defined as `{applicationIdUri}/.default`, where the `.default` scope refers generically to the resource service (API) without specifying specific permissions.

For example, the scope for an Example API could be `api://a5ffaaf6-1234-497f-9438-3263daddf125/.default`.

Finally, call `DefaultAzureCredential.GetTokenAsync` with the appropriate context to retrieve an access token for the requested scope.

# Step 2: Granting the managed identity an application role

## Get all id's needed to assign role
To assign a role three id's are needed:
- The principal id of the managed identity
- The id of the application role defined on the app registration
- The unique id (object id) of the enterprise application that the app registration is associated with

###The principal id of the managed identity
The first thing we need to do is to find the Service Principal that represents the managed identity.
- For a user-assigned managed identity this is easy, just browse to the resource in the Azure Portal. See screenshot below:
![image.png](/.attachments/image-b308c910-2ac0-41c6-8e71-87ef6e861afa.png)
_Remember that the principalId is **not** the client id of the application._ 
- For a system-assigned managed identity you need to browse to the resource and then select the identity tab and make note of the Object (principal) ID.

- Using Graph Explorer we can run this query:
`GET https://graph.microsoft.com/v1.0/servicePrincipals?$search="displayName:id-exampleapi-dev-swe"&$count=true`
  
  _Don't forget that you must add ConsistencyLevel = eventual i Request Header to be able to run the search and count parameter._

Using PowerShell:
`$serverServicePrincipalObjectId = (Get-AzADServicePrincipal -Filter "DisplayName eq 'Example API'").Id`

###The id of the application role defined on the app registration
There a several ways to find the id of the role to assign i.e the appRoleId.
You can get it by either opening up the manifest and copy the id from there or get it by calling the graph api and from the response get the id:
`GET https://graph.microsoft.com/v1.0/applications/{724b763e-0801-4aa1-aea7-ef48e53fd71b}/appRoles`

Example response:

```json
{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#applications('%7B724b763e-0801-4aa1-aea7-ef48e53fd71b%7D')/appRoles",
    "value": [
        {
            "allowedMemberTypes": [
                "Application"
            ],
            "description": "Writer",
            "displayName": "Writer",
            "id": "7a94c279-44d3-4d68-9a14-a13cff46752b",
            "isEnabled": true,
            "origin": "Application",
            "value": "Writer"
        },
        {
            "allowedMemberTypes": [
                "User",
                "Application"
            ],
            "description": "Reader",
            "displayName": "Reader",
            "id": "15ed42e0-0351-47d3-b56c-55ff0382cd09",
            "isEnabled": true,
            "origin": "Application",
            "value": "reader"
        }
    ]
}
```

The appRoleId is the id from the response above.
The `appRoleId` we want in this example is: `724b763e-0801-4aa1-aea7-ef48e53fd71b`

###The unique id (object id) of the enterprise application that the app registration is associated with
The unique id (object id) of the service principal object associated with this application i.e the id of the enterprise application
For **Example API** this is: `592df628-c77e-47cf-89c8-1ac3a4260b5e`

This can be found using the appId from the app registration which is for **Example API**: `cf5243b3-c2cd-4b19-b056-1fb29b4dd566`

Run:
`GET https://graph.microsoft.com/v1.0/servicePrincipals?$filter=appId+eq+'cf5243b3-c2cd-4b19-b056-1fb29b4dd566'&$select=id,appId, displayName`

Example response:
``` json
{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#servicePrincipals(id,appId,displayName)",
    "value": [
        {
            "id": "592df628-c77e-47cf-89c8-1ac3a4260b5e",
            "appId": "cf5243b3-c2cd-4b19-b056-1fb29b4dd566",
            "displayName": "Example API"
        }
    ]
}
```

The id is equal to resourceId in the response above: `592df628-c77e-47cf-89c8-1ac3a4260b5e`

## Assign role to managed identity
Graph explorer:
POST https://graph.microsoft.com/v1.0/servicePrincipals/db088944-7dfe-4712-a1a0-0646841b1596/appRoleAssignments
Request body:
``` json
{
    "principalId": "db088944-7dfe-4712-a1a0-0646841b1596", 
    "resourceId": "592df628-c77e-47cf-89c8-1ac3a4260b5e",
    "appRoleId": "724b763e-0801-4aa1-aea7-ef48e53fd71b"
}
```

Using Azure CLI:
`az rest -m POST -u https://graph.microsoft.com/v1.0/servicePrincipals/db088944-7dfe-4712-a1a0-0646841b1596/appRoleAssignments -b '{\"principalId\": \"db088944-7dfe-4712-a1a0-0646841b1596\", \"resourceId\": \"592df628-c77e-47cf-89c8-1ac3a4260b5e\",\"appRoleId\": \"724b763e-0801-4aa1-aea7-ef48e53fd71b\"}'`

###List all permissions on app registration
`az ad app permission list --id cf5243b3-c2cd-4b19-b056-1fb29b4dd566`

### List role assignments for service principal
`az rest -m GET -u https://graph.microsoft.com/v1.0/servicePrincipals/db088944-7dfe-4712-a1a0-0646841b1596/appRoleAssignments`

The same can be done using [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer?tenant=YourTenant.onmicrosoft.com)
- Enter: GET https://graph.microsoft.com/v1.0/servicePrincipals/{db088944-7dfe-4712-a1a0-0646841b1596}/appRoleAssignments
- Run query

**Response:**
``` json
{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#servicePrincipals('%7Bdb088944-7dfe-4712-a1a0-0646841b1596%7D')/appRoleAssignments",
    "value": [
        {
            "id": "E2xDOLlUx0G1Vavh1U0Vd6Wmou8e2glJjQPuoU1iBTI",
            "deletedDateTime": null,
            "appRoleId": "724b763e-0801-4aa1-aea7-ef48e53fd71b",
            "createdDateTime": "2023-06-15T19:12:01.4601188Z",
            "principalDisplayName": "id-exampleapi-dev-swe",
            "principalId": "28cbfa90-6315-4a88-8a45-eddd9fb8251a",
            "principalType": "ServicePrincipal",
            "resourceDisplayName": "Example API",
            "resourceId": "592df628-c77e-47cf-89c8-1ac3a4260b5e"
        }
    ]
}
```

###Retrieve application properties
https://graph.microsoft.com/v1.0/applications/{724b763e-0801-4aa1-aea7-ef48e53fd71b}

724b763e-0801-4aa1-aea7-ef48e53fd71b = object id of the application

![image.png](/.attachments/image-98dbc9dc-bcf0-4f5a-91c8-812cef3e5fb6.png)

### Retrieve app roles for application
https://graph.microsoft.com/v1.0/applications/{724b763e-0801-4aa1-aea7-ef48e53fd71b}/appRoles

### Retrieve app id for application
https://graph.microsoft.com/v1.0/applications/{724b763e-0801-4aa1-aea7-ef48e53fd71b}/appId

##A great walkthrough can be read here:
https://gotoguy.blog/2022/03/15/add-graph-application-permissions-to-managed-identity-using-graph-explorer/
