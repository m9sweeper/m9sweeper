/** Total number of vulnerabilities, separated by date. The counts of all vulnerabilities
 * are stored as string representations */
export interface ICountOfVulnerabilities {
  criticalIssues: string;

  majorIssues: string;

  mediumIssues: string;

  lowIssues: string;

  negligibleIssues: string;

  /** Scan date represented as an ISO date string, with attached timezone */
  savedAtDate: string;
}
