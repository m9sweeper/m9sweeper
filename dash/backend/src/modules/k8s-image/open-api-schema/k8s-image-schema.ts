export const ALL_K8S_IMAGES_RESPONSE_SCHEMA = {
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
                            "image",
                            "deployment_name",
                            "namespace",
                            "compliant",
                        ],
                        "properties": {
                            "id": {
                                "type": "number"
                            },
                            "name": {
                                "type": "string"
                            },
                            "image": {
                                "type": "string"
                            },
                            "deploymentName": {
                                "type": "string"
                            },
                            "namespace": {
                                "type": "string"
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

export const COUNT_K8S_IMAGES_RESPONSE_SCHEMA = {
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
