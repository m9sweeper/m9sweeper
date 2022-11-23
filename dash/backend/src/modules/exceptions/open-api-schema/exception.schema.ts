export const LIST_ALL_EXCEPTIONS_RESPONSE_SCHEMA = {
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
                            "title",
                            "start_date",
                            "end_date",
                            "status"
                        ],
                        "properties": {
                            "id": {
                                "type": "integer"
                            },
                            "title": {
                                "type": "string"
                            },
                            "start_date": {
                                "type": "string"
                            },
                            "end_date": {
                                "type": "string"
                            },
                            "status": {
                                "type": "string"
                            }
                        }
                    }
                ]
            }
        }
    }
};

export const GET_SINGLE_EXCEPTIONS_RESPONSE_SCHEMA = {
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
                            "title",
                            "start_date",
                            "end_date",
                            "status",
                            "issueIdentifier",
                            "relevantForAllPolicies",
                            "relevantForAllKubernetesNamespaces",
                            "relevantForAllClusters",
                            "namespaces",
                            "policies",
                            "clusters",
                            "scanner"
                        ],
                        "properties": {
                            "id": {
                                "type": "integer"
                            },
                            "title": {
                                "type": "string"
                            },
                            "start_date": {
                                "type": "string"
                            },
                            "end_date": {
                                "type": "string"
                            },
                            "status": {
                                "type": "string"
                            },
                            "issueIdentifier": {
                                "type": "string"
                            },
                            "relevantForAllPolicies": {
                                "type": "boolean"
                            },
                            "relevantForAllKubernetesNamespaces": {
                                "type": "boolean"
                            },
                            "relevantForAllClusters": {
                                "type": "boolean"
                            },
                            "namespace": {
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
                            "policies": {
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
                                                    "type": "number"
                                                },
                                                "name": {
                                                    "type": "string"
                                                }
                                            }
                                        }
                                    ]
                                },
                            },
                            "clusters": {
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
                                                    "type": "number"
                                                },
                                                "name": {
                                                    "type": "string"
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            "scanner": {
                                "type": "object",
                                "required": [
                                    "id",
                                    "name"
                                ],
                                "properties": {
                                    "id": {
                                        "type": "number"
                                    },
                                    "name": {
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
}

export const CREATE_EXCEPTION_RESPONSE_SCHEMA = {
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
}

export const UPDATE_EXCEPTION_RESPONSE_SCHEMA = {
    "type": "object",
    "required": [
        "success",
        "message"
    ],
    "properties": {
        "success": {
            "type": "boolean"
        },
        "message": {
            "type": "string"
        }
    }
}
