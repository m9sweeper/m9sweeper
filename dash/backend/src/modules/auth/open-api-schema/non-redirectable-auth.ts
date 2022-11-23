export const LOCAL_AUTH_RESPONSE_SCHEMA = {
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
            "required": [
                "accessToken"
            ],
            "properties": {
                "accessToken": {
                    "type": "string"
                }
            }
        }
    }
};

export const LIST_AUTH_PROVIDER_RESPONSE_SCHEMA = {
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
                            "authName",
                            "authType",
                            "providerType",
                            "authConfig",
                            "isRedirectable",
                            "inSiteCredential",
                            "isActive"
                        ],
                        "properties": {
                            "id": {
                                "type": "integer"
                            },
                            "authName": {
                                "type": "string"
                            },
                            "authType": {
                                "type": "string"
                            },
                            "providerType": {
                                "type": "string"
                            },
                            "authConfig": {
                                "type": "object",
                                "required": [
                                    "clientId",
                                    "clientSecret",
                                    "accessTokenUri",
                                    "authorizationUri",
                                    "redirectUri",
                                    "scopes"
                                ],
                                "properties": {
                                    "clientId": {
                                        "type": "string",
                                    },
                                    "clientSecret": {
                                        "type": "string"
                                    },
                                    "accessTokenUri": {
                                        "type": "string"
                                    },
                                    "redirectUri": {
                                        "type": "string"
                                    },
                                    "scopes":{
                                        "type": "array",
                                        "items": {}
                                    }
                                },
                                "isRedirectable": {
                                    "type": "boolean"
                                },
                                "inSiteCredential": {
                                    "type": "boolean"
                                },
                                "isActive": {
                                    "type": "boolean"
                                }
                            }
                        }
                    }
                ]
            }
        }
    }
}

export const UPDATE_AUTH_RESPONSE_SCHEMA = {
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
