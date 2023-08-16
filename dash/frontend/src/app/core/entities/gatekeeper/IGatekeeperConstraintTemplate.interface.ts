
export class IGatekeeperConstraintTemplate {
  apiVersion?: string;

  kind?: string;

  metadata?: {
    name?: string;
    annotations?: {
      description?: string;
      'minesweeper.io/apiGroup'?: string;
      'minesweeper.io/kinds'?: string;
    };
  };

  spec?: {
    crd?: {
      spec?: {
        names?: { kind: string },
        validation?: any,
      }
    };
    targets?: {
      target?: string;
      rego?: string;
    }[];
  };

  constraintsCount?: number;
  enforced?: boolean;
}

