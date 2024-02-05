/**
 * Data returned when requesting compliance results for an issue.
 * Note that complianceReason and severity will only be set if initially
 * provided at the level (policy, scanner or issue) that determined this issue's compliance
 */
interface complianceResult {
  compliant: boolean
  complianceReason?: string
  severity?: string
}

/**
 * Interface for a flattened issue from the map.
 */
export interface ComplianceIssue {
  policyId: number;
  scannerId: number;
  cve: string;
  compliant: boolean;
  severity?: string;
  reason?: string;
}
/////////////////////////////////////
/// Internal types for this class ///
/////////////////////////////////////
type cveMap = Map<string, complianceResult>
type scannerMap = Map<number, complianceResult | cveMap>;
type policyMap = Map<number, complianceResult | scannerMap>;

/**
 * Class to simplify calculating compliance for issues.
 * High level usage:
 * 1. Instantiate a ComplianceResultMap
 * 2. Call yourMap.setResultFor[Policy | Scanner | Cve] with all relevant data
 * 3. Use yourMap.IsCompliant to determine if the image is compliant or not based on the provided information
 * If needed, use yourMap.getResultForCve to determine the compliance for a specific CVE
 * If needed, use yourMap.getIssuesList to get a flattened list of all issues that were not overwritten by a policy or scanner level result
 *
 * The priority for determining if an issue is compliant or not is based on:
 * 1. If a result was set at the policy level, that is used
 * 2. If a result was set at the scanner level, that is used
 * 3. If a result was set at the CVE level, that is used
 * 4. If no result was set at any level, it is defaulted to compliant
 */
export class ComplianceResultMap {
  private policyMap: policyMap = new Map<number, complianceResult | scannerMap>();

  /**
   * Get flattened array of issues with an issue-level reason for their (non-)compliance
   */
  getAllIssues(): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    // loop through policies
    for (const [policyId, scannerMap] of this.policyMap) {

      // If the policy does not have a global compliance setting, loop through its scanners
      if (!!scannerMap && !this.isComplianceResult(scannerMap)) {
        for (const [scannerId, cveMap] of <scannerMap>scannerMap) {
          // If the scanner does not have a global compliance setting, loop through its issues
          if (!!cveMap && !this.isComplianceResult(cveMap)) {
            // Add the issues to the output array
            for (const [cve, complianceReason] of <cveMap>cveMap) {
              issues.push({
                policyId: policyId,
                scannerId: scannerId,
                cve: cve,
                compliant: complianceReason.compliant,
                severity: complianceReason.severity,
                reason: complianceReason.complianceReason
              });
            }
          }
        }
      }
    }
    return issues;
  }

  /**
   *  Set a policy level compliance result.
   *  This will override any existing setting for the policy, and any issues/scanners under it.
   *  */
  setResultForPolicy(id: number, compliant: boolean, reason?: string): void {
    this.policyMap.set(id, { compliant, complianceReason: reason });
  }

  /**
   * Set a scanner level compliance result.
   *  This will override any existing setting for the scanner, and any issues under it.
   * This has no effect if a result is set for the policy
   * */
  setResultForScanner(policyId: number, scannerId: number, compliant: boolean, reason?: string) {
    const scannerMapForPolicy  = this.getScannerMapByPolicy(policyId, true);
    // Don't override any policy-level results
    if (this.isComplianceResult(scannerMapForPolicy)) {
      return;
    }
    (<scannerMap>scannerMapForPolicy).set(scannerId, { compliant, complianceReason: reason});
  }

  /**
   * Set the result for issues. Only need sto be done if there is an "interesting" reason
   * for the issue's (non-)compliance.
   * Will overwrite any existing result for the issue
   * Will have no effect if a result is set at the policy or scanner level
   */
  setResultForCve(policyId: number, scannerId: number, cve: string, compliant: boolean, reason?: string,
                  severity?: string): void {
    const cveMap = this.getCveMap(policyId, scannerId, true);
    // Don't override any policy/scanner level results
    if (this.isComplianceResult(cveMap)) {
      return;
    }
    (<cveMap>cveMap).set(cve, { compliant, complianceReason: reason, severity });
  }

  /**
   * Calculates if the image is compliant based on the information this compliance map has.
   * It will consider it non-compliant if anything non-compliant is contained within the map,
   * will consider it compliant if no such item exists
   * */
  get isCompliant(): boolean {
    // Iterate over the policy map
    for (const [policyId, scannerMap] of this.policyMap) {
      // If the policy is a result, short circuit if it is non-compliant
      if (this.isComplianceResult(scannerMap)) {
        if (!(<complianceResult>scannerMap).compliant) {
          return false;
        }
      } else { // The policy does not have a result for the policy level
        // Iterate over the scanner s within the policy
        for (const [scannerId, cveMap] of <scannerMap>scannerMap) {
          // Short circuit if there is a non-compliant scanner level result
          if (this.isComplianceResult(cveMap)) {
            if (!(<complianceResult>cveMap).compliant) {
              return false;
            }
          } else {
            // If there is not a scanner level result, iterate over its issues
            for (const [cve, complianceReason] of <cveMap>cveMap) {
              // If we find a non-compliant CVE, the image is non-compliant
              if (!complianceReason.compliant) {
                return false;
              }
            }
          }
        }
      }
    }
    // Nothing non-compliant was found in the maps, it must be compliant
    return true;
  }

  /**
   * Retrieve the compliance result associated with a CVE.
   * Assumes that if the CVE was not explicitly added to the map that it is compliant
   */
  getResultForCve(policyId: number, scannerId: number, cve: string): complianceResult {
    const cveMap = this.getCveMap(policyId, scannerId, false);
    // If a global reason for the policy/scanner was applied, use it.
    if (this.isComplianceResult(cveMap)) {
      return <complianceResult>cveMap;
    }
    // Get the reason from the map if it has a specific entry.
    // If the cve had no entry, it defaults to compliant
    const reason = cveMap ? (<cveMap>cveMap).get(cve) : { compliant: true };
    return reason || { compliant: true };
  }


  /**
   * Retrieves the scanner map for a policy.
   * If the create flag is set, and the map does not exist, it will be created.
   */
  protected getScannerMapByPolicy(policyId: number, create?: boolean): scannerMap | complianceResult {
    // Find/create the scanner map for the policy.
    let scannerMapForPolicy  = this.policyMap.get(policyId);
    if (!scannerMapForPolicy && create)  {
      scannerMapForPolicy = new Map<number, cveMap>();
      this.policyMap.set(policyId, scannerMapForPolicy);
    }

    return scannerMapForPolicy;
  }

  /**
   * Retrieves the cve map for a scanner.
   * If the create flag is set, and the map does not exist, it will be created.
   */
  protected getCveMap(policyId: number, scannerId: number, create?: boolean): cveMap | complianceResult {
    // Check/create the map by policy
    const scannerMap = this.getScannerMapByPolicy(policyId, create);
    if (this.isComplianceResult(scannerMap)) {
      // If there is a policy level result set, it will also be applicable to the scanner, so it is returned
      return <complianceResult>scannerMap;
    }

    // Find/create the cve map for the scanner
    let cveMapForScanner = (<scannerMap>scannerMap)?.get(scannerId);
    if (!cveMapForScanner && create) {
      cveMapForScanner = new Map<string, complianceResult>();
      (<scannerMap>scannerMap).set(scannerId, cveMapForScanner);
    }

    return cveMapForScanner;
  }

  /** Differentiates between a map and a compliance result object */
  protected isComplianceResult(obj: any): boolean {
    return !!obj ? obj.hasOwnProperty('compliant') : false;
  }
}
