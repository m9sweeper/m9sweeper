export interface IKubeConfigCluster {
  name: string;
  cluster: {
    server: string;
    [x: string]: any;
  };
}

export interface IKubeConfigContext {
  name: string;
  context: {
    cluster: string;
    user: string;
  };
}

export interface IKubeConfigUser {
  name: string;
  user: {
    'auth-provider'?: {
      name: string;
      config: {
        [x: string]: string;
      };
    };
    'client-certificate'?: string;
    'client-key'?: string;
  };
}

export interface IKubeConfig {
  apiVersion: string;
  clusters: IKubeConfigCluster[];
  contexts: IKubeConfigContext[];
  'current-context': string;
  kind: string;
  preferences: any;
  users: IKubeConfigUser[];
}
