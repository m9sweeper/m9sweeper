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
        "$ref": "gatekeeper-constraing.schema.ts/#GATEKEEPER_CONSTRAINT_SCHEMA"
      }
    },
  }
}
