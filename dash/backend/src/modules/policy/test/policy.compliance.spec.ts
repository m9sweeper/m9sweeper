import { ScannerDto, VulnerabilitySettingsDto } from "../../scanner/dto/scanner-dto";
import { ImageScanExceptionDto, ImageScanIssueDto, ImageScanResultPerPolicyDto } from "../dto/image-scan-results-perpolicy-dto";
import { IssueSeverityType } from "../enum/IssueSeverityType";
import { PolicyDto } from "../dto/policy-dto";
import { ImageComplianceService } from "../services/image-compliance-service";
import {ComplianceResultMap} from "../entities/compliance-result-map";

describe('ImageComplianceService', () => {
    let imageComplianceService: ImageComplianceService;
    const vulnerabilitySettings: VulnerabilitySettingsDto
      = new VulnerabilitySettingsDto();
    vulnerabilitySettings.fixableCritical = 1;
    vulnerabilitySettings.unFixableCritical = 2;
    vulnerabilitySettings.fixableMajor = 3;
    vulnerabilitySettings.unFixableMajor = 4;
    vulnerabilitySettings.fixableNormal = 5;
    vulnerabilitySettings.unFixableNormal = 6;
    vulnerabilitySettings.fixableLow = 7;
    vulnerabilitySettings.unFixableLow = 8;
    vulnerabilitySettings.fixableNegligible = 9;
    vulnerabilitySettings.unFixableNegligible = 10;

    const simpleVulnerabilitySetting: VulnerabilitySettingsDto
      = new VulnerabilitySettingsDto();
    simpleVulnerabilitySetting.fixableCritical = 1;
    simpleVulnerabilitySetting.unFixableCritical = 1;
    simpleVulnerabilitySetting.fixableMajor = 1;
    simpleVulnerabilitySetting.unFixableMajor = 1;
    simpleVulnerabilitySetting.fixableNormal = 1;
    simpleVulnerabilitySetting.unFixableNormal = 1;
    simpleVulnerabilitySetting.fixableLow = 1;
    simpleVulnerabilitySetting.unFixableLow = 1;
    simpleVulnerabilitySetting.fixableNegligible = 1;
    simpleVulnerabilitySetting.unFixableNegligible = 1;

    let enabledAndRequiredScanner: ScannerDto;
    let enabledAndRequiredScanner_1: ScannerDto;
    let disabledAndRequiredScanner: ScannerDto;
    let enabledNonRequiredScanner: ScannerDto;
    let enabledNonRequiredScanner_1: ScannerDto;
    let disabledNonRequiredScanner: ScannerDto;
    

    let enabledAndRequiredPolicy: PolicyDto;
    let enabledAndNonRequiredPolicy: PolicyDto;
    let disabledAndRequiredPolicy: PolicyDto;
    let disabledAndNonRequiredPolicy: PolicyDto;

    beforeEach(() => {
        imageComplianceService = new ImageComplianceService();
        enabledAndRequiredScanner = testScannerSetup(1, true, true);

        disabledAndRequiredScanner = testScannerSetup(2, true, false);

        enabledNonRequiredScanner = testScannerSetup(3, false, true);

        disabledNonRequiredScanner = testScannerSetup(4, false, false);
        enabledAndRequiredScanner_1 = testScannerSetup(5, true, true);
        enabledNonRequiredScanner_1 = testScannerSetup(6, false, true);


        

        enabledAndRequiredPolicy = Object.assign(new PolicyDto(), {
          enabled: true,
          enforcement: true
        });
        enabledAndNonRequiredPolicy = Object.assign(new PolicyDto(), {
          enabled: true,
          enforcement: false
        });

        disabledAndRequiredPolicy = Object.assign(new PolicyDto(), {
          enabled: false,
          enforcement: true
        });

        disabledAndNonRequiredPolicy = Object.assign(new PolicyDto(), {
          enabled: false,
          enforcement: false
        });
    });


    describe('should calculate cluster compliance correctly', () => {
      describe('calculating compliance without exceptions', () => {
        describe('enabled and required policy', () => {
          describe('with an enabled and required scanner', () => {
            describe.each(
            [
              IssueSeverityType.CRITICAL,
              IssueSeverityType.HIGH,
              IssueSeverityType.MEDIUM,
              IssueSeverityType.LOW,
              IssueSeverityType.NEGLIGIBLE
            ])('with too few fixable/unfixable issues for severity %s', (severity) => {
              it('should be compliant', () => {
                const scanners: ScannerDto[] = [];
                scanners.push(enabledAndRequiredScanner);
    
                const issues: ImageScanIssueDto[] = [];

                issues.push(...GenerateReasonablyFixableIssues(severity, enabledAndRequiredScanner.id));
                issues.push(...GenerateReasonablyUnFixableIssues(severity, enabledAndRequiredScanner.id));
                
    
                const result = Object.assign(new ImageScanResultPerPolicyDto(), {
                  policy: enabledAndRequiredPolicy,
                  issues: issues,
                  scanners: scanners
                });

                const complianceMap = new ComplianceResultMap();
                expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap)).toBeTruthy();
              })
            })
            describe.each(
              [
                IssueSeverityType.CRITICAL,
                IssueSeverityType.HIGH,
                IssueSeverityType.MEDIUM,
                IssueSeverityType.LOW,
                IssueSeverityType.NEGLIGIBLE
            ])('with too many fixable/unfixable issues for severity %s', (severity) => {
              it('should be noncompliant', () => {
                const scanners: ScannerDto[] = [];
                scanners.push(enabledAndRequiredScanner);

                const issues: ImageScanIssueDto[] = [];

                issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                issues.push(...GenerateTooManyUnFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                  
                const result = Object.assign(new ImageScanResultPerPolicyDto(), {
                  policy: enabledAndRequiredPolicy,
                  issues: issues,
                  scanners: scanners
                });
                const complianceMap = new ComplianceResultMap();
                expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap)).toBeFalsy();
              })
            })
            describe('with too few fixable/unfixable issues for all severities', () => {
              it('should be compliant', () => {
                const scanners: ScannerDto[] = [];
                scanners.push(enabledAndRequiredScanner);

                const issues: ImageScanIssueDto[] = [];

                Object.keys(IssueSeverityType).forEach(severity => {
                  issues.push(...GenerateReasonablyFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                  issues.push(...GenerateReasonablyUnFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                })
                  
                const result = Object.assign(new ImageScanResultPerPolicyDto(), {
                  policy: enabledAndRequiredPolicy,
                  issues: issues,
                  scanners: scanners
                });
                const complianceMap = new ComplianceResultMap();
                expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap)).toBeTruthy();
              })
            })
            describe('with too many fixable/unfixable issues for all severities', () => {
              it('should be noncompliant', () => {
                const scanners: ScannerDto[] = [];
                scanners.push(enabledAndRequiredScanner);
  
                const issues: ImageScanIssueDto[] = [];
                
                Object.keys(IssueSeverityType).forEach(severity => {
                  issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                  issues.push(...GenerateTooManyUnFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                })
                  
                const result = Object.assign(new ImageScanResultPerPolicyDto(), {
                  policy: enabledAndRequiredPolicy,
                  issues: issues,
                  scanners: scanners
                });
                const complianceMap = new ComplianceResultMap();
                expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap)).toBeFalsy();
              })
            })
          })
          describe('with a disabled and required scanner', () => {
            describe('number of fixable/unfixable issues does not matter', () => {
              it('always compliant', () => {
                const scanners: ScannerDto[] = [];
                scanners.push(disabledAndRequiredScanner);
    
                const issues: ImageScanIssueDto[] = [];
  
                Object.keys(IssueSeverityType).forEach(severity => {
                  issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], disabledAndRequiredScanner.id));
                  issues.push(...GenerateTooManyUnFixableIssues(IssueSeverityType[severity], disabledAndRequiredScanner.id));
                })
    
                const result = Object.assign(new ImageScanResultPerPolicyDto(), {
                  policy: enabledAndRequiredPolicy,
                  issues: issues,
                  scanners: scanners
                });
                const complianceMap = new ComplianceResultMap();
                expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap)).toBeTruthy();
              })
            })
          })  
          describe('ignores enabled/disabled non-required scanner', () => {
            it('always compliant', () => {
              let scanners: ScannerDto[] = [];
              scanners.push(enabledNonRequiredScanner);
  
              let issues: ImageScanIssueDto[] = [];

              Object.keys(IssueSeverityType).forEach(severity => {
                issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner.id));
                issues.push(...GenerateTooManyUnFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner.id));
              })
  
              let result = Object.assign(new ImageScanResultPerPolicyDto(), {
                policy: enabledAndRequiredPolicy,
                issues: issues,
                scanners: scanners
              });
              const complianceMap = new ComplianceResultMap();
              expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap)).toBeTruthy();

              issues = [];
              scanners = [];

              scanners.push(disabledNonRequiredScanner);

              Object.keys(IssueSeverityType).forEach(severity => {
                issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], disabledNonRequiredScanner.id));
                issues.push(...GenerateTooManyUnFixableIssues(IssueSeverityType[severity], disabledNonRequiredScanner.id));
              })
  
              result = Object.assign(new ImageScanResultPerPolicyDto(), {
                policy: enabledAndRequiredPolicy,
                issues: issues,
                scanners: scanners
              });
              const complianceMap2 = new ComplianceResultMap();
              expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap2)).toBeTruthy();
            })
          })
          describe('with two enabled and required scanner', () => {
            describe('too few fixable or unfixable issues in both scanner', () => {
              it('should be compliant', () => {
                const scanners: ScannerDto[] = [];
                scanners.push(enabledAndRequiredScanner);
                scanners.push(enabledAndRequiredScanner_1);

                const issues: ImageScanIssueDto[] = [];
  
                Object.keys(IssueSeverityType).forEach(severity => {
                  issues.push(...GenerateReasonablyFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                  issues.push(...GenerateReasonablyUnFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                  issues.push(...GenerateReasonablyFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner_1.id));
                  issues.push(...GenerateReasonablyUnFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner_1.id));
                })
    
                const result = Object.assign(new ImageScanResultPerPolicyDto(), {
                  policy: enabledAndRequiredPolicy,
                  issues: issues,
                  scanners: scanners
                });
                const complianceMap = new ComplianceResultMap();
                expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap)).toBeTruthy();
              })
            })
            describe('too many fixable or unfixable issues in one of the scanner', () => {
              it('should be noncompliant', () => {
                const scanners: ScannerDto[] = [];
              scanners.push(enabledAndRequiredScanner);
              scanners.push(enabledAndRequiredScanner_1);

              const issues: ImageScanIssueDto[] = [];

              Object.keys(IssueSeverityType).forEach(severity => {
                issues.push(...GenerateReasonablyFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                issues.push(...GenerateReasonablyUnFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner_1.id));
                issues.push(...GenerateTooManyUnFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner_1.id));
              })
  
              const result = Object.assign(new ImageScanResultPerPolicyDto(), {
                policy: enabledAndRequiredPolicy,
                issues: issues,
                scanners: scanners
              });
              const complianceMap = new ComplianceResultMap();
              expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap)).toBeFalsy();
              })
            })
          })
          describe('with one enabled required scanner and another enabled non-required scanner', () => {
            describe('too few fixable or unfixable issues in required scanner and non-required scanner is ignored', () => {
              it('should be noncompliant', () => {
                const scanners: ScannerDto[] = [];
                scanners.push(enabledAndRequiredScanner);
                scanners.push(enabledNonRequiredScanner);

                const issues: ImageScanIssueDto[] = [];
  
                Object.keys(IssueSeverityType).forEach(severity => {
                  issues.push(...GenerateReasonablyFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                  issues.push(...GenerateReasonablyUnFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                  issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner.id));
                  issues.push(...GenerateTooManyUnFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner.id));
                })
    
                const result = Object.assign(new ImageScanResultPerPolicyDto(), {
                  policy: enabledAndRequiredPolicy,
                  issues: issues,
                  scanners: scanners
                });
                const complianceMap = new ComplianceResultMap();
                expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap)).toBeTruthy();
              })
            })
          })
        })
        describe('enabled and not required policy', () => {
          describe('with enabled scanners required or not required', () => {
            describe.each(
              [
                IssueSeverityType.CRITICAL,
                IssueSeverityType.HIGH,
                IssueSeverityType.MEDIUM,
                IssueSeverityType.LOW,
                IssueSeverityType.NEGLIGIBLE
              ])('with too few fixable or unfixable issues for severity %s', (severity) => {
                it('should be compliant', () => {
                  const scanners: ScannerDto[] = [];
                  scanners.push(enabledNonRequiredScanner);
                  scanners.push(enabledAndRequiredScanner);
      
                  const issues: ImageScanIssueDto[] = [];
  
                  issues.push(...GenerateTooManyFixableIssues(severity, enabledNonRequiredScanner.id));
                  issues.push(...GenerateTooManyUnFixableIssues(severity, enabledNonRequiredScanner.id));
                  issues.push(...GenerateReasonablyFixableIssues(severity, enabledAndRequiredScanner.id));
      
                  const result = Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndNonRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  });
                  const complianceMap = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap)).toBeTruthy();
                })
              })
            describe.each(
              [
                IssueSeverityType.CRITICAL,
                IssueSeverityType.HIGH,
                IssueSeverityType.MEDIUM,
                IssueSeverityType.LOW,
                IssueSeverityType.NEGLIGIBLE
            ])('with too many fixable/unfixable issues for severity %s', (severity) => {
              it('should be noncompliant', () => {
                const scanners: ScannerDto[] = [];
                scanners.push(enabledNonRequiredScanner);
                scanners.push(enabledAndRequiredScanner);
                
                const issues: ImageScanIssueDto[] = [];

                issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner.id));
                issues.push(...GenerateTooManyUnFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner.id));
                issues.push(...GenerateTooManyUnFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                  
                const result = Object.assign(new ImageScanResultPerPolicyDto(), {
                  policy: enabledAndNonRequiredPolicy,
                  issues: issues,
                  scanners: scanners
                });
                const complianceMap = new ComplianceResultMap();
                expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap)).toBeFalsy();
              })
            })
            describe('with too few fixable/unfixable issues for all severity', () => {
              it('should be compliant', () => {
                const scanners: ScannerDto[] = [];
                scanners.push(enabledNonRequiredScanner);
                scanners.push(enabledAndRequiredScanner);

                const issues: ImageScanIssueDto[] = [];

                Object.keys(IssueSeverityType).forEach(severity => {
                  issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner.id));
                  issues.push(...GenerateTooManyUnFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner.id));
                  issues.push(...GenerateReasonablyFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                  issues.push(...GenerateReasonablyUnFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                })
                  
                const result = Object.assign(new ImageScanResultPerPolicyDto(), {
                  policy: enabledAndNonRequiredPolicy,
                  issues: issues,
                  scanners: scanners
                });
                const complianceMap = new ComplianceResultMap();
                expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap)).toBeTruthy();
              })
            })
            describe('with too many fixable/unfixable issues for all severity', () => {
              it('should be noncompliant', () => {
                const scanners: ScannerDto[] = [];
                scanners.push(enabledNonRequiredScanner);
                scanners.push(enabledAndRequiredScanner);
  
                const issues: ImageScanIssueDto[] = [];
                
                Object.keys(IssueSeverityType).forEach(severity => {
                  issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner.id));
                  issues.push(...GenerateTooManyUnFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner.id));
                  issues.push(...GenerateTooManyUnFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                })
                  
                const result = Object.assign(new ImageScanResultPerPolicyDto(), {
                  policy: enabledAndNonRequiredPolicy,
                  issues: issues,
                  scanners: scanners
                });
                const complianceMap = new ComplianceResultMap();
                expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap)).toBeFalsy();
              })
            })
          })
          describe('with disabled scanners required or not required', () => {
            describe('number of fixable/unfixable issues does not matter', () => {
              it('always compliant', () => {
                const scanners: ScannerDto[] = [];
                scanners.push(disabledNonRequiredScanner);
                scanners.push(disabledAndRequiredScanner);
    
                const issues: ImageScanIssueDto[] = [];
  
                Object.keys(IssueSeverityType).forEach(severity => {
                  issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], disabledNonRequiredScanner.id));
                  issues.push(...GenerateTooManyUnFixableIssues(IssueSeverityType[severity], disabledNonRequiredScanner.id));
                  issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], disabledAndRequiredScanner.id));
                })
    
                const result = Object.assign(new ImageScanResultPerPolicyDto(), {
                  policy: enabledAndNonRequiredPolicy,
                  issues: issues,
                  scanners: scanners
                });
                const complianceMap = new ComplianceResultMap();
                expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap)).toBeTruthy();
              })
            })
          })  
          describe('with two enabled and not required scanner', () => {
            describe('too few fixable or unfixable issues in both scanner', () => {
              it('should be compliant', () => {
                const scanners: ScannerDto[] = [];
                scanners.push(enabledNonRequiredScanner);
                scanners.push(enabledNonRequiredScanner_1);

                const issues: ImageScanIssueDto[] = [];
  
                Object.keys(IssueSeverityType).forEach(severity => {
                  issues.push(...GenerateReasonablyFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner.id));
                  issues.push(...GenerateReasonablyUnFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner.id));
                  issues.push(...GenerateReasonablyFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner_1.id));
                  issues.push(...GenerateReasonablyUnFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner_1.id));
                })
    
                const result = Object.assign(new ImageScanResultPerPolicyDto(), {
                  policy: enabledAndNonRequiredPolicy,
                  issues: issues,
                  scanners: scanners
                });
                const complianceMap = new ComplianceResultMap();
                expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap)).toBeTruthy();
              })
            })
            describe('too many fixable or unfixable issues in one of the scanner but not both', () => {
              it('should be compliant', () => {
                const scanners: ScannerDto[] = [];
                scanners.push(enabledNonRequiredScanner);
                scanners.push(enabledNonRequiredScanner_1);

                const issues: ImageScanIssueDto[] = [];
               
                Object.keys(IssueSeverityType).forEach(severity => {
                  issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner.id));
                  issues.push(...GenerateTooManyUnFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner.id));
                  issues.push(...GenerateReasonablyFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner_1.id));
                  issues.push(...GenerateReasonablyUnFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner_1.id));
                })
    
                const result = Object.assign(new ImageScanResultPerPolicyDto(), {
                  policy: enabledAndNonRequiredPolicy,
                  issues: issues,
                  scanners: scanners
                });
                const complianceMap = new ComplianceResultMap();
                expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap)).toBeTruthy();
              })
            })
          })
          describe('with one enabled required scanner and another enabled non-required scanner', () => {
            describe('too few fixable or unfixable issues in required one and too many in non required one', () => {
              it('should be compliant', () => {
                const scanners: ScannerDto[] = [];
                scanners.push(enabledAndRequiredScanner);
                scanners.push(enabledNonRequiredScanner);

                const issues: ImageScanIssueDto[] = [];
  
                Object.keys(IssueSeverityType).forEach(severity => {
                  issues.push(...GenerateReasonablyFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                  issues.push(...GenerateReasonablyUnFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                  issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner.id));
                  issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner.id));
                })
    
                const result = Object.assign(new ImageScanResultPerPolicyDto(), {
                  policy: enabledAndNonRequiredPolicy,
                  issues: issues,
                  scanners: scanners
                });
                const complianceMap = new ComplianceResultMap();
                expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap)).toBeTruthy();
              })
            })
          })
        })
        describe('disabled policies required or not required independent of scanners', () => {
          it('always compliant', () => {
            let scanners: ScannerDto[] = [];
            scanners.push(enabledAndRequiredScanner);
            scanners.push(enabledAndRequiredScanner_1);

            let issues: ImageScanIssueDto[] = [];

            Object.keys(IssueSeverityType).forEach(severity => {
              issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
              issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner_1.id));
              issues.push(...GenerateReasonablyUnFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner_1.id));
            })

            let result = Object.assign(new ImageScanResultPerPolicyDto(), {
              policy: disabledAndRequiredPolicy,
              issues: issues,
              scanners: scanners
            });
            const complianceMap = new ComplianceResultMap();
            expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap)).toBeTruthy();

            scanners = [];
            scanners.push(enabledNonRequiredScanner);
            scanners.push(enabledNonRequiredScanner_1);
            scanners.push(enabledAndRequiredScanner);

            issues = [];

            Object.keys(IssueSeverityType).forEach(severity => {
              issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner.id));
              issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner_1.id));
              issues.push(...GenerateReasonablyUnFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner_1.id));
              issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
            })

            result = Object.assign(new ImageScanResultPerPolicyDto(), {
              policy: disabledAndNonRequiredPolicy,
              issues: issues,
              scanners: scanners
            });
            const complianceMap2 = new ComplianceResultMap();
            expect(imageComplianceService.isImageCompliant([result], undefined, complianceMap2)).toBeTruthy();
          })
        })
        describe('two active policy one required and another non required', () => {
          describe('both of the policies are compliant', () => {
            it('should be compliant', () => {
               const results: ImageScanResultPerPolicyDto[] = [];
               
               let scanners: ScannerDto[] = [];
                scanners.push(enabledAndRequiredScanner);
                scanners.push(enabledAndRequiredScanner_1);

                let issues: ImageScanIssueDto[] = [];
  
                Object.keys(IssueSeverityType).forEach(severity => {
                  issues.push(...GenerateReasonablyFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                  issues.push(...GenerateReasonablyUnFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner_1.id));
                })
    
                results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                  policy: enabledAndRequiredPolicy,
                  issues: issues,
                  scanners: scanners
                }));

                scanners = [];
                issues = [];

                scanners.push(enabledNonRequiredScanner);
                scanners.push(enabledNonRequiredScanner_1);

                Object.keys(IssueSeverityType).forEach(severity => {
                  issues.push(...GenerateReasonablyFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner.id));
                  issues.push(...GenerateReasonablyUnFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner_1.id));
                })

                results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                  policy: enabledAndNonRequiredPolicy,
                  issues: issues,
                  scanners: scanners
                }));
                const complianceMap = new ComplianceResultMap();
                expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap)).toBeTruthy();

            })
          })
          describe('one of the policy is not compliant', () => {
            it('should be non compliant', () => {
               const results: ImageScanResultPerPolicyDto[] = [];
               
               let scanners: ScannerDto[] = [];
                scanners.push(enabledAndRequiredScanner);
                scanners.push(enabledAndRequiredScanner_1);

                let issues: ImageScanIssueDto[] = [];
  
                Object.keys(IssueSeverityType).forEach(severity => {
                  issues.push(...GenerateReasonablyFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
                  issues.push(...GenerateReasonablyUnFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner_1.id));
                })
    
                results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                  policy: enabledAndRequiredPolicy,
                  issues: issues,
                  scanners: scanners
                }));

                scanners = [];
                issues = [];

                scanners.push(enabledNonRequiredScanner);
                scanners.push(enabledNonRequiredScanner_1);

                Object.keys(IssueSeverityType).forEach(severity => {
                  issues.push(...GenerateTooManyFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner.id));
                  issues.push(...GenerateTooManyUnFixableIssues(IssueSeverityType[severity], enabledNonRequiredScanner_1.id));
                })

                results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                  policy: enabledAndNonRequiredPolicy,
                  issues: issues,
                  scanners: scanners
                }));
              const complianceMap = new ComplianceResultMap();
                expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap)).toBeFalsy();

            })
          })
        })
      })
      describe('calculating compliant with exceptions', () => {
        describe('exceptions for all policies', () => {
          describe('with generic cve (empty string)', () => {
            describe('for all scanners', () => {
              describe('non compliant becomes compliant', () => {
                it('should be compliant', () => {
                  const results: ImageScanResultPerPolicyDto[] = [];
                  
                  let scanners: ScannerDto[] = [];
                  //required policy and required scanner setup
                  scanners.push(simpleTestScannerSetup(1, true, true));

                  let issues: ImageScanIssueDto[] = [];
                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 1));
                  issues.push(createIssue('cve2-c', IssueSeverityType.CRITICAL, true, 1));
                  issues.push(createIssue('cve3-m', IssueSeverityType.HIGH, false, 1));
                  issues.push(createIssue('cve4-m', IssueSeverityType.HIGH, false, 1));
                  issues.push(createIssue('cve5-m', IssueSeverityType.HIGH, false, 1));
                  
                  
                  
                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));
                  
                  scanners = [];
                  issues = [];

                  //not required policy and not required scanner setup
                  scanners.push(simpleTestScannerSetup(2, false, true));
                  
                  issues.push(createIssue('cve6-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve7-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve8-m', IssueSeverityType.HIGH, false, 2));
                  issues.push(createIssue('cve9-m', IssueSeverityType.HIGH, false, 2));
                  issues.push(createIssue('cve10-m', IssueSeverityType.HIGH, false, 2));
                 

                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndNonRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));

                  //verify that we are expecting false before adding expectation
                  const complianceMap = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap)).toBeFalsy();

                  const exceptions: ImageScanExceptionDto[] = [];

                  exceptions.push(createException("", undefined));
                  const complianceMap2 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, exceptions, complianceMap2)).toBeTruthy();
                })
              })
              describe('complaint remains compliant', () => {
                it('should be compliant', () => {
                  const results: ImageScanResultPerPolicyDto[] = [];
                  
                  let scanners: ScannerDto[] = [];
                  //required policy and required scanner setup
                  scanners.push(simpleTestScannerSetup(1, true, true));

                  let issues: ImageScanIssueDto[] = [];
                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 1));
                  
                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));
                  
                  scanners = [];
                  issues = [];

                  //not required policy and not required scanner setup
                  scanners.push(simpleTestScannerSetup(2, false, true));
                  
                  issues.push(createIssue('cve6-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve10-m', IssueSeverityType.HIGH, false, 2));
                 

                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndNonRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));

                  //verify that we are expecting false before adding expectation
                  const complianceMap = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap)).toBeTruthy();

                  const exceptions: ImageScanExceptionDto[] = [];

                  exceptions.push(createException("", undefined));

                  const complianceMap2 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, exceptions, complianceMap2)).toBeTruthy();
                })
              })
            })
            describe('for specific scanners', () => {
              describe('non compliant becomes compliant', () => {
                it('should be compliant', () => {
                  const results: ImageScanResultPerPolicyDto[] = [];
                  
                  let scanners: ScannerDto[] = [];

                  //required policy and required scanner setup
                  scanners.push(simpleTestScannerSetup(1, true, true));
                  
                  let issues: ImageScanIssueDto[] = [];
                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 1));
                  issues.push(createIssue('cve2-c', IssueSeverityType.CRITICAL, true, 1));
                  issues.push(createIssue('cve5-m', IssueSeverityType.HIGH, false, 1));
                  issues.push(createIssue('cve6-m', IssueSeverityType.HIGH, false, 1));
                  
                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));
                  
                  scanners = [];
                  issues = [];

                  //not required policy and not required scanner setup
                  scanners.push(simpleTestScannerSetup(2, false, true));
                  scanners.push(simpleTestScannerSetup(3, false, true));

                  issues.push(createIssue('cve6-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve7-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve8-m', IssueSeverityType.HIGH, false, 2));
                  issues.push(createIssue('cve9-m', IssueSeverityType.HIGH, false, 2));
                  issues.push(createIssue('cve10-m', IssueSeverityType.HIGH, false, 2));
                  issues.push(createIssue('cve11-c', IssueSeverityType.CRITICAL, true, 3));
                  issues.push(createIssue('cve12-c', IssueSeverityType.CRITICAL, true, 3));

                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndNonRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));
                  const complianceMap = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap)).toBeFalsy();

                  const exceptions: ImageScanExceptionDto[] = [];

                  exceptions.push(createException('', 1));
                  exceptions.push(createException('', 1));
                  const complianceMap2 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, exceptions, complianceMap2)).toBeFalsy();

                  exceptions.push(createException('', 3));
                  const complianceMap3 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, exceptions, complianceMap3)).toBeTruthy();
                })
                
              })
              describe('non compliant remains non compliant', () => {
                it('should be non compliant', () => {
                  const results: ImageScanResultPerPolicyDto[] = [];
                  
                  let scanners: ScannerDto[] = [];

                  //required policy and required scanner setup
                  scanners.push(simpleTestScannerSetup(1, true, true));
                  
                  let issues: ImageScanIssueDto[] = [];
                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 1));
                  issues.push(createIssue('cve2-c', IssueSeverityType.CRITICAL, true, 1));
                  issues.push(createIssue('cve5-m', IssueSeverityType.HIGH, false, 1));
                  issues.push(createIssue('cve6-m', IssueSeverityType.HIGH, false, 1));
                  
                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));
                  
                  scanners = [];
                  issues = [];

                  //not required policy and not required scanner setup
                  scanners.push(simpleTestScannerSetup(2, false, true));
                  scanners.push(simpleTestScannerSetup(3, false, true));

                  issues.push(createIssue('cve8-m', IssueSeverityType.HIGH, false, 2));
                  issues.push(createIssue('cve10-m', IssueSeverityType.HIGH, false, 2));
                  issues.push(createIssue('cve11-c', IssueSeverityType.CRITICAL, true, 3));
                  issues.push(createIssue('cve12-c', IssueSeverityType.CRITICAL, true, 3));

                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndNonRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));
                  const complianceMap = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap)).toBeFalsy();

                  const exceptions: ImageScanExceptionDto[] = [];

                  exceptions.push(createException('', 1));
                  exceptions.push(createException('', 1));

                  exceptions.push(createException('', 4));
                  const complianceMap2 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, exceptions, complianceMap2)).toBeFalsy();
                })
              })
              describe('compliant remains compliant', () => {
                it('should be compliant', () => {
                  const results: ImageScanResultPerPolicyDto[] = [];
                  
                  let scanners: ScannerDto[] = [];

                  //required policy and required scanner setup
                  scanners.push(simpleTestScannerSetup(1, true, true));
                  
                  let issues: ImageScanIssueDto[] = [];
                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 1));
                  issues.push(createIssue('cve5-m', IssueSeverityType.HIGH, false, 1));
                  
                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));
                  
                  scanners = [];
                  issues = [];

                  //not required policy and not required scanner setup
                  scanners.push(simpleTestScannerSetup(2, false, true));
                  scanners.push(simpleTestScannerSetup(3, false, true));

                  issues.push(createIssue('cve8-m', IssueSeverityType.HIGH, false, 2));
                  issues.push(createIssue('cve10-m', IssueSeverityType.HIGH, false, 2));
                  issues.push(createIssue('cve12-c', IssueSeverityType.CRITICAL, true, 3));

                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndNonRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));
                  const complianceMap = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap)).toBeTruthy();

                  const exceptions: ImageScanExceptionDto[] = [];

                  exceptions.push(createException('', 1));
                  exceptions.push(createException('', 1));

                  exceptions.push(createException('', 4));
                  const complianceMap2 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, exceptions, complianceMap2)).toBeTruthy();
                })
              })
            })
          })
          describe('with specific cve', () => {
            describe('for all scanners', () => {
              describe('non compliant becomes compliant', () => {
                it('should be compliant', () => {
                  const results: ImageScanResultPerPolicyDto[] = [];
                  
                  let scanners: ScannerDto[] = [];
                  //required policy and required scanner setup
                  
                  let issues: ImageScanIssueDto[] = [];
                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 1));
                  issues.push(createIssue('cve2-c', IssueSeverityType.CRITICAL, true, 1));
                  
                  scanners.push(simpleTestScannerSetup(1, true, true));
                  
                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));
                  
                  scanners = [];
                  issues = [];

                  //not required policy and not required scanner setup
                  scanners.push(simpleTestScannerSetup(2, false, true));
                  scanners.push(simpleTestScannerSetup(3, false, true));

                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve2-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve8-m', IssueSeverityType.HIGH, false, 2));
                  issues.push(createIssue('cve9-m', IssueSeverityType.HIGH, false, 2));
                  

                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndNonRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));
                  const complianceMap = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap)).toBeFalsy();

                  const exceptions: ImageScanExceptionDto[] = [];

                  exceptions.push(createException('cve1-c', undefined));
                  exceptions.push(createException('cve2-c', undefined));
                  const complianceMap2 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, exceptions, complianceMap2)).toBeFalsy();

                  exceptions.push(createException('cve9-m', undefined));
                  const complianceMap3 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, exceptions, complianceMap3)).toBeTruthy();
                })
              })
              describe('non compliant remains non compliant', () => {
                it('should be non compliant', () => {
                  const results: ImageScanResultPerPolicyDto[] = [];
                  
                  let scanners: ScannerDto[] = [];
                  //required policy and required scanner setup
                  
                  let issues: ImageScanIssueDto[] = [];
                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 1));
                  issues.push(createIssue('cve2-c', IssueSeverityType.CRITICAL, true, 1));
                  
                  scanners.push(simpleTestScannerSetup(1, true, true));
                  
                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));
                  
                  scanners = [];
                  issues = [];

                  //not required policy and not required scanner setup
                  scanners.push(simpleTestScannerSetup(2, false, true));
                  scanners.push(simpleTestScannerSetup(3, false, true));

                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve2-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve8-m', IssueSeverityType.HIGH, false, 2));
                  issues.push(createIssue('cve9-m', IssueSeverityType.HIGH, false, 2));
                  

                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndNonRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));
                  const complianceMap = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap)).toBeFalsy();

                  const exceptions: ImageScanExceptionDto[] = [];

                  exceptions.push(createException('cve1-c', undefined));
                  exceptions.push(createException('cve2-c', undefined));
                  
                  exceptions.push(createException('cve9-m', undefined));
                  const complianceMap2 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, exceptions, complianceMap2)).toBeTruthy();

                  exceptions.pop();
                  exceptions.push(createException('cve9-not-found-m', undefined));
                  const complianceMap3 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, exceptions, complianceMap3)).toBeFalsy();
                })
              })
              describe('complaint remains compliant', () => {
                it('should be compliant', () => {
                  const results: ImageScanResultPerPolicyDto[] = [];
                  
                  let scanners: ScannerDto[] = [];
                  //required policy and required scanner setup
                  
                  let issues: ImageScanIssueDto[] = [];
                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 1));
                  
                  scanners.push(simpleTestScannerSetup(1, true, true));
                  
                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));
                  
                  scanners = [];
                  issues = [];

                  //not required policy and not required scanner setup
                  scanners.push(simpleTestScannerSetup(2, false, true));
                  scanners.push(simpleTestScannerSetup(3, false, true));

                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve9-m', IssueSeverityType.HIGH, false, 2));
                  

                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndNonRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));

                  const complianceMap = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap)).toBeTruthy();

                  const exceptions: ImageScanExceptionDto[] = [];

                  exceptions.push(createException('cve1-c', undefined));
                  exceptions.push(createException('cve2-c', undefined));
                  

                  exceptions.push(createException('cve9-m', undefined));
                  const complianceMap2 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, exceptions, complianceMap2)).toBeTruthy();
                })
              })
            })
            describe('for specific scanners', () => {
              describe('non compliant becomes compliant', () => {
                it('should be compliant', () => {
                  const results: ImageScanResultPerPolicyDto[] = [];
                  
                  let scanners: ScannerDto[] = [];
                  //required policy and required scanner setup
                  
                  let issues: ImageScanIssueDto[] = [];
                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 1));
                  issues.push(createIssue('cve2-c', IssueSeverityType.CRITICAL, true, 1));
                  
                  scanners.push(simpleTestScannerSetup(1, true, true));
                  
                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));
                  
                  scanners = [];
                  issues = [];

                  //not required policy and not required scanner setup
                  scanners.push(simpleTestScannerSetup(2, false, true));
                  scanners.push(simpleTestScannerSetup(3, false, true));

                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve2-c', IssueSeverityType.CRITICAL, true, 2));
                  

                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndNonRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));
                  const complianceMap = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap)).toBeFalsy();

                  const exceptions: ImageScanExceptionDto[] = [];

                  exceptions.push(createException('cve1-c', 1));
                  exceptions.push(createException('cve2-c', 1));
                  const complianceMap2 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, exceptions, complianceMap2)).toBeFalsy();

                  exceptions.push(createException('cve1-c', 2));
                  const complianceMap3 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, exceptions, complianceMap3)).toBeTruthy();
                })
              })
              describe('non compliant remains non compliant', () => {
                it('should be non compliant', () => {
                  const results: ImageScanResultPerPolicyDto[] = [];
                  
                  let scanners: ScannerDto[] = [];
                  //required policy and required scanner setup
                  
                  let issues: ImageScanIssueDto[] = [];
                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 1));
                  issues.push(createIssue('cve2-c', IssueSeverityType.CRITICAL, true, 1));
                  
                  scanners.push(simpleTestScannerSetup(1, true, true));
                  
                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));
                  
                  scanners = [];
                  issues = [];

                  //not required policy and not required scanner setup
                  scanners.push(simpleTestScannerSetup(2, false, true));
                  scanners.push(simpleTestScannerSetup(3, false, true));

                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve2-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve8-m', IssueSeverityType.HIGH, false, 2));
                  issues.push(createIssue('cve9-m', IssueSeverityType.HIGH, false, 2));
                  

                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndNonRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));
                  const complianceMap = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap)).toBeFalsy();

                  const exceptions: ImageScanExceptionDto[] = [];

                  exceptions.push(createException('cve1-c', 1));
                  exceptions.push(createException('cve2-c', 1));
                  exceptions.push(createException('cve1-c', 2));
                  exceptions.push(createException('cve2-c', 2));
                  
                  exceptions.push(createException('cve9-m', 3));
                  const complianceMap2 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, exceptions, complianceMap2)).toBeFalsy();
                })
              })
              describe('complaint remains compliant', () => {
                it('compliant remains compliant', () => {
                  const results: ImageScanResultPerPolicyDto[] = [];
                  
                  let scanners: ScannerDto[] = [];
                  //required policy and required scanner setup
                  
                  let issues: ImageScanIssueDto[] = [];
                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 1));
                  
                  scanners.push(simpleTestScannerSetup(1, true, true));
                  
                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));
                  
                  scanners = [];
                  issues = [];

                  //not required policy and not required scanner setup
                  scanners.push(simpleTestScannerSetup(2, false, true));
                  scanners.push(simpleTestScannerSetup(3, false, true));

                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 2));
                  

                  results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndNonRequiredPolicy,
                    issues: issues,
                    scanners: scanners
                  }));

                  const complianceMap3 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap3)).toBeTruthy();

                  const exceptions: ImageScanExceptionDto[] = [];

                  exceptions.push(createException('cve1-c', 1));
                  exceptions.push(createException('cve2-c', 1));
                  exceptions.push(createException('cve1-c', 2));
                  const complianceMap = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, exceptions, complianceMap)).toBeTruthy();
                })
              })
            })
          })
        })
        describe('exceptions for specific policies', () => {
          describe('with generic cve (empty string)', () => {
            describe('for all scanners', () => {
              describe('non compliant becomes compliant', () => {
                it('should be compliant', () => {
                  let results: ImageScanResultPerPolicyDto[] = [];
                  
                  let scanners: ScannerDto[] = [];
                  //required policy and required scanner setup
                  scanners.push(simpleTestScannerSetup(1, true, true));
                  scanners.push(simpleTestScannerSetup(13, true, true));

                  let issues: ImageScanIssueDto[] = [];
                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 1));
                  issues.push(createIssue('cve2-c', IssueSeverityType.CRITICAL, true, 1));
                  issues.push(createIssue('cve3-m', IssueSeverityType.HIGH, false, 13));
                  issues.push(createIssue('cve4-m', IssueSeverityType.HIGH, false, 13));
                  issues.push(createIssue('cve5-m', IssueSeverityType.HIGH, false, 13));
                  
                  let exceptions: ImageScanExceptionDto[] = [];

                  exceptions.push(createException("", undefined));

                  const requiredPolicyResult = Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndRequiredPolicy,
                    issues: issues,
                    scanners: scanners,
                    exceptions: exceptions
                  });
                 
                  results.push(requiredPolicyResult);

                  const complianceMap = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap)).toBeTruthy();
                  
                  scanners = [];
                  issues = [];
                  exceptions = [];
                  results = [];

                  //not required policy and not required scanner setup
                  scanners.push(simpleTestScannerSetup(2, false, true));
                  scanners.push(simpleTestScannerSetup(13, false, true));
                  
                  issues.push(createIssue('cve6-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve7-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve8-m', IssueSeverityType.HIGH, false, 13));
                  issues.push(createIssue('cve9-m', IssueSeverityType.HIGH, false, 13));
                  issues.push(createIssue('cve10-m', IssueSeverityType.HIGH, false, 13));
                  

                  const nonRequiredPolicyResult = Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndNonRequiredPolicy,
                    issues: issues,
                    scanners: scanners,
                    exceptions: exceptions
                  });
                  
                  results.push(nonRequiredPolicyResult);

                  exceptions.push(createException("", undefined));
                  const complianceMap2 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap2)).toBeTruthy();

                  results = [];
                  results.push(requiredPolicyResult);
                  results.push(nonRequiredPolicyResult);
                  const complianceMap3 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, exceptions, complianceMap3)).toBeTruthy();
                })
              })
            })
            describe('for specific scanners', () => {
              describe('non compliant becomes compliant', () => {
                it('should be compliant', () => {
                  let results: ImageScanResultPerPolicyDto[] = [];
                  
                  let scanners: ScannerDto[] = [];
                  //required policy and required scanner setup
                  scanners.push(simpleTestScannerSetup(1, true, true));
                  scanners.push(simpleTestScannerSetup(13, true, true));

                  let issues: ImageScanIssueDto[] = [];
                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 1));
                  issues.push(createIssue('cve2-c', IssueSeverityType.CRITICAL, true, 1));
                  issues.push(createIssue('cve3-m', IssueSeverityType.HIGH, false, 13));
                  issues.push(createIssue('cve4-m', IssueSeverityType.HIGH, false, 13));
                  issues.push(createIssue('cve5-m', IssueSeverityType.HIGH, false, 13));
                  
                  let exceptions: ImageScanExceptionDto[] = [];

                  exceptions.push(createException("", 1));
                  
                  const requiredPolicyResult = Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndRequiredPolicy,
                    issues: issues,
                    scanners: scanners,
                    exceptions: exceptions
                  });
                 
                  results.push(requiredPolicyResult);
                  const complianceMap = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap)).toBeFalsy();
                  
                  scanners = [];
                  issues = [];
                  exceptions = [];
                  results = [];

                  //not required policy and not required scanner setup
                  scanners.push(simpleTestScannerSetup(2, false, true));
                  scanners.push(simpleTestScannerSetup(13, false, true));
                  
                  issues.push(createIssue('cve6-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve7-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve8-m', IssueSeverityType.HIGH, false, 13));
                  issues.push(createIssue('cve9-m', IssueSeverityType.HIGH, false, 13));
                  issues.push(createIssue('cve10-m', IssueSeverityType.HIGH, false, 13));
                  

                  const nonRequiredPolicyResult = Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndNonRequiredPolicy,
                    issues: issues,
                    scanners: scanners,
                    exceptions: exceptions
                  });
                  
                  results.push(nonRequiredPolicyResult);

                  exceptions.push(createException("", 2));
                  const complianceMap2 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap2)).toBeTruthy();

                  results = [];
                  results.push(requiredPolicyResult);
                  results.push(nonRequiredPolicyResult);
                  const complianceMap3 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, [createException("", 13)], complianceMap3)).toBeTruthy();
                })
              })
            })
          })
          describe('with generic specific cve', () => {
            describe('for all scanners', () => {
              describe('non compliant becomes compliant', () => {
                it('should be compliant', () => {
                  let results: ImageScanResultPerPolicyDto[] = [];
                  
                  let scanners: ScannerDto[] = [];
                  //required policy and required scanner setup
                  scanners.push(simpleTestScannerSetup(1, true, true));
                  scanners.push(simpleTestScannerSetup(13, true, true));

                  let issues: ImageScanIssueDto[] = [];
                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 1));
                  issues.push(createIssue('cve2-c', IssueSeverityType.CRITICAL, true, 1));
                  issues.push(createIssue('cve3-m', IssueSeverityType.HIGH, false, 13));
                  issues.push(createIssue('cve4-m', IssueSeverityType.HIGH, false, 13));
                  issues.push(createIssue('cve5-m', IssueSeverityType.HIGH, false, 13));
                  
                  let exceptions: ImageScanExceptionDto[] = [];

                  exceptions.push(createException("cve1-c", undefined));
                  exceptions.push(createException("cve2-c", undefined));

                  const requiredPolicyResult = Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndRequiredPolicy,
                    issues: issues,
                    scanners: scanners,
                    exceptions: exceptions
                  });
                 
                  results.push(requiredPolicyResult);
                  const complianceMap = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap)).toBeFalsy();
                  
                  scanners = [];
                  issues = [];
                  exceptions = [];
                  results = [];

                  //not required policy and not required scanner setup
                  scanners.push(simpleTestScannerSetup(2, false, true));
                  scanners.push(simpleTestScannerSetup(13, false, true));
                  
                  issues.push(createIssue('cve6-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve7-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve8-m', IssueSeverityType.HIGH, false, 13));
                  issues.push(createIssue('cve9-m', IssueSeverityType.HIGH, false, 13));
                  issues.push(createIssue('cve10-m', IssueSeverityType.HIGH, false, 13));
                  

                  const nonRequiredPolicyResult = Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndNonRequiredPolicy,
                    issues: issues,
                    scanners: scanners,
                    exceptions: exceptions
                  });
                  
                  results.push(nonRequiredPolicyResult);

                  exceptions.push(createException("cve6-c", undefined));
                  exceptions.push(createException("cve7-c", undefined));
                  const complianceMap2 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap2)).toBeTruthy();

                  results = [];
                  results.push(requiredPolicyResult);
                  results.push(nonRequiredPolicyResult);

                  const generalExceptions: ImageScanExceptionDto[] = [];
                  generalExceptions.push(createException("cve3-m", undefined));
                  generalExceptions.push(createException("cve4-m", undefined));

                  const complianceMap3 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, generalExceptions, complianceMap3)).toBeTruthy();
                })
              })
            })
            describe('for specific scanners', () => {
              describe('non compliant becomes compliant', () => {
                it('should be compliant', () => {
                  let results: ImageScanResultPerPolicyDto[] = [];
                  
                  let scanners: ScannerDto[] = [];
                  //required policy and required scanner setup
                  scanners.push(simpleTestScannerSetup(1, true, true));
                  scanners.push(simpleTestScannerSetup(13, true, true));

                  let issues: ImageScanIssueDto[] = [];
                  issues.push(createIssue('cve1-c', IssueSeverityType.CRITICAL, true, 1));
                  issues.push(createIssue('cve2-c', IssueSeverityType.CRITICAL, true, 1));
                  issues.push(createIssue('cve3-m', IssueSeverityType.HIGH, false, 13));
                  issues.push(createIssue('cve4-m', IssueSeverityType.HIGH, false, 13));
                  issues.push(createIssue('cve5-m', IssueSeverityType.HIGH, false, 13));
                  
                  let exceptions: ImageScanExceptionDto[] = [];

                  exceptions.push(createException("cve1-c", 1));
                  exceptions.push(createException("cve2-c", 1));
                  exceptions.push(createException('cve5-m', 13));

                  const requiredPolicyResult = Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndRequiredPolicy,
                    issues: issues,
                    scanners: scanners,
                    exceptions: exceptions
                  });
                 
                  results.push(requiredPolicyResult);
                  const complianceMap = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap)).toBeFalsy();
                  
                  scanners = [];
                  issues = [];
                  exceptions = [];
                  results = [];

                  //not required policy and not required scanner setup
                  scanners.push(simpleTestScannerSetup(2, false, true));
                  scanners.push(simpleTestScannerSetup(13, false, true));
                  
                  issues.push(createIssue('cve6-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve7-c', IssueSeverityType.CRITICAL, true, 2));
                  issues.push(createIssue('cve8-m', IssueSeverityType.HIGH, false, 13));
                  issues.push(createIssue('cve9-m', IssueSeverityType.HIGH, false, 13));
                  issues.push(createIssue('cve10-m', IssueSeverityType.HIGH, false, 13));
                  

                  const nonRequiredPolicyResult = Object.assign(new ImageScanResultPerPolicyDto(), {
                    policy: enabledAndNonRequiredPolicy,
                    issues: issues,
                    scanners: scanners,
                    exceptions: exceptions
                  });
                  
                  results.push(nonRequiredPolicyResult);

                  exceptions.push(createException("cve6-c", 2));
                  exceptions.push(createException("cve7-c", 2));
                  const complianceMap2 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap2)).toBeTruthy();

                  results = [];
                  results.push(requiredPolicyResult);
                  results.push(nonRequiredPolicyResult);

                  const generalExceptions: ImageScanExceptionDto[] = [];
                  generalExceptions.push(createException("cve3-m", 13));
                  const complianceMap3 = new ComplianceResultMap();
                  expect(imageComplianceService.isImageCompliant(results, generalExceptions, complianceMap3)).toBeTruthy();
                })
              })
            })
          })
        })
      })

      describe('with error in policy', () => {
        it('should be noncompliant', () => {
           const results: ImageScanResultPerPolicyDto[] = [];
           
           const scanners: ScannerDto[] = [];
            scanners.push(enabledAndRequiredScanner);

            const issues: ImageScanIssueDto[] = [];

            Object.keys(IssueSeverityType).forEach(severity => {
              issues.push(...GenerateReasonablyFixableIssues(IssueSeverityType[severity], enabledAndRequiredScanner.id));
            })

            results.push(Object.assign(new ImageScanResultPerPolicyDto(), {
              policy: enabledAndRequiredPolicy,
              issues: issues,
              scanners: scanners,
              encounteredError: true
            }));
            const complianceMap = new ComplianceResultMap();
            expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap)).toBeFalsy();
        })
      })
      describe('No scan performed yet', () => {
        it('should be noncompliant', () => {
           const results: ImageScanResultPerPolicyDto[] = [];

            const complianceMap = new ComplianceResultMap();
            expect(imageComplianceService.isImageCompliant(results, undefined, complianceMap)).toBeFalsy();
        })
      })
    });

    function GenerateReasonablyFixableIssues(severity: IssueSeverityType, scannerId: number): ImageScanIssueDto[] {
      const issues: ImageScanIssueDto[] = [];

      let fixableLimit = 0;

      switch(severity) {
        case IssueSeverityType.CRITICAL:
          fixableLimit = vulnerabilitySettings.fixableCritical;
          break;
        case IssueSeverityType.HIGH:
          fixableLimit = vulnerabilitySettings.fixableMajor;
          break;
        case IssueSeverityType.MEDIUM:
          fixableLimit = vulnerabilitySettings.fixableNormal;
          break;
        case IssueSeverityType.LOW:
          fixableLimit = vulnerabilitySettings.fixableLow;
          break;
        case IssueSeverityType.NEGLIGIBLE:
          fixableLimit = vulnerabilitySettings.fixableNegligible;
          break;
      }

      for (let i = 0; i < fixableLimit; i++) {
        issues.push(createIssue(`cve-${i}-${severity}-${scannerId}-Fixable`, severity, true, scannerId));
      }

      return issues;
    }

    function GenerateReasonablyUnFixableIssues(severity: IssueSeverityType, scannerId: number): ImageScanIssueDto[] {
      const issues: ImageScanIssueDto[] = [];

      let fixableLimit = 0;

      switch(severity) {
        case IssueSeverityType.CRITICAL:
          fixableLimit = vulnerabilitySettings.unFixableCritical;
          break;
        case IssueSeverityType.HIGH:
          fixableLimit = vulnerabilitySettings.unFixableMajor;
          break;
        case IssueSeverityType.MEDIUM:
          fixableLimit = vulnerabilitySettings.unFixableNormal;
          break;
        case IssueSeverityType.LOW:
          fixableLimit = vulnerabilitySettings.unFixableLow;
          break;
        case IssueSeverityType.NEGLIGIBLE:
          fixableLimit = vulnerabilitySettings.unFixableNegligible;
          break;
      }

      for (let i = 0; i < fixableLimit; i++) {
        issues.push(createIssue(`cve-${i}-${severity}-${scannerId}-UnFixable`, severity, false, scannerId));
      }

      return issues;
    }

    function GenerateTooManyFixableIssues(severity: IssueSeverityType, scannerId: number): ImageScanIssueDto[] {
      const issues: ImageScanIssueDto[] = [];

      let fixableLimit = 0;

      switch(severity) {
        case IssueSeverityType.CRITICAL:
          fixableLimit = vulnerabilitySettings.fixableCritical;
          break;
        case IssueSeverityType.HIGH:
          fixableLimit = vulnerabilitySettings.fixableMajor;
          break;
        case IssueSeverityType.MEDIUM:
          fixableLimit = vulnerabilitySettings.fixableNormal;
          break;
        case IssueSeverityType.LOW:
          fixableLimit = vulnerabilitySettings.fixableLow;
          break;
        case IssueSeverityType.NEGLIGIBLE:
          fixableLimit = vulnerabilitySettings.fixableNegligible;
          break;
      }

      for (let i = 0; i < fixableLimit + 2; i++) {
        issues.push(createIssue(`cve-${i}-${severity}-${scannerId}-Fixable`, severity, true, scannerId));
      }

      return issues;
    }

    function GenerateTooManyUnFixableIssues(severity: IssueSeverityType, scannerId: number): ImageScanIssueDto[] {
      const issues: ImageScanIssueDto[] = [];

      let fixableLimit = 0;

      switch(severity) {
        case IssueSeverityType.CRITICAL:
          fixableLimit = vulnerabilitySettings.unFixableCritical;
          break;
        case IssueSeverityType.HIGH:
          fixableLimit = vulnerabilitySettings.unFixableMajor;
          break;
        case IssueSeverityType.MEDIUM:
          fixableLimit = vulnerabilitySettings.unFixableNormal;
          break;
        case IssueSeverityType.LOW:
          fixableLimit = vulnerabilitySettings.unFixableLow;
          break;
        case IssueSeverityType.NEGLIGIBLE:
          fixableLimit = vulnerabilitySettings.unFixableNegligible;
          break;
      }

      for (let i = 0; i < fixableLimit + 2; i++) {
        issues.push(createIssue(`cve-${i}-${severity}-${scannerId}-UnFixable`, severity, false, scannerId));
      }

      return issues;
    }

    function createIssue(code: string, severity: IssueSeverityType, fixable: boolean, scannerId: number): ImageScanIssueDto {
      const issue = new ImageScanIssueDto();
      issue.scannerId = scannerId;
      issue.severity = IssueSeverityType[severity];
      issue.cveCode = code;
      issue.isFixable = fixable;
  
      return issue;
    }
  
    function testScannerSetup(id:number, required: boolean, enabled: boolean): ScannerDto {
      const scanner = new ScannerDto();
      scanner.id = id;
      scanner.vulnerabilitySettings = vulnerabilitySettings;
      scanner.required = required;
      scanner.enabled = enabled;
  
      return scanner;
    }

    function simpleTestScannerSetup(id:number, required: boolean, enabled: boolean): ScannerDto {
      const scanner = new ScannerDto();
      scanner.id = id;
      scanner.vulnerabilitySettings = simpleVulnerabilitySetting;
      scanner.required = required;
      scanner.enabled = enabled;
  
      return scanner;
    }

    function createException(cveCode: string, scannerId: number): ImageScanExceptionDto {
      const exception = new ImageScanExceptionDto();
      exception.issueIdentifier = cveCode;
      exception.scannerId = scannerId;

      return exception;
    }
  });

  

