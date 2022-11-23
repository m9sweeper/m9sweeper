export const IMAGE_SCAN_RESULTS_ISSUE_RESPONSE_SCHEMA = {
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
                        ],
                        "properties": {
                            "id": {
                                "type": "integer"
                            },
                            "imageResultsId": {
                                "type": "integer"
                            },
                            "scannerId": {
                                "type": "integer"
                            },
                            "name": {
                                "type": "string"
                            },
                            "type": {
                                "type": "string"
                            },
                            "severity": {
                                "type": "string"
                            },
                            "description": {
                                "type": "string"
                            },
                            "isCompliant": {
                                "type": "boolean"
                            },
                            "isFixable": {
                                "type": "boolean"
                            },
                            "wasFixed": {
                                "type": "boolean"
                            }
                        }
                    }
                ]
            }
        }
    }
};
