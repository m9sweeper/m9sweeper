import { Injectable } from '@nestjs/common';
import {ExceptionsService} from "../../exceptions/services/exceptions.service";
import {NamespaceService} from "../../namespace/services/namespace.service";
import {ClusterService} from "../../cluster/services/cluster.service";
import {ExceptionBlockService} from "../services/exception-block.service";
import {MineLoggerService} from '../../shared/services/mine-logger.service';


/**
 * These commands are used to go through every active exception and calculate the exception block
 */
@Injectable()
export class GatekeeperExceptionCommand {

    constructor(
        private readonly exceptionsService: ExceptionsService,
        private readonly kubernetesNamespaceService: NamespaceService,
        private readonly clusterService: ClusterService,
        private readonly exceptionBlockService: ExceptionBlockService,
        protected readonly logger: MineLoggerService,
    ) {
    }

    async syncGatekeeperExceptionBlocks(): Promise<boolean> {
      return this.exceptionBlockService.syncGatekeeperExceptionBlocks()
        .then(() => true)
        .catch(e => {
          console.log('Error syncing gatekeeper exception blocks: ' + e);
          return false;
        });
    }
}
