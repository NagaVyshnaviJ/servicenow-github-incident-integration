# ServiceNow-GitHub Incident Integration 

This project provides a simple, yet powerful, integration to automatically create an incident in a ServiceNow instance whenever a new issue is opened in this GitHub repository.

This is achieved using a **GitHub Webhook** that sends a payload to a custom **Scripted REST API** endpoint in ServiceNow.

## Features 

* **Automatic Incident Creation**: New GitHub issues are instantly created as incidents.
* **Dynamic Caller Mapping**: The script attempts to map the GitHub user who opened the issue to a user in ServiceNow.
* **System Property Fallback**: If the GitHub user is not found in ServiceNow, the incident caller is set to a default user defined in a system property.
* **Traceability**: The created incident includes a direct link to the GitHub issue in its work notes.

## Prerequisites

* A ServiceNow instance (a free Personal Developer Instance works perfectly).
* Admin access to the ServiceNow instance.
* A GitHub repository where you can configure webhooks.

## Setup Instructions 

### 1. ServiceNow Configuration

#### A. Create Integration User

1.  Navigate to **User Administration > Users** and create a new user.
    * **User ID**: `github.user`
    * **Password**: Set a strong password.
    * Enable **Web service access only**.
2.  Assign the `rest_service` role to this user.
3.  Ensure the **Password needs reset** box is unchecked.

#### B. Create System Property

1.  Navigate to `sys_properties.list`.
2.  Create a new property:
    * **Name**: `github.integration.default_caller_id`
    * **Type**: `String`
    * **Value**: The `sys_id` of a default user to use as a fallback.

#### C. Create the Scripted REST API

1.  Navigate to **System Web Services > Scripted REST APIs** and create a new API.
    * **Name**: `GitHub Issue Integration`
2.  Under this API, create a new **Resource**.
    * **Name**: `Create Incident`
    * **HTTP Method**: `POST`
    * **Relative path**: `/incident`
3.  Use the code from `src/CreateIncident_ScriptedREST.js` for the script.
4.  On the **Security** tab of the resource, ensure **Requires authentication** is checked.

### 2. GitHub Configuration

1.  In your repository, go to **Settings > Webhooks**.
2.  Click **Add webhook**.
3.  Configure the webhook:
    * **Payload URL**: `https://<username>:<password>@<your-instance>.service-now.com/api/<your_api_namespace>/github_issue_integration/incident`
    * **Content type**: `application/json`
    * **Events**: Select "Let me select individual events" and check **Issues**.
4.  Save the webhook.

## Usage 

To test the integration, simply create a new issue in this repository. An incident should appear in your ServiceNow instance within seconds.
