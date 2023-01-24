import {Injectable} from "@nestjs/common";
import {MineLoggerService} from "../../shared/services/mine-logger.service";
import {KubernetesHistoryService} from "../services/kubernetes-history.service";
import {ClusterDao} from "../../cluster/dao/cluster.dao";
import {PodComplianceService} from "../../pod/services/pod-compliance.service";
import {ImageRescanningService} from "../services/image-rescanning.service";
import {NamespaceComplianceService} from "../../namespace/services/namespace_compliance.service";
import {Command} from "nestjs-command";
import {yesterdaysDateAsStr} from "../../../util/date_util";
import {FalcoService} from "../../falco/service/falco.service";

/**
* This command is to schedule to send falco SUMMARY emails
*/
@Injectable()
export class FalcoEmailCommand {

    constructor(private readonly loggerService: MineLoggerService,
                private readonly falcoService: FalcoService,
                ) {}

    @Command({ command: 'schedule:falco-email', describe: 'Schedule Falco email' })
    async get() {
        /*const clusters = await this.clusterService.getClusters();
        for (cluster : clusters) {
            falcoSettings = this.falcoService.getFalcoSettingsByClusterId(cluster.id);
            if (!falcoSettings.sendSummaryEmail) {
                continue;
            }
            if (falcoSettings.summaryEmailFrequency === 'weekly' && today != falcoSettings.smmaryDay) {
                continue; // supposed to send only one a different day, so skip
            }

            await this.falcoService.sendSummaryEmail(clusterId, falcoSettings.summaryEmailFrequency);
        }*/

        // await this.falcoService.sendFalcoEmail();
        // await this.falcoService.addFalcoEmail(0;)
    }
}
