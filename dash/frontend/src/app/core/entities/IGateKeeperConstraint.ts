/**
 * @deprecated - use IGatekeeperConstraintTemplate instead
 */
export interface IGatekeeperConstraintMetadataAnnotations {
  mode?: string;
  description?: string;
}

/**
 * @deprecated - use IGatekeeperConstraintTemplate instead
 */
export interface IGatekeeperConstraintMetadata {
  name?: string;
  annotations?: IGatekeeperConstraintMetadataAnnotations;
  uid?: string;
  creationTimestamp?: string;
}

/**
 * @deprecated - use IGatekeeperConstraintTemplate instead
 */
export interface IGatekeeperConstraintViolation {
  enforcementAction?: string;
  kind?: string;
  message?: string;
  name?: string;
  namespace?: string;
}

/**
 * @deprecated - use IGatekeeperConstraintTemplate instead
 */
export interface IGatekeeperConstraintStatus {
  auditTimestamp?: string;
  totalViolations?: number;
  violations?: IGatekeeperConstraintViolation[];
}

/**
 * @deprecated - use IGatekeeperConstraintTemplate instead
 */
export interface IGatekeeperConstraintSpecKind {
  apiGroups?: string[];
  kinds?: string[];
}

/**
 * @deprecated - use IGatekeeperConstraintTemplate instead
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
 * @deprecated - use IGatekeeperConstraintTemplate instead
 */
export interface IGateKeeperConstraintDetails {
  apiVersion?: string;
  kind?: string;
  metadata?: IGatekeeperConstraintMetadata;
  status?: IGatekeeperConstraintStatus;
  spec?: IGatekeeperConstraintSpec;
}

/**
 * @deprecated - use IGatekeeperConstraintTemplate instead
 */
export interface IConstraintCriteria {
  kinds?: string[];
  apiGroups?: string[];
}
