export const GATEKEEPER_CONSTRAINT_TEMPLATE_SCHEMA = {
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
        "name": {
          "type": "string"
        }
      }
    },
    "spec": {
      "type": "object",
      "required": [],
      "properties": {
        "crd": {
          "type": "object",
          "required": [],
          "properties": {
            "spec": {
              "type": "object",
              "required": [],
              "properties": {
                "names": {
                  "type": "object",
                  "required": ["kind"],
                  "properties": {
                    "kind": {
                      "type": "string"
                    }
                  }
                },
                "validation": {
                  "type": "object",
                  "required": [],
                  "description": "The validation property may have any value"
                }
              }
            },
            "namespace": {
              "type": "string",
            },
            "port": {
              "type": "string",
            },
          }
        },
        "targets": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["target", "rego"],
            "properties": {
              "target": {
                "type": "string"
              },
              "rego": {
                "type": "string"
              }
            }
          }
        },
      }
    },
    "constraintsCount": {
      "type": "number"
    },
    "enforced": {
      "type": "boolean"
    },
    "constraints": {
      "type": "array",
      "items": {
        "$ref": "gatekeeper-constraint.schema.ts/#GATEKEEPER_CONSTRAINT_SCHEMA"
      }
    },
  }
}

export const GATEKEEPER_CONSTRAINT_TEMPLATE_ARRAY_SCHEMA = {
  "type": "array",
  "items": {
    "$ref": "#GATEKEEPER_CONSTRAINT_TEMPLATE_SCHEMA",
  }
}

export const GATEKEEPER_CONSTRAINT_TEMPLATE_DEPLOY_SCHEMA = {
  "type": "object",
  "required": ["successfullyDeployed", "unsuccessfullyDeployed"],
  "properties": {
    "successfullyDeployed": {
      "type": "array",
      "description": "An array containing the names of the successfully-deployed constraint templates",
      "items": {
        "type": "string"
      }
    },
    "unsuccessfullyDeployed": {
      "type": "array",
      "description": "An array containing the names of the failed constraint templates",
      "items": {
        "type": "string"
      }
    }
  }
}

export const GATEKEEPER_CONSTRAINT_TEMPLATE_DEPLOY_FAILED_SCHEMA = {
  "type": "array",
  "items": {
    "type": "object",
    "required": ["reason", "templateName"],
    "properties": {
      "reason": {
        "type": "string"
      },
      "templateName": {
        "type": "string"
      }
    }
  }
}

export const GATEKEEPER_CONSTRAINT_TEMPLATE_BY_NAME_SCHEMA = {
  "type": "object",
  "required": ["template", "rawConstraintTemplate"],
  "properties": {
    "associatedConstraints": {
      "type": "array",
      "items": {
        "$ref": "gatekeeper-constraint.schema.ts/#GATEKEEPER_CONSTRAINT_SCHEMA"
      }
    },
    "template": {
      "$ref": "#GATEKEEPER_CONSTRAINT_TEMPLATE_SCHEMA"
    },
    "rawConstraintTemplate": {
      "type": "string"
    }
  }
}
