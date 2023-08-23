/**
 * Generic classes for K8s objects. Built around the types declared by
 * @kubernetes/client-node (used in the backend)
 */
export interface IKubernetesServiceObject {
  apiVersion: string;
  kind?: string;
  metadata?: IV1ObjectMeta;
  spec?: IV1APIServiceSpec;
  status?: IV1APIServiceStatus;
}

export interface IV1ObjectMeta {
  annotations?: {
    [key: string]: string;
  };
  creationTimestamp?: Date;
  deletionGracePeriodSeconds?: number;
  deletionTimestamp?: Date;
  finalizers?: Array<string>;
  generateName?: string;
  generation?: number;
  labels?: {
    [key: string]: string;
  };
  managedFields?: Array<any>;
  name?: string;
  namespace?: string;
  ownerReferences?: Array<any>;
  resourceVersion?: string;
  selfLink?: string;
  uid?: string;
}

export interface IV1APIServiceSpec {
  caBundle?: string;
  group?: string;
  groupPriorityMinimum: number;
  insecureSkipTLSVerify?: boolean;
  service?: {
    name?: string;
    namespace?: string;
    port?: number;
  };
  version?: string;
  versionPriority: number;
}

export interface IV1APIServiceStatus {
  conditions?: Array<{
    lastTransitionTime?: Date;
    message?: string;
    reason?: string;
    status?: string;
    type?: string;
  }>;
}
