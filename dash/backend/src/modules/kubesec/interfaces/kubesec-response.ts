export type KubesecResponse = KubesecScanResults[];

export interface KubesecScanResults {
  /** The kubernetes object scanned */
  object: string;

  valid: boolean;

  fileName: string;

  /** The overall score for the scan. Positive values indicate passed scans, negative indicates failed */
  score: number;

  /** An object containing the categorized items found in the scan */
  scoring: KubesecScoring
}

export interface KubesecScoring {
  /** The critical issues found. These are significant concerns */
  critical: KubesecItem[];

  /** These items are concerns, but not as dangerous as critical ones */
  advise: KubesecItem[];

  /** These items are good */
  passed: KubesecItem[];
}

export interface KubesecItem {
  /** The Id for the item */
  id: string;
  /** The selector from the scan where the item was found */
  selector: string;

  /** The explanation for what the item is */
  reason: string;

  /** The number of points the item is worth */
  points: number;
}