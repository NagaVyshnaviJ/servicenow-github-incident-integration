(function process(request, response) {
    var payload = request.body.data;

    // Only run if the GitHub action is 'opened'
    if (payload.action == 'opened') {
        var incident = new GlideRecord('incident');
        incident.initialize();

        // Check if GitHub user exists in ServiceNow
        var grUser = new GlideRecord('sys_user');
        if (grUser.get('user_name', payload.sender.login)) {
            incident.caller_id = grUser.sys_id;
        } else {
            // Fallback to our System Property
            incident.caller_id = gs.getProperty('github.integration.default_caller_id');
        }

        incident.short_description = "GitHub Issue: " + payload.issue.title;
        incident.description = payload.issue.body;
        
        incident.insert();
        response.setStatus(201); // Created
    }
})(request, response);
