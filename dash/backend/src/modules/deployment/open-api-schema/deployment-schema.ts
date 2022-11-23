export const ALL_DEPLOYMENTS_RESPONSE_SCHEMA = {
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
                            "generation",
                            "creationTimestamp",
                            "compliant",
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
                            "generation": {
                                "type": "number"
                            },
                            "creationTimestamp": {
                                "type": "number"
                            },
                            "compliant": {
                                "type": "boolean"
                            },
                        }
                    }
                ]
            }
        }
    }
};

export const COUNT_ALL_DEPLOYMENT_RESPONSE_SCHEMA = {
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

export const DEPLOYMENT_SUMMARY_RESPONSE_SCHEMA = {
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
                            "count",
                            "compliant"
                        ],
                        "properties": {
                            "count": {
                                "type": "number"
                            },
                            "complaint": {
                                "type": "string"
                            }
                        }
                    }
                ]
            }
        }
    }
}
