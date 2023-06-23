import { Injectable } from '@nestjs/common';
import {ExceptionsService} from "../../exceptions/services/exceptions.service";
import {NamespaceService} from "../../namespace/services/namespace.service";
import {ClusterService} from "../../cluster/services/cluster.service";
import {LicensingPortalService} from "../../../integrations/licensing-portal/licensing-portal.service";
import {ExceptionBlockService} from "../services/exception-block.service";


/**
 * These commands are used to go through every active exception and calculate the exception block
 */
@Injectable()
export class GatekeeperExceptionCommand {

    constructor(
        private readonly exceptionsService: ExceptionsService,
        private readonly kubernetesNamespaceService: NamespaceService,
        private readonly clusterService: ClusterService,
        private readonly licensingPortalService: LicensingPortalService,
        private readonly exceptionBlockService: ExceptionBlockService,
    ) {
    }

    async syncGatekeeperExceptionBlocks(): Promise<boolean> {
        /*
        this.licensingPortalService.checkLicenseValidityFromDash()
            .then((checkLicenseValidity) => {
                if (checkLicenseValidity.isLicenseSetup && checkLicenseValidity.validity) {
         */
                    return this.exceptionBlockService.syncGatekeeperExceptionBlocks()
                        .then(() => true)
                        .catch(e => {
                            console.log('Error syncing GateKeeper exception blocks: ' + e);
                            return false;
                        });
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
