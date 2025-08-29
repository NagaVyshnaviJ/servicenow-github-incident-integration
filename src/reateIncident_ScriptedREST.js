(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    gs.info("GitHub Webhook Payload Received: " + request.body.dataString);

    var payload = request.body.data;

    if (payload.action == 'opened') {

        try {
            var incident = new GlideRecord('incident');
            incident.initialize();

            // --- MODIFICATION START ---

            var githubUsername = payload.sender.login;
            var callerSysId = ''; // Initialize a variable to hold the caller's sys_id

            // 1. Attempt to find a user matching the GitHub username
            var grUser = new GlideRecord('sys_user');
            grUser.addQuery('user_name', githubUsername); // Querying the 'User ID' field
            grUser.query();

            if (grUser.next()) {
                // If we found a match, use that user's sys_id
                callerSysId = grUser.sys_id;
                gs.info('GitHub Integration: Found matching user: ' + githubUsername);
            } else {
                // 2. If no match, use the fallback System Property
                callerSysId = gs.getProperty('github.integration.default_caller_id');
                gs.info('GitHub Integration: User not found. Falling back to default user from system property.');
            }

            // Set the caller_id on the incident record
            if (callerSysId) {
                incident.caller_id = callerSysId;
            }

            // --- MODIFICATION END ---


            // Map fields from the GitHub issue to the ServiceNow incident
            incident.short_description = 'GitHub Issue: ' + payload.issue.title;
            incident.description = payload.issue.body;
            
            var workNotes = 'A new incident was created from a GitHub issue.\n';
            workNotes += 'Issue URL: ' + payload.issue.html_url + '\n';
            workNotes += 'Opened by GitHub user: ' + payload.sender.login;
            incident.work_notes = workNotes;

            // Set some default values for the incident
            incident.impact = '3';
            incident.urgency = '3';
            incident.assignment_group.setDisplayValue('Service Desk'); // Example of setting assignment group

            var incidentSysId = incident.insert();
            var incidentNumber = incident.number;

            response.setStatus(201); // 201 Created
            response.setBody({
                status: 'success',
                message: 'Incident created successfully',
                incident_number: incidentNumber,
                incident_sys_id: incidentSysId
            });

        } catch (e) {
            gs.error("Error creating incident from GitHub webhook: " + e);
            response.setStatus(500);
            response.setBody({
                status: 'error',
                message: 'Failed to create incident: ' + e.message
            });
        }

    } else {
        response.setStatus(200); // 200 OK
        response.setBody({
            status: 'ignored',
            message: 'Action was "' + payload.action + '", not "opened". No incident created.'
        });
    }

})(request, response);
