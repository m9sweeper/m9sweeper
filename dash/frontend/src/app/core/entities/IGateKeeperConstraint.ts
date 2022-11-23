export interface IGateKeeperConstraint {
  name?: string;
  uid?: string;
  creationTimestamp?: string;
  regos?: string[];
}

export interface IGatekeeperConstraintMetadataAnnotations {
  mode?: string;
  description?: string;
}

export interface IGatekeeperConstraintMetadata {
  name?: string;
  annotations?: IGatekeeperConstraintMetadataAnnotations;
  uid?: string;
  creationTimestamp?: string;
}

export interface IGatekeeperConstraintViolation {
  enforcementAction?: string;
  kind?: string;
  message?: string;
  name?: string;
  namespace?: string;
}

export interface IGatekeeperConstraintStatus {
  auditTimestamp?: string;
  totalViolations?: number;
  violations?: IGatekeeperConstraintViolation[];
}

export interface IGatekeeperConstraintSpecKind {
  apiGroups?: string[];
  kinds?: string[];
}

export interface IGatekeeperConstraintSpec {
  enforcementAction?: string;
  parameters?: {labels?: string[]};
  match?: {
    kinds?: IGatekeeperConstraintSpecKind[];
    excludedNamespaces?: string[];
  };
}

export interface IGateKeeperConstraintDetails {
  apiVersion?: string;
  kind?: string;
  metadata?: IGatekeeperConstraintMetadata;
  status?: IGatekeeperConstraintStatus;
  spec?: IGatekeeperConstraintSpec;
}

export interface IConstraintCriteria {
  kinds?: string[];
  apiGroups?: string[];
}
