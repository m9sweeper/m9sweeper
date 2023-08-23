export const GATEKEEPER_CONSTRAINT_TEMPLATE_BLUEPRINT_SCHEMA = {
  "type": "object",
  "required": ["template"],
  "properties": {
    "name": {
      "type": "string"
    },
    "dir": {
      "type": "string"
    },
    "subDir": {
      "type": "string"
    },
    "template": {
      "anyOf": [
        {
          "$ref": "gatekeeper-constraint-template.schema.ts/#GATEKEEPER_CONSTRAINT_TEMPLATE_SCHEMA"
        },
        {
          "type": "string"
        }
      ]
    }
  }
}

export const GATEKEEPER_CONSTRAINT_TEMPLATE_BLUEPRINT_ARRAY_SCHEMA = {
  "type": "array",
  "items": {
    "$ref": "#GATEKEEPER_CONSTRAINT_TEMPLATE_BLUEPRINT_SCHEMA",
  }
}
