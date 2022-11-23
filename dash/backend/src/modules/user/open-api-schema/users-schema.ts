export const ALL_USERS_RESPONSE_SCHEMA = {
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
                            "firstName",
                            "lastName",
                            "email",
                            "phone",
                            "profileImageFileId",
                            "authorities",
                            "sourceSystem"
                        ],
                        "properties": {
                            "id": {
                                "type": "integer"
                            },
                            "firstName": {
                                "type": "string"
                            },
                            "lastName": {
                                "type": "string"
                            },
                            "email": {
                                "type": "string"
                            },
                            "phone": {
                                "type": "string"
                            },
                            "profileImageFileId": {
                                "type": "string"
                            },
                            "authorities": {
                                "type": "array",
                                "items": {
                                    "anyOf": [
                                        {
                                            "type": "object",
                                            "required": [
                                                "type"
                                            ],
                                            "properties": {
                                                "type": {
                                                    "type": "string"
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            "sourceSystem": {
                                "type": "object",
                                "required": [
                                    "id",
                                    "type",
                                    "uid"
                                ],
                                "properties": {
                                    "id": {
                                        "type": "string"
                                    },
                                    "type": {
                                        "type": "string"
                                    },
                                    "uid": {
                                        "type": "string"
                                    }
                                }
                            }
                        }
                    }
                ]
            }
        }
    }
};
export const UPDATE_USER_RESPONSE_SCHEMA = {
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
        "data":  {
            "type": "object",
            "required": [
                "id",
                "firstName",
                "lastName",
                "email",
                "phone",
                "profileImageFileId",
                "authorities",
                "sourceSystem"
            ],
            "properties": {
                "id": {
                    "type": "integer"
                },
                "firstName": {
                    "type": "string"
                },
                "lastName": {
                    "type": "string"
                },
                "email": {
                    "type": "string"
                },
                "phone": {
                    "type": "string"
                },
                "profileImageFileId": {
                    "type": "string"
                },
                "authorities": {
                    "type": "array",
                    "items": {
                        "anyOf": [
                            {
                                "type": "object",
                                "required": [
                                    "type"
                                ],
                                "properties": {
                                    "type": {
                                        "type": "string"
                                    }
                                }
                            }
                        ]
                    }
                },
                "sourceSystem": {
                    "type": "object",
                    "required": [
                        "id",
                        "type",
                        "uid"
                    ],
                    "properties": {
                        "id": {
                            "type": "string"
                        },
                        "type": {
                            "type": "string"
                        },
                        "uid": {
                            "type": "string"
                        }
                    }
                }
            }

        }
    }
};
