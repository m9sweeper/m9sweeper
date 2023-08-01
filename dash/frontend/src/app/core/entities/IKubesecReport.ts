export interface IKubesecReport {
  object: string;
  valid: boolean;
  fileName?: string;
  message: string;
  score: number | string;
  scoring: {
    passed?: {
      id: string;
      selector: string;
      reason: string;
      points: number | string;
    }[];
    critical?: {
      id: string;
      selector: string;
      reason: string;
      points: number | string;
    }[];
    advise: {
      id: string;
      selector: string;
      reason: string;
      points: number | string;
    }[];
  };
}
