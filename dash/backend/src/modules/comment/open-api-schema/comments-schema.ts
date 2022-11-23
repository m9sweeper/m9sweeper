export const ALL_COMMENTS_RESPONSE_SCHEMA = {
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
                            "exceptionId",
                            "userId",
                            "content"
                        ],
                        "properties": {
                            "id": {
                                "type": "integer"
                            },
                            "exceptionId": {
                                "type": "string"
                            },
                            "userId": {
                                "type": "integer"
                            },
                            "content": {
                                "type": "string"
                            }
                        }
                    }
                ]
            }
        }
    }
};

export const CREATE_COMMENTS_RESPONSE_SCHEMA = {
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
                            "id"
                        ],
                        "properties": {
                            "id": {
                                "type": "integer"
                            }
                        }
                    }
                ]
            }
        }
    }
};

export const DELETE_COMMENT_RESPONSE_SCHEMA = {
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
                "id"
            ],
            "properties":{
                "id":{
                    "type": "number"
                }
            }
        }
    }
};

