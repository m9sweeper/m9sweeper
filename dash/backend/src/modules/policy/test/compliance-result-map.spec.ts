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
  const testCve5 = buildCveTestCase(6, 6, 'CVE-5555', false);

  const policy1Scanner2CompliantException = {
    compliant: true,
    policyId: 1,
    scannerId: 2,
    reason: 'Temporary Exception Blah applied'
  };

  const policy1Scanner2NoncompliantException = {
    compliant: false,
    policyId: 1,
    scannerId: 2,
    reason: 'We trust nothing.'
  };

  const policy1NoncompliantException = {
    compliant: false,
    policyId: 1,
    reason: 'Everything is dangerous!'
  };

  const policy1CompliantException = {
    compliant: true,
    policyId: 1,
    reason: 'Everything is awesome!'
  };

  const policy2CompliantException = {
    compliant: true,
    policyId: 2,
    reason: 'Policy 2 is good.'
  };

  beforeEach(() => {
    // Create a fresh map for each run
    complianceResultMap = new ComplianceResultMap();
  })

  describe('getAllIssues Should return correct list of issues', () => {
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
          policy1Scanner2CompliantException.policyId, policy1Scanner2CompliantException.scannerId,
          policy1Scanner2CompliantException.compliant, policy1Scanner2CompliantException.reason
        );
        applyCveTestInput(complianceResultMap, testCve1);

        const allIssues = complianceResultMap.getAllIssues();
        expect(allIssues.length).toBe(0);
      });9

      // The same inputs as the test case above, only the order of being added to the map was switched.
      it('CVE with scanner level override is not included - cve first', () => {
        applyCveTestInput(complianceResultMap, testCve1);
        complianceResultMap.setResultForScanner(
          policy1Scanner2CompliantException.policyId, policy1Scanner2CompliantException.scannerId,
          policy1Scanner2CompliantException.compliant, policy1Scanner2CompliantException.reason
        );

        const allIssues = complianceResultMap.getAllIssues();
        expect(allIssues.length).toBe(0);
      });


      it('Issues from other scanners are still included', () => {
        applyCveTestInput(complianceResultMap, testCve3);
        complianceResultMap.setResultForScanner(
          policy1Scanner2CompliantException.policyId, policy1Scanner2CompliantException.scannerId,
          policy1Scanner2CompliantException.compliant, policy1Scanner2CompliantException.reason
        );

        const allIssues = complianceResultMap.getAllIssues();
        expect(allIssues.length).toBe(1);
        expect(allIssues[0]).toMatchObject(buildGetAllIssuesOutputForCveInput(testCve3));
      });

    })

    describe('Policy level exceptions should not include CVEs from that policy', () => {
      it('CVE with policy level override is not included - policy first', () => {
        complianceResultMap.setResultForPolicy(policy1NoncompliantException.policyId, policy1NoncompliantException.compliant, policy1NoncompliantException.reason);
        applyCveTestInput(complianceResultMap, testCve1);

        const allIssues = complianceResultMap.getAllIssues();
        expect(allIssues.length).toBe(0);
      });

      // The same inputs as the test case above, only the order of being added to the map was switched.
      it('CVE with policy level override is not included - cve first', () => {
        complianceResultMap.setResultForCve(testCve1.policyId, testCve1.scannerId, testCve1.cve, testCve1.compliant, testCve1.severity);
        complianceResultMap.setResultForPolicy(policy1NoncompliantException.policyId, policy1NoncompliantException.compliant, policy1NoncompliantException.reason);

        complianceResultMap.getAllIssues();
        const allIssues = complianceResultMap.getAllIssues();

        expect(allIssues.length).toBe(0);
      });


      it('Issues from other policies are still included', () => {
        complianceResultMap.setResultForCve(testCve4.policyId, testCve4.scannerId, testCve4.cve, testCve4.compliant, testCve4.severity);

        complianceResultMap.setResultForScanner(
          policy1Scanner2CompliantException.policyId, policy1Scanner2CompliantException.scannerId,
          policy1Scanner2CompliantException.compliant, policy1Scanner2CompliantException.reason
        );

        const allIssues = complianceResultMap.getAllIssues();
        expect(allIssues.length).toBe(1);
        expect(allIssues[0]).toMatchObject(buildGetAllIssuesOutputForCveInput(testCve4));
      });

    })

    describe('More complex cases should return correct issues list', () => {
      it.each([
        {
          msg: 'Policy exception only excludes cves from its own policy',
          cves: [testCve1, testCve2, testCve4],
          policyExceptions: [policy2CompliantException],
          scannerExceptions: [],
          expectedOutput: [testCve1, testCve2]
        },
        {
          msg: 'Lots of exceptions can be correctly filter the list',
          cves: [testCve1, testCve2, testCve3, testCve4, testCve5],
          policyExceptions: [policy2CompliantException],
          scannerExceptions: [policy1Scanner2NoncompliantException],
          expectedOutput: [testCve3, testCve5]
        }
      ])('$msg', (data) => {
        data.cves.forEach(cve => applyCveTestInput(complianceResultMap, cve));
        data.policyExceptions.forEach(ex => complianceResultMap.setResultForPolicy(ex.policyId, ex.compliant, ex.reason));
        data.scannerExceptions.forEach(ex => complianceResultMap.setResultForScanner(ex.policyId, ex.scannerId, ex.compliant, ex.reason));

        const simplifiedExpectedOutput = data.expectedOutput.map(cve => buildGetAllIssuesOutputForCveInput(cve));

        const allIssues = complianceResultMap.getAllIssues();

        // Same number of elements as expected
        expect(allIssues.length).toBe(simplifiedExpectedOutput.length);

        // Ensure each expected element is in the results.

        simplifiedExpectedOutput.forEach(testCase => {
          // Note: all CVE codes are unique in the test cases in order to simplify this find.
          // For real data, it is possible for the same CVE to appear (potentially with different results)
          // under multiple policies/scanners.
          expect(allIssues.find(x => x.cve === testCase.cve)).toMatchObject(testCase);
        });
      });
    });
  });

  describe('Should Calculate Compliance Correctly (isCompliant) for...', () => {
    describe('...CVEs with no overrides', () => {
      it.each([
        {msg: 'compliance map with no issues should be compliant', cves: [], expected: true},
        {msg: 'compliance map with only compliant issues should be compliant', cves: [testCve1], expected: true},
        {
          msg: 'compliance map with only non-compliant issues should be non-compliant',
          cves: [testCve2],
          expected: false
        },
        {
          msg: 'compliance map with both compliant & non-compliant issues should be non-compliant',
          cves: [testCve1, testCve2],
          expected: false
        }
      ])('$msg', (data) => {
        data.cves.forEach(cve => applyCveTestInput(complianceResultMap, cve));
        expect(complianceResultMap.isCompliant).toBe(data.expected);
      });
    });

    describe('...Scanner overrides', () => {
      it.each([
        { msg: 'Compliant Scanner exception overrides non-compliant CVES', scannerOverride: policy1Scanner2CompliantException, cves: [testCve2], expected: true },
        { msg: 'Non-Compliant Scanner exception overrides compliant CVES', scannerOverride: policy1Scanner2NoncompliantException, cves: [testCve1], expected: false },
        { msg: 'Compliant scanner override will not override compliance from CVE from another scanner', scannerOverride: policy1Scanner2CompliantException, cves: [testCve1, testCve2, testCve4], expected: false }
      ])('$msg', (data) => {
        data.cves.forEach(cve => applyCveTestInput(complianceResultMap, cve));
        complianceResultMap.setResultForScanner(data.scannerOverride.policyId, data.scannerOverride.scannerId, data.scannerOverride.compliant, data.scannerOverride.reason);
        expect(complianceResultMap.isCompliant).toBe(data.expected);

      });
    });

    describe('...Policy overrides', () => {
      it.each([
        { msg: 'Compliant policy exception overrides non-compliant CVES', policyOverride: policy1CompliantException, cves: [testCve2], expected: true },
        { msg: 'Non-Compliant policy exception overrides compliant CVES', policyOverride: policy1NoncompliantException, cves: [testCve1], expected: false },
        { msg: 'Compliant policy override will not override compliance from CVE from another policy', policyOverride: policy1CompliantException, cves: [testCve1, testCve2, testCve4], expected: false }
      ])('$msg', (data) => {
        data.cves.forEach(cve => applyCveTestInput(complianceResultMap, cve));
        complianceResultMap.setResultForPolicy(data.policyOverride.policyId, data.policyOverride.compliant, data.policyOverride.reason);
        expect(complianceResultMap.isCompliant).toBe(data.expected);
      });
    });

    describe('...More complex cases', () => {
      it.each([
        { msg: 'Policy override takes precedence over scanner', cves: [testCve1, testCve2], scannerExceptions: [policy1Scanner2CompliantException], policyExceptions: [policy1NoncompliantException], expected: false },
        { msg: 'Most recently applied policy exception takes precedence if they conflict (non-compliant last)', cves: [testCve1, testCve2], scannerExceptions: [], policyExceptions: [policy1CompliantException, policy1NoncompliantException], expected: false },
        { msg: 'Most recently applied policy exception takes precedence if they conflict (compliant applied last)', cves: [testCve1, testCve2], scannerExceptions: [], policyExceptions: [policy1NoncompliantException, policy1CompliantException], expected: true },
        { msg: 'Lots of exceptions applied. Should be non-compliant due to CVE w/ no exception', cves: [testCve1, testCve2, testCve3, testCve4, testCve5], scannerExceptions: [policy1Scanner2CompliantException], policyExceptions: [policy1CompliantException, policy2CompliantException], expected: false },
        { msg: 'Lots of exceptions applied. Should be compliant due to all non-compliant CVEs having an exception ', cves: [testCve1, testCve2, testCve3, testCve4], scannerExceptions: [policy1Scanner2CompliantException], policyExceptions: [policy1CompliantException, policy2CompliantException], expected: true },
      ])('$msg', (data) => {
        data.cves.forEach(cve => applyCveTestInput(complianceResultMap, cve));
        data.scannerExceptions.forEach(s => complianceResultMap.setResultForScanner(s.policyId, s.scannerId, s.compliant, s.reason));
        data.policyExceptions.forEach(s => complianceResultMap.setResultForPolicy(s.policyId, s.compliant, s.reason));
        expect(complianceResultMap.isCompliant).toBe(data.expected);
      })
    })
  });

  describe('Should Return correct compliance results for Issues (getResultForCve)', () => {
    it.each([
      {
        msg: 'Empty Compliance map defaults to compliant for any CVE',
        cvesToAdd: [],
        cvesToCheck: [
          // Using Date.now() & Math.random() to prove that it doesn't matter what is used
          { cve: { policyId: Date.now(), scannerId: Math.random(), cve: 'CVE-1212' }, expected: { compliant: true } }
        ]
      },
      {
        msg: 'Compliant CVE is considered compliant',
        cvesToAdd: [testCve1],
        cvesToCheck: [ { cve: testCve1, expected: { compliant: true }} ]
      },
      {
        msg: 'Non-compliant CVE is considered non-compliant',
        cvesToAdd: [testCve2],
        cvesToCheck: [ { cve: testCve2, expected: { compliant: false }} ]
      }
    ])('$msg', (data) => {
      data.cvesToAdd.forEach(cve => applyCveTestInput(complianceResultMap, cve));
      data.cvesToCheck.forEach(testCase => {
        const compliance = complianceResultMap.getResultForCve(testCase.cve.policyId, testCase.cve.scannerId, testCase.cve.cve);
        expect(compliance).toMatchObject(testCase.expected);
      });
    });

    describe('Policy Overrides take precedence over individual issue results', () => {
      it.each([
        {
          msg: 'Policy level non-compliant exception should make all cves with same policy non-compliant',
          cvesToAdd: [testCve1, testCve2, testCve3],
          cvesToCheck: [
            {cve: testCve1, expected: false },
            {cve: testCve2, expected: false },
            {cve: testCve3, expected: false }
          ],
          exception: policy1NoncompliantException
        },
        {
          msg: 'Policy level compliant exception should make all cves with same policy compliant',
          cvesToAdd: [testCve1, testCve2, testCve3],
          cvesToCheck: [
            {cve: testCve1, expected: true },
            {cve: testCve2, expected: true },
            {cve: testCve3, expected: true }
          ],
          exception: policy1CompliantException
        },
        {
          msg: 'Policy level exception shouldn\'t affect cves from other policies',
          cvesToAdd: [testCve1, testCve2, testCve3, testCve5],
          cvesToCheck: [
            {cve: testCve1, expected: true },
            {cve: testCve2, expected: false },
            {cve: testCve3, expected: true },
            {cve: testCve5, expected: false },
          ],
          exception: policy2CompliantException
        }
      ])('$msg', (data) => {
        // Add all CVEs to map
        data.cvesToAdd.forEach(cve => applyCveTestInput(complianceResultMap, cve));
        complianceResultMap.setResultForPolicy(data.exception.policyId, data.exception.compliant, data.exception.reason);

        data.cvesToCheck.forEach(testCase => {
          const compliance = complianceResultMap.getResultForCve(testCase.cve.policyId, testCase.cve.scannerId, testCase.cve.cve);
          expect(compliance).toMatchObject({compliant: testCase.expected});
        });
      });
    });

    describe('Scanner Overrides take precedence over individual issue results', () => {
      it.each([
        {
          msg: 'Scanner level non-compliant exception should make all cves with same scanner non-compliant',
          cvesToAdd: [testCve1, testCve2],
          cvesToCheck: [
            {cve: testCve1, expected: false },
            {cve: testCve2, expected: false },
          ],
          exception: policy1Scanner2NoncompliantException
        },
        {
          msg: 'Scanner level compliant exception should make all cves with same scanner compliant',
          cvesToAdd: [testCve1, testCve2],
          cvesToCheck: [
            {cve: testCve1, expected: true },
            {cve: testCve2, expected: true },
          ],
          exception: policy1Scanner2CompliantException
        },
        {
          msg: 'Scanner level exception shouldn\'t affect cves from other scanners',
          cvesToAdd: [testCve1, testCve2, testCve3, testCve5],
          cvesToCheck: [
            {cve: testCve1, expected: false },
            {cve: testCve2, expected: false },
            {cve: testCve3, expected: true },
            {cve: testCve5, expected: false },
          ],
          exception: policy1Scanner2NoncompliantException
        }
      ])('$msg', (data) => {
        // Add all CVEs to map
        data.cvesToAdd.forEach(cve => applyCveTestInput(complianceResultMap, cve));
        complianceResultMap.setResultForScanner(data.exception.policyId, data.exception.scannerId, data.exception.compliant, data.exception.reason);

        data.cvesToCheck.forEach(testCase => {
          const compliance = complianceResultMap.getResultForCve(testCase.cve.policyId, testCase.cve.scannerId, testCase.cve.cve);
          expect(compliance).toMatchObject({compliant: testCase.expected});
        });
      });
    });
  });
});