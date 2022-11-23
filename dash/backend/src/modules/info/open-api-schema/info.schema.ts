export const ALL_INFO_RESPONSE_SCHEMA = {
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
                 "appname",
                 "git_sha",
                 "build_date"
             ],
            "properties":{
                "appname":{
                    "type":"string"
                },
                "git_sha":{
                    "type":"string"
                },
                "build_date":{
                    "type":"string"
                }
            }
        }
    }
};

export const INFO_TEST_RESPONSE_SCHEMA = {
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
            "type": "boolean"
        }
    }
};
