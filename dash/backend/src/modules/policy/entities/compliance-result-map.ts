interface complianceResult {
  complianceReason?: string
  compliant: boolean
  severity?: string
}

export interface ComplianceIssue {
  policyId: number;
  scannerId: number;
  cve: string;
  compliant: boolean;
  severity?: string;
}

type cveMap = Map<string, complianceResult>
type scannerMap = Map<number, complianceResult | cveMap>;
type policyMap = Map<number, complianceResult | scannerMap>;

export class ComplianceResultMap {
  private policyMap = new Map<number, complianceResult | scannerMap>();

  /**
   * Get flattened array of issues that have a special reason for being (non-)compliant
   */
  getAllIssues(): ComplianceIssue[] {
    const issues = [];

    // loop through policies
    for (const [policyId, scannerMap] of this.policyMap) {

      // Make sure the policy does not have a global version
      if (!!scannerMap && !this.isComplianceResult(scannerMap)) {
        // loop through scanners
        for (const [scannerId, cveMap] of <scannerMap>scannerMap) {

          if (!!cveMap && !this.isComplianceResult(cveMap)) {
            // loop over CVEs and compile a simple list of issues
            for (const [cve, complianceReason] of <cveMap>cveMap) {
              issues.push({
                policyId: policyId,
                scannerId: scannerId,
                cve: cve,
                compliant: complianceReason.compliant,
                severity: complianceReason.severity
              });
            }
          }
        }
      }
    }
    return issues;
  }

  /** Every object in this policy should be considered (non-)compliant for the specified reason */
  setResultForPolicy(id: number, compliant: boolean, reason?: string): void {
    this.policyMap.set(id, { compliant, complianceReason: reason });
  }

  /**
   * Every object in this scanner should be considered (non-)compliant for the specified reason.
   * If a global result is set for the policy that will take precedence over this
   * */
  setResultForScanner(policyId: number, scannerId: number, compliant: boolean, reason?: string) {
    const scannerMapForPolicy  = this.getScannerMapByPolicy(policyId, true);
    // Don't override any global reasons
    if (this.isComplianceResult(scannerMapForPolicy)) {
      return;
    }
    (<scannerMap>scannerMapForPolicy).set(scannerId, { compliant, complianceReason: reason});
  }

  /**
   * Returns whether or not the image is compliant based on the information is compliant or not based on what data this compliance map has.
   * Will return false if it contains at least 1 non-compliant issue, true otherwise
   * */
  get isCompliant(): boolean {
    for (const [policyId, scannerMap] of this.policyMap) {

      // If non-compliant at a policy level, return false
      if (this.isComplianceResult(scannerMap)) {
        if (!(<complianceResult>scannerMap).compliant) {
          return false;
        }
      } else {
        // loop through scanners
        for (const [scannerId, cveMap] of <scannerMap>scannerMap) {
          // Check if there is a scanner-wide compliance setting, otherwise check all the CVEs
          if (this.isComplianceResult(cveMap)) {
            if (!(<complianceResult>cveMap).compliant) {
              return false;
            }
          } else {
            // Check if there are any non-compliant CVEs
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
   * Save the reasons CVEs caused it to fail, or that had an "interesting"
   * reason for being compliant (like having an exception applied)
   */
  setResultForCve(policyId: number, scannerId: number, cve: string, compliant: boolean, reason?: string,
                  severity?: string): void {
    const cveMap = this.getCveMap(policyId, scannerId, true);
    // Don't override any global compliance results
    if (this.isComplianceResult(cveMap)) {
      return;
    }
    (<cveMap>cveMap).set(cve, { compliant, complianceReason: reason, severity });
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
    // Get the reason from the map If the mpa or a specific entry
    // within the map for the cve doesn't exist, assumes it is compliant
    const reason = cveMap ? (<cveMap>cveMap).get(cve) : { compliant: true };
    return reason || { compliant: true };
  }


  /**
   * Retrieves the scanner map for a policy, optionally creating it if it doesn't
   */
  protected getScannerMapByPolicy(policyId: number, create?: boolean): scannerMap | complianceResult {
    let scannerMapForPolicy  = this.policyMap.get(policyId);
    if (!scannerMapForPolicy && create)  {
      // Create the map
      scannerMapForPolicy = new Map<number, cveMap>();
      this.policyMap.set(policyId, scannerMapForPolicy);
    }

    return scannerMapForPolicy;
  }

  protected getCveMap(policyId: number, scannerId: number, create?: boolean): cveMap | complianceResult {
    // Check/create the map by policy
    const scannerMap = this.getScannerMapByPolicy(policyId, create);
    if (this.isComplianceResult(scannerMap)) {
      // This compliance reason will be applicable to all the CVEs for the given policy
      return <complianceResult>scannerMap;
    }

    // Check/create the cve map for the scanner
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
