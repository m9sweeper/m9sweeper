import {ComplianceResultMap} from '../entities/compliance-result-map';


interface CveTestData {
  policyId: number;
  scannerId: number;
  cve: string;
  compliant: boolean;
  reason?: string;
  severity?: string;
}

interface CveTestInput extends CveTestData {
  reason?: string;
}

/** Builds an object to store inputs to be used to in test cases */
function buildCveTestCase(policyId: number, scannerId: number, cve: string, compliant: boolean, severity?: string, reason?: string): CveTestInput {
  return {
    policyId, scannerId, cve, compliant, severity, reason
  };
}

/**
 * Creates the object that will be returned for a given CVE input by getAllIssue
 * if it has no scanner or policy override
 * */
function buildGetAllIssuesOutputForCveInput(input: CveTestInput): CveTestData {
  const clone = {...input};
  delete clone.reason;
  return clone;
}

/** Utility function to call setResultForCve with a test CVE input */
function applyCveTestInput(map: ComplianceResultMap, input: CveTestInput): void {
  map.setResultForCve(input.policyId, input.scannerId, input.cve, input.compliant, input.reason, input.severity);
}

describe('ComplianceResultMap', () => {
  let complianceResultMap: ComplianceResultMap;

  const testCve1 = buildCveTestCase(1, 2, 'CVE-1111', true, 'Low', 'It is good');
  const testCve2 = buildCveTestCase(1, 2, 'CVE-2222', false, 'High');
  const testCve3 = buildCveTestCase(1, 1, 'CVE-3333', true);
  const testCve4 = buildCveTestCase(2, 3, 'CVE-4444', false, undefined, 'It is bad');

  const policy1Scanner2Exception = {
    compliant: true,
    policyId: 1,
    scannerId: 2,
    reason: 'Temporary Exception Blah applied'
  };

  const policy1Exception = {
    compliant: false,
    policyId: 1,
    reason: 'Everything is dangerous!'
  };


  beforeEach(() => {
    // Create a fresh map for each run
    complianceResultMap = new ComplianceResultMap();
  })

  describe('getAllIssues Should return correct data', () => {
    describe.each([
      testCve1,
      testCve2,
      testCve3,
      testCve4
    ])('Including only a single cve should return correct data', (testCve) => {
      it('Single CVE - ' + testCve.cve, () => {
        // Add data for CVE to map
        applyCveTestInput(complianceResultMap, testCve);

        const allIssues = complianceResultMap.getAllIssues();
        expect(allIssues.length).toBe(1);
        expect(allIssues[0]).toMatchObject(buildGetAllIssuesOutputForCveInput(testCve));
      });
    });

    describe('Scanner level exceptions should not include CVEs from that scanner', () => {
      it('CVE with scanner level override is not included - scanner first', () => {
        complianceResultMap.setResultForScanner(
          policy1Scanner2Exception.policyId, policy1Scanner2Exception.scannerId,
          policy1Scanner2Exception.compliant, policy1Scanner2Exception.reason
        );
        applyCveTestInput(complianceResultMap, testCve1);

        const allIssues = complianceResultMap.getAllIssues();
        expect(allIssues.length).toBe(0);
      });

      // The same inputs as the test case above, only the order of being added to the map was switched.
      it('CVE with scanner level override is not included - cve first', () => {
        applyCveTestInput(complianceResultMap, testCve1);
        complianceResultMap.setResultForScanner(
          policy1Scanner2Exception.policyId, policy1Scanner2Exception.scannerId,
          policy1Scanner2Exception.compliant, policy1Scanner2Exception.reason
        );

        const allIssues = complianceResultMap.getAllIssues();
        expect(allIssues.length).toBe(0);
      });


      it('Issues from other scanners are still included', () => {
        applyCveTestInput(complianceResultMap, testCve3);
        complianceResultMap.setResultForScanner(
          policy1Scanner2Exception.policyId, policy1Scanner2Exception.scannerId,
          policy1Scanner2Exception.compliant, policy1Scanner2Exception.reason
        );

        const allIssues = complianceResultMap.getAllIssues();
        expect(allIssues.length).toBe(1);
        expect(allIssues[0]).toMatchObject(buildGetAllIssuesOutputForCveInput(testCve3));
      });

    })

    describe('Policy level exceptions should not include CVEs from that policy', () => {
      it('CVE with policy level override is not included - policy first', () => {
        complianceResultMap.setResultForPolicy(policy1Exception.policyId, policy1Exception.compliant, policy1Exception.reason);
        applyCveTestInput(complianceResultMap, testCve1);

        const allIssues = complianceResultMap.getAllIssues();
        expect(allIssues.length).toBe(0);
      });

      // The same inputs as the test case above, only the order of being added to the map was switched.
      it('CVE with policy level override is not included - cve first', () => {
        complianceResultMap.setResultForCve(testCve1.policyId, testCve1.scannerId, testCve1.cve, testCve1.compliant, testCve1.severity);
        complianceResultMap.setResultForPolicy(policy1Exception.policyId, policy1Exception.compliant, policy1Exception.reason);

        complianceResultMap.getAllIssues();
        const allIssues = complianceResultMap.getAllIssues();

        expect(allIssues.length).toBe(0);
      });


      it('Issues from other policies are still included', () => {
        complianceResultMap.setResultForCve(testCve4.policyId, testCve4.scannerId, testCve4.cve, testCve4.compliant, testCve4.severity);

        complianceResultMap.setResultForScanner(
          policy1Scanner2Exception.policyId, policy1Scanner2Exception.scannerId,
          policy1Scanner2Exception.compliant, policy1Scanner2Exception.reason
        );

        const allIssues = complianceResultMap.getAllIssues();
        expect(allIssues.length).toBe(1);
        expect(allIssues[0]).toMatchObject(buildGetAllIssuesOutputForCveInput(testCve4));
      });

    })

  });

  describe('Should Calculate Compliance Correctly', () => {
    it('compliance map with no issues should be compliant', () => {
      expect(complianceResultMap.isCompliant).toBe(true);
    });

    it('compliance map with only compliant issues should be compliant', () => {
      applyCveTestInput(complianceResultMap, testCve1);
      expect(complianceResultMap.isCompliant).toBe(true);
    });

    it('compliance map with only non-compliant issues should be non-compliant', () => {
      applyCveTestInput(complianceResultMap, testCve2);
      expect(complianceResultMap.isCompliant).toBe(false);
    });

    it('compliance map with both compliant & non-compliant issues should be non-compliant', () => {
      applyCveTestInput(complianceResultMap, testCve1);
      applyCveTestInput(complianceResultMap, testCve2);
      expect(complianceResultMap.isCompliant).toBe(false);
    });

  });
});