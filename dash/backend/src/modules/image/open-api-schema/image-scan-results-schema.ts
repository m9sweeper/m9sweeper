export const IMAGES_SCAN_RESULTS_RESPONSE_SCHEMA = {
    "type": "object",
    "required": [
        "success",
        "message",
        "data"
    ],
    "properties": {
        "success": {
            "type": "boolean"
        },
        "message": {
            "type": "string"
        },
        "data": {
            "type": "array",
            "items": {
                "anyOf": [
                    {
                        "type": "object",
                        "required": [
                            "id",
                            "scannerName",
                            "imageId",
                            "summary",
                            "scanResults",
                            "criticalIssues",
                            "majorIssues",
                            "mediumIssues",
                            "lowIssues",
                            "negligibleIssues",
                            "encounterError",
                            "policyId",
                            "policyStatus",
                            "startedAt",
                            "finishedAt"
                        ],
                        "properties": {
                            "id": {
                                "type": "number",
                            },
                            "scannerName": {
                                "type": "string"
                            },
                            "imageId": {
                                "type": "number",
                            },
                            "summary": {
                                "type": "string"
                            },
                            "scanResults": {
                                "type": "string",
                            },
                            "criticalIssues": {
                                "type": "number"
                            },
                            "majorIssues": {
                                "type": "number",
                            },
                            "mediumIssues": {
                                "type": "number"
                            },
                            "lowIssues": {
                                "type": "number",
                            },
                            "negligibleIssues": {
                                "type": "number"
                            },
                            "encounterError": {
                                "type": "number",
                            },
                            "policyId": {
                                "type": "number"
                            },
                            "policyStatus": {
                                "type": "boolean"
                            },
                            "startedAt": {
                                "type": "number"
                            },
                            "finishedAt": {
                                "type": "number",
                            }

                        }
                    }
                ]
            },

        }
    }
};
