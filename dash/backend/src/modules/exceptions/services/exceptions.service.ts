import {forwardRef, HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import {ExceptionsDao} from '../dao/exceptions.dao';
import {ExceptionCreateDto} from '../dto/exceptioncreateDto';
import {ExceptionListDto} from '../dto/exceptionListDto';
import {EmailService} from '../../shared/services/email.service';
import {ConfigService} from '@nestjs/config';
import {ExceptionType} from '../enum/ExceptionType';
import {ExceptionDto, ExceptionQueryDto} from '../dto/exception-dto';
import {PodService} from '../../pod/services/pod.service';
import {ClusterEventService} from '../../cluster-event/services/cluster-event.service';
import {ClusterService} from '../../cluster/services/cluster.service';
import {NamespaceService} from '../../namespace/services/namespace.service';
import {LicensingPortalService} from '../../../integrations/licensing-portal/licensing-portal.service';
import {ExceptionBlockService} from '../../command-line/services/exception-block.service';
import {AuditLogService} from '../../audit-log/services/audit-log.service';
import {ExceptionK8sInfoDto} from '../dto/exception-k8s-info-dto';


@Injectable()
export class ExceptionsService {
  constructor(
    private readonly exceptionsDao: ExceptionsDao,
    @Inject(forwardRef(() => ClusterService))
    private readonly clusterService: ClusterService,
    @Inject(forwardRef(() => ExceptionBlockService))
    private readonly exceptionBlockService: ExceptionBlockService,
    private readonly email: EmailService,
    private readonly configService: ConfigService,
    private readonly podService: PodService,
    private readonly clusterEventService: ClusterEventService,
    private readonly kubernetesNamespaceService: NamespaceService,
    @Inject(forwardRef(() => LicensingPortalService))
    private readonly licensingPortalService: LicensingPortalService,
    private readonly auditLogService: AuditLogService,
  ) {}


  // fromClusterValidation : whether the exception is being created from cluster validation controller or not
  // k8sInfo : object being passed here from cluster validation containing some Pod info
  async createException(exceptionInfo: {exception: ExceptionCreateDto, k8sInfo?: ExceptionK8sInfoDto}[],
                        userId: number = 1,
                        fromClusterValidation = false, skipEmail = false): Promise<number[]> {
      const createdExceptionIds: number[] = [];
      const createdExceptions: {exception: ExceptionDto, k8sInfo: ExceptionK8sInfoDto}[] = [];
      for (const exception of exceptionInfo) {
          if (await this.validateExceptionCreateDto(exception.exception)) {
              const exceptionId = await this.exceptionsDao.createException(exception.exception, userId);

              const exceptionArray: ExceptionDto[] = await this.exceptionsDao.getException(exceptionId);
              const clusterIds = exceptionArray[0].clusters.length ? exceptionArray[0].clusters.map(c => c.id) : [];
              const namespace = 'default';
              const message = `An Exception: ${exceptionArray[0].title} has been created`;

              if (clusterIds.length) {
                      clusterIds.forEach(clusterId =>
                          this.clusterEventService.createK8sClusterEvent(
                              'ExceptionCreated', 'Normal', null, null, message, clusterId, namespace)
                              .catch(e => console.error('Failed to create kubernetes cluster event: ' + e))
                      )
              } else {
                  const clusters = await this.clusterService.getAllClusters();
                  if (clusters?.length) {
                      clusters
                          .map(cluster => cluster.id)
                          .forEach(clusterId => this.clusterEventService.createK8sClusterEvent(
                                'ExceptionCreated', 'Normal', null, null, message, clusterId, namespace)
                              .catch(e => console.error('Failed to create kubernetes cluster event: ' + e))
                          );
                  }
              }
              if (exceptionArray[0].type === 'gatekeeper') {
                  this.syncGatekeeperBlocks().catch(e => console.log('Error syncing GateKeeper exception blocks: ' + e));
              }
              createdExceptionIds.push(exceptionId);
              createdExceptions.push({exception: exceptionArray[0], k8sInfo: exception.k8sInfo});
          }
      }
      if (!skipEmail && createdExceptions.length > 0) {
          this.sendExceptionEmail(createdExceptions, userId, fromClusterValidation)
              .catch(e => console.log("Error sending email " + e));

      }
      return createdExceptionIds;
  }

  async sendExceptionEmail(exceptionArray: {exception: ExceptionDto, k8sInfo?: ExceptionK8sInfoDto}[], userId: number,
                           fromClusterValidation = false) {
      if (!exceptionArray || exceptionArray.length === 0) { return }

      const exceptionContextArray = this.mapExceptionContexts(exceptionArray, fromClusterValidation);
      const getExceptionCreatorFullName =  await this.exceptionsDao.getExceptionCreatorFullName(userId);
      const exceptionCreatorFullName = getExceptionCreatorFullName[0]?.fullName;
      const getAdminsToMail = await this.exceptionsDao.getAllAdminsToMail();

      // currently assumes all exceptions will be of the same type when sending an email. Will need additional work
      // to support sending mixed exception types
      if (fromClusterValidation && exceptionArray[0].exception.status === ExceptionType.ACTIVE) {
          for (const user of getAdminsToMail) {
               this.email.send({
                  to: user.email,
                  from: this.configService.get('email.default.sender'),
                  subject: `A Security Issue has been detected and Temporary Exception has been created by system automatically. `,
                  template: 'exception-create-from-validation-webhook-email-notification',
                  context: {
                      user: user.fullName,
                      exceptions: exceptionContextArray,
                      multipleExceptions: exceptionContextArray.length > 1,
                  }
              }).catch(e => {
                  console.log('Error sending exception creation email: ' + e);
              });
          }
      } else if (exceptionArray[0].exception.status === ExceptionType.REVIEW) {
          for (const user of getAdminsToMail) {
              this.email.send({
                  to: user.email,
                  from: this.configService.get('email.default.sender'),
                  subject: `An Exception Request has been Submitted by ${exceptionCreatorFullName}.`,
                  template: 'exception-request-email-notification',
                  context: {
                      user: user.fullName,
                      exceptionCreatorFullName: exceptionCreatorFullName,
                      exceptions: exceptionContextArray,
                      multipleExceptions: exceptionContextArray.length > 1,
                  }
              }).catch(e => {
                  console.log('Error sending exception request email: ' + e);
              });
          }
      } else if (exceptionArray[0].exception.status === ExceptionType.ACTIVE) {
          for (const user of getAdminsToMail) {
               this.email.send({
                  to: user.email,
                  from: this.configService.get('email.default.sender'),
                  subject: `An exception has been Created by ${exceptionCreatorFullName}`,
                  template: 'exception-create-email-notification',
                  context: {
                      user: user.fullName,
                      exceptionCreatorFullName: exceptionCreatorFullName,
                      exceptions: exceptionContextArray,
                      multipleExceptions: exceptionContextArray.length > 1,
                  }
              }).catch(e => {
                  console.log('Error sending exception creation email: ' + e);
              });
          }
      }
  }

  mapExceptionContexts(exceptionArray: {exception: ExceptionDto, k8sInfo?: ExceptionK8sInfoDto}[], fromClusterValidation: boolean) {
        return exceptionArray.map(exception => {
            const namespaces = exception.exception.namespaces.length ? exception.exception.namespaces.map(n => n.name).join(', ') : 'All Namespaces';
            const scanners = exception.exception.scanner ? exception.exception.scanner['name'] : 'All Scanners';
            const expiryDate = exception.exception.endDate ? exception.exception.endDate : null;
            const clusterName = exception.exception.clusters.length ? exception.exception.clusters.map(c => c.name).join(', ') : 'All Clusters';

            if (fromClusterValidation && exception.exception.status === ExceptionType.ACTIVE) {
                return {
                    exceptionTitle: exception.exception.title,
                    issueIdentifier: exception.exception.issueIdentifier,
                    scanners: scanners,
                    namespaces: namespaces,
                    endDate: expiryDate,
                    imageName: exception.k8sInfo['imageName'] ?? 'N/A',
                    severity: exception.k8sInfo['severity'] ?? 'N/A'
                };
            } else if (exception.exception.status === ExceptionType.REVIEW || exception.exception.status === ExceptionType.ACTIVE) {
                return {
                    exceptionTitle: exception.exception.title,
                    issueIdentifier: exception.exception.issueIdentifier,
                    scanners: scanners,
                    namespaces: namespaces,
                    hasEndDate: !!expiryDate,
                    expiryDate: expiryDate,
                    clusterName: clusterName,
                    url: `${this.configService.get('server.frontendUrl')}/private/exceptions/${exception.exception.id}`
                };
            }
        });
    }

    async getAllExceptions(): Promise<ExceptionListDto[]> {
return await this.exceptionsDao.getAllSimpleExceptions();
}

async getAllActiveExceptions(): Promise<ExceptionDto[]> {
    return await this.exceptionsDao.getAllActiveExceptions();
}

async getAllFilteredPolicyExceptions(clusterId: number, policyIds: number[],
    namespace: string, imageName: string): Promise<ExceptionQueryDto[]> {
    return await this.exceptionsDao.getAllFilteredPolicyExceptions(clusterId, policyIds, namespace, imageName);
}
async getAllFilteredOverrideExceptions(clusterId: number, policyIds: number[],
                                      imageName: string): Promise<ExceptionQueryDto[]> {
    return await this.exceptionsDao.getAllFilteredOverrideExceptions(clusterId, policyIds, imageName);
}
async getAllCommonExceptions(): Promise<ExceptionDto[]> {
    return await this.exceptionsDao.getAllCommonExceptions();
}

async getAllCommonExceptionsWithIssueIdentifier(issueIdentifier: string): Promise<ExceptionDto[]> {
    return await this.exceptionsDao.getAllCommonExceptionsWithIssueIdentifier(issueIdentifier);
}

async getExceptionsForIssueIdentifier(issueIdentifier: string, clusterId: number): Promise<ExceptionDto[]> {
    return await this.exceptionsDao.getExceptionsForIssueIdentifier(issueIdentifier, clusterId);
}

  async getExceptionById(exceptionId: number): Promise<ExceptionDto[]> {
    return await this.exceptionsDao.getException(exceptionId);
  }

  async deleteExceptionById(exceptionId: number, userId: number): Promise<any> {
      const exception = await this.exceptionsDao.getException(exceptionId);
      await this.exceptionsDao.deleteException(exceptionId, userId);
      if (exception && exception.length && exception[0].type === 'gatekeeper') {
          this.syncGatekeeperBlocks().catch(e => console.log('Error syncing GateKeeper exception blocks: ' + e));
      }
  }

  async updateException(exception: ExceptionCreateDto, exceptionId: number, userId: number): Promise<number> {
    if (await this.validateExceptionCreateDto(exception)) {
      const results =  await this.exceptionsDao.updateException(exception, exceptionId, userId);
      console.log('------------------>', results);
        if (exception.type === 'gatekeeper') {
            this.syncGatekeeperBlocks().catch(e => console.log('Error syncing GateKeeper exception blocks: ' + e));
        }
      return results;
    }
  }

  async updateExceptionStatus(exceptionId: number, status: string): Promise<number> {
      return await this.exceptionsDao.updateExceptionStatus(exceptionId, status);
  }

  async validateExceptionCreateDto(exception: ExceptionCreateDto): Promise<boolean> {
    let err = null;
    const startDate = new Date(exception?.startDate);
    const endDate = exception.endDate ? new Date(exception?.endDate) : null;
    if (!exception) { err = 'No data provided.'; }
    else if (!exception.title) { err = 'Title is required.';}
    else if (startDate.getTime() !== startDate.getTime()) { err = 'Start date is required'; }
    else if (endDate && (endDate.getTime() !== endDate.getTime())) { err = 'End date is malformed'; }
    else if (!exception.status) { err = 'Status is required'; }

    if (err) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        message: err,
      }, HttpStatus.BAD_REQUEST)
    }
    return true;
  }

  /**
   * Checks if a temporary exception has been created for the specified  criteria.
   * @param clusterId
   * @param policyId
   * @param scannerId
   * @param namespace
   * @param cve
   * @param imageName
   */
  async tempExceptionCreated(
    clusterId: number, policyId: number,
    scannerId: number, namespace: string, cve: string, imageName: string
  ): Promise<boolean> {
    return await this.exceptionsDao.tempExceptionCreated(clusterId, policyId, scannerId, namespace, cve, imageName);
  }

  async getExceptionsExpireTomorrow(tomorrow: string): Promise<ExceptionDto[]> {
      return await this.exceptionsDao.getExceptionsExpireTomorrow(tomorrow);
  }

  async calculateExceptionMetadata(previous: ExceptionDto, updated: ExceptionDto): Promise<any> {
      return await this.auditLogService.calculateMetaData(previous, updated, 'Exception');
  }

  async syncGatekeeperBlocks(): Promise<void> {
      /*
      this.licensingPortalService.checkLicenseValidityFromDash()
          .then((checkLicenseValidity) => {
              if (checkLicenseValidity.isLicenseSetup && checkLicenseValidity.validity) {

       */
                  this.exceptionBlockService.syncGatekeeperExceptionBlocks()
                      .catch(e => console.log('Error syncing GateKeeper exception blocks: ' + e));
      /*
              } else {
                  if (checkLicenseValidity.isLicenseSetup) {
                      if (!checkLicenseValidity.validity) {
                          console.log('License has been expired');
                      }
                  } else {
                      console.log('License is not setup.');
                  }
              }
          })
          .catch(e => console.log('Error checking license validity: ' + e));

       */
  }
}
