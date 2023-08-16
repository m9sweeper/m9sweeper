/**
 * @deprecated
 */
export interface IGatekeeperConstraintMetadataAnnotations {
  mode?: string;
  description?: string;
}

/**
 * @deprecated
 */
export interface IGatekeeperConstraintMetadata {
  name?: string;
  annotations?: IGatekeeperConstraintMetadataAnnotations;
  uid?: string;
  creationTimestamp?: string;
}

/**
 * @deprecated
 */
export interface IGatekeeperConstraintViolation {
  enforcementAction?: string;
  kind?: string;
  message?: string;
  name?: string;
  namespace?: string;
}

/**
 * @deprecated
 */
export interface IGatekeeperConstraintStatus {
  auditTimestamp?: string;
  totalViolations?: number;
  violations?: IGatekeeperConstraintViolation[];
}

/**
 * @deprecated
 */
export interface IGatekeeperConstraintSpecKind {
  apiGroups?: string[];
  kinds?: string[];
}

/**
 * @deprecated
 */
export interface IGatekeeperConstraintSpec {
  enforcementAction?: string;
  parameters?: {labels?: string[]};
  match?: {
    kinds?: IGatekeeperConstraintSpecKind[];
    excludedNamespaces?: string[];
  };
}

/**
 * @deprecated
 */
export interface IGateKeeperConstraintDetails {
  apiVersion?: string;
  kind?: string;
  metadata?: IGatekeeperConstraintMetadata;
  status?: IGatekeeperConstraintStatus;
  spec?: IGatekeeperConstraintSpec;
}

/**
 * @deprecated
 */
export interface IConstraintCriteria {
  kinds?: string[];
  apiGroups?: string[];
}
