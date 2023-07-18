import { Injectable } from "@nestjs/common";
import { ImageDao } from "../../image/dao/image.dao";
import { ClusterDao } from "../../cluster/dao/cluster.dao";
import { ImageService } from "../../image/services/image.service";
import { PolicyService } from "../../policy/services/policy-service";
import { differenceInMilliseconds, add } from 'date-fns';
import { MineLoggerService } from '../../shared/services/mine-logger.service';


@Injectable()
export class ImageRescanningService {

    constructor(private readonly imageService: ImageService, 
        private readonly policyService: PolicyService,
        private readonly imageDao: ImageDao,
        protected readonly logger: MineLoggerService,
        private readonly clusterDao: ClusterDao,
        ) {}

    /**
     * Rescan each image for a policy if the rescan_grace_period of the policy is 
     * greater than 0. If the rescan_grace_period is 0 then its assumed that 
     * rescanning is not enabled for the policy.
     */
    async rescanIfNeeded() {
        const clusters = await this.clusterDao.getAllClusters();

        for (const cluster of clusters) {
            const images = await this.imageDao.getAllRunningImages(cluster.id)

            try {
                const policies = await this.policyService.getPoliciesByClusterAndGlobal(cluster.id);
        
                if (images) {
                    for (const image of images) {
                        for (const policy of policies) {
                            
                            if (image.lastScanned && +image.lastScanned > 0) {

                                const timeWhenRescanRequired = add(new Date(+image.lastScanned), {days: policy.rescanGracePeriod - 1});

                                if (differenceInMilliseconds(new Date(), timeWhenRescanRequired) < 0) {
                                    continue;
                                }

                            }

                            await this.imageService.createImageScanByImageId([{id: image.id}], cluster.id)
                        }
                    }
                }
                
            }
            catch (error) {
                this.logger.error('Error rescanning image', error, 'ImageRescanningService.rescanIfNeeded');
            }
        }
    }
}