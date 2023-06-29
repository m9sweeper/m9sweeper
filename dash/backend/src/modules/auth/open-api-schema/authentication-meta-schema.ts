export const AVAILABLE_AUTH_PROVIDER_RESPONSE_SCHEMA = {
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
                            "label",
                            "type",
                            "inSiteCredential",
                            "redirectable",
                            "requestHandlerPath"
                        ],
                        "properties": {
                            "id": {
                                "type": "integer"
                            },
                            "label": {
                                "type": "string"
                            },
                            "type": {
                                "type": "string",
                                "example": [ 'LOCAL/LDAP/OAUTH2' ]
                            },
                            "inSiteCredential": {
                                "type": "boolean"
                            },
                            "redirectable": {
                                "type": "boolean"
                            },
                            "requestHandlerPath": {
                                "type": "string"
                            }
                        }
                    }
                ]
            }
        }
    }
};
export const AUTH_VALIDATE_RESPONSE_SCHEMA =  {
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
            "type": "string"
        }
    }
};
export const AUTH_CHECK_LOGIN_STATUS_RESPONSE_SCHEMA =  {
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
              "logged_in",
            ],
            "properties": {
                "loggedIn": {
                    "type": "boolean"
                }
            }
        }
    }
};

export const AUTHORITY_LIST_RESPONSE_SCHEMA = {
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
                            "name"
                        ],
                        "properties": {
                            "id": {
                                "type": "integer"
                            },
                            "name": {
                                "type": "string"
                            }
                        }
                    }
                ]
            }
        }
    }
};

export const CHANGE_PASSWORD_RESPONSE_SCHEMA = {
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
