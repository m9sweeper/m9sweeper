import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
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

    @Command({
        command: 'sync:gatekeeper-exceptions',
        describe: 'Synchronizing gatekeeper exception blocks.'
    })
    async syncGatekeeperExceptionBlocks(): Promise<void> {
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
