export const GATEKEEPER_SCHEMA = {
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
        "deletionGracePeriodSeconds": {
          "type": "string"
        },
        "deletionTimestamp": {
          "type": "string"
        },
        "finalizers": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "generateName": {
          "type": "string"
        },
        "generation": {
          "type": "number"
        },
        "labels": {
          "type": "object",
          "required": [],
          "description": "The object may have any labels"
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
              "subresource": {
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
        "namespace": {
          "type": "string"
        },
        "ownerReferences": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "apiVersion": {
                "type": "string"
              },
              "blockOwnerDeletion": {
                "type": "boolean"
              },
              "controller": {
                "type": "boolean"
              },
              "kind": {
                "type": "string"
              },
              "name": {
                "type": "string"
              },
              "uid": {
                "type": "string"
              },
            }
          }
        },
        "resourceVersion": {
          "type": "string"
        },
        "selfLink": {
          "type": "string"
        },
        "uid": {
          "type": "string"
        },
      }
    },
    "spec": {
      "type": "object",
      "required": [],
      "properties": {
        "caBundle": {
          "type": "string"
        },
        "group": {
          "type": "string"
        },
        "groupPriorityMinimum": {
          "type": "number"
        },
        "insecureSkipTLSVerify": {
          "type": "boolean"
        },
        "service": {
          "type": "object",
          "required": [],
          "properties": {
            "name": {
              "type": "string",
            },
            "namespace": {
              "type": "string",
            },
            "port": {
              "type": "string",
            },
          }
        },
        "version": {
          "type": "string"
        },
        "versionPriority": {
          "type": "number"
        },
      }
    },
    "status": {
      "type": "object",
      "required": [],
      "properties": {
        "conditions": {
          "type": "array",
          "items": {
            "type": "object",
            "required": [],
            "properties": {
              "lastTransitionTime": {
                "type": "string",
              },
              "message": {
                "type": "string",
              },
              "reason": {
                "type": "string",
              },
              "status": {
                "type": "string",
              },
              "type": {
                "type": "string",
              },
            }
          }
        }
      }
    },
  }
}
