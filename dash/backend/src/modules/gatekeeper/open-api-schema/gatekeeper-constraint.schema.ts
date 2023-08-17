export const GATEKEEPER_CONSTRAINT_SCHEMA = {
  "type": "object",
  "required": [],
  "properties": {
    "apiVersion": {
      "type": "string"
    },
    "kind": {
      "type": "string"
    },
    "metadata": {
      "type": "object",
      "required": [],
      "properties": {
        "annotations": {
          "type": "object",
          "required": [],
          "description": "The object may have any annotations"
        },
        "creationTimestamp": {
          "type": "string"
        },
        "generation": {
          "type": "number"
        },
        "managedFields": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "apiVersion": {
                "type": "string"
              },
              "fieldsType": {
                "type": "string"
              },
              "fieldsV1": {
                "type": "object",
                "required": [],
                "description": "There may be any fields"
              },
              "manager": {
                "type": "string"
              },
              "operation": {
                "type": "string"
              },
              "time": {
                "type": "string"
              },
            }
          }
        },
        "name": {
          "type": "string"
        },
        "resourceVersion": {
          "type": "string"
        },
        "selfLink": {
          "type": "string"
        },
        "uid": {
          "type": "string"
        }
      }
    },
    "spec": {
      "type": "object",
      "required": [],
      "properties": {
        "enforcementAction": {
          "type": "string"
        },
        "match": {
          "type": "object",
          "required": [],
          "properties": {
            "excludedNamespaces": {
              "type": "string",
            },
            "kinds": {
              "type": "array",
              "items": {
                "type": "object",
                "required": [],
                "description": "Any keys, with values that are string arrays"
              }
            }
          }
        },
        "parameters": {
          "type": "object",
          "required": [],
          "properties": {
            "cpu": {
              "type": "string"
            },
            "memory": {
              "type": "string"
            }
          }
        },
      }
    },
    "status": {
      "type": "object",
      "required": [],
      "properties": {
        "auditTimestamp": {
          "type": "string",
        },
        "byPod": {
          "type": "array",
          "items": {
            "type": "array",
            "required": [],
            "properties": {
              "constraintUid": {
                "type": "string"
              },
              "enforced": {
                "type": "boolean"
              },
              "id": {
                "type": "string"
              },
              "observedGeneration": {
                "type": "number"
              },
              "operations": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          }
        },
        "totalViolations": {
          "type": "number",
        },
        "violations": {
          "type": "array",
          "items": {
            "type": "object",
            "required": [],
            "properties": {
              "enforcementAction": {
                "type": "string",
              },
              "kind": {
                "type": "string",
              },
              "message": {
                "type": "string",
              },
              "name": {
                "type": "string",
              },
              "namespace": {
                "type": "string",
              },
            }
          }
        }
      }
    },
  }
}

export const GATEKEEPER_CONSTRAINT_ARRAY_SCHEMA = {
  "type": "array",
  "items": {
    "$ref": "#GATEKEEPER_CONSTRAINT_SCHEMA",
  }
}
