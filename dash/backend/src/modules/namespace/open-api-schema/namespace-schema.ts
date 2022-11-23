export const ALL_NAMESPACES_RESPONSE_SCHEMA = {
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
                            "creationTimestamp",
                            "compliant",
                            "kubernetesImages",
                            "kubernetesPods"
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
                            "creationTimestamp": {
                                "type": "number"
                            },
                            "compliant": {
                                "type": "boolean"
                            },
                            "kubernetesImages": {
                                "type": "array",
                                "items": {
                                    "anyOf": [
                                        {
                                            "type": "object",
                                            "required": [
                                                "name"
                                            ],
                                            "properties": {
                                                "name": {
                                                    "type": "string"
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            "kubernetesPods": {
                                "type": "array",
                                "items": {
                                    "anyOf": [
                                        {
                                            "type": "object",
                                            "required": [
                                                "name"
                                            ],
                                            "properties": {
                                                "name": {
                                                    "type": "string"
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                ]
            }
        }
    }
};

export const COUNT_ALL_NAMESPACES_RESPONSE_SCHEMA = {
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
