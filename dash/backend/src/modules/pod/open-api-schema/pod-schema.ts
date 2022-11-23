export const ALL_PODS_RESPONSE_SCHEMA = {
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
                            "name",
                            "selfLink",
                            "uid",
                            "clusterId",
                            "resourceVersion",
                            "namespace",
                            "generateName",
                            "creationTimestamp",
                            "compliant",
                            "podStatus"
                        ],
                        "properties": {
                            "id": {
                                "type": "number"
                            },
                            "name": {
                                "type": "string"
                            },
                            "selfLink": {
                                "type": "string"
                            },
                            "uid": {
                                "type": "string"
                            },
                            "clusterId": {
                                "type": "number"
                            },
                            "resourceVersion": {
                                "type": "string"
                            },
                            "namespace": {
                                "type": "string"
                            },
                            "generateName": {
                                "type": "string"
                            },
                            "creationTimestamp": {
                                "type": "number"
                            },
                            "compliant": {
                                "type": "boolean"
                            },
                            "podStatus": {
                                "type": "string"
                            },
                        }
                    }
                ]
            }
        }
    }
};

export const COUNT_PODS_RESPONSE_SCHEMA = {
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
            "type": "number"
        }
    }
};
