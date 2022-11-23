export const ALL_HEALTH_RESPONSE_SCHEMA = {
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
            "type": "object",
            "required":[
                "postgres"
            ],
            "properties":{
                "postgres":{
                    "type":"string"
                }
            }
        }
    }
};
