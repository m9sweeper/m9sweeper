export const POLICY_ID_BY_CLUSTER_RESPONSE_SCHEMA = {
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
                "allOf": [
                    {
                        "type": "object",
                        "required": [
                            "id",
                            "name",
                            "groupId"
                        ],
                        "properties": {
                            "id": {
                                "type": "integer"
                            },
                            "name": {
                                "type": "string"
                            },
                            "groupId": {
                                "type": "integer"
                            }
                        }
                    }
                ]
            }
        }
    }
};
