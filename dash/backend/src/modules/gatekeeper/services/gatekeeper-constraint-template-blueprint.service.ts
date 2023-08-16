import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ClusterService } from '../../cluster/services/cluster.service';
import { ConfigService } from '@nestjs/config';
import { MineLoggerService } from '../../shared/services/mine-logger.service';
import { GatekeeperConstraintTemplateService } from './gatekeeper-constraint-template.service';
import { GatekeeperConstraintService } from './gatekeeper-constraint.service';
import * as jsYaml from 'js-yaml';
import * as fs from "fs";

@Injectable()
export class GatekeeperConstraintTemplateBlueprintService {
  defaultTemplateDir: string;
  constructor(
    @Inject(forwardRef(() => ClusterService))
    private readonly clusterService: ClusterService,
    private readonly configService: ConfigService,
    private readonly gatekeeperConstraintTemplateService: GatekeeperConstraintTemplateService,
    private readonly gatekeeperConstraintService: GatekeeperConstraintService,
    private logger: MineLoggerService,
  ) {
    this.defaultTemplateDir = this.configService.get('gatekeeper.gatekeeperTemplateDir');
  }
  private async readFolderNames(pathName: string): Promise<string[]> {
    try {
      const readDirNamesFromFile = jsYaml.load(fs.readFileSync(pathName, 'utf-8')) as any;
      return readDirNamesFromFile.resources;
    } catch (e) {
      this.logger.error({label: 'Could not read file at path', data: { pathName }}, e, 'ClusterService.readFolderNames');
      return [];
    }
  }

  async getBlueprintTitles(clusterId: number): Promise<{ [dirName: string]: string []}> {
    const templateDir = this.configService.get('gatekeeper.gatekeeperTemplateDir');
    const dirStructure = {};
    const topDirs = await this.readFolderNames(`${templateDir}/kustomization.yaml`);
    if (topDirs && topDirs.length) {
      for(const dir of topDirs) {
        const fileName = `${templateDir}/${dir}/kustomization.yaml`;
        dirStructure[dir] = await this.readFolderNames(fileName);
      }
    }
    return dirStructure;
  }

  async getBlueprints(clusterId: number): Promise<{
    category: string;
    templates: {
      name: string,
      template: any | string,
    }[]
  }[]> {
    const directories = await this.getBlueprintTitles(clusterId);
    const templates: {
      category: string;
      templates: {
        name: string,
        template: any | string,
      }[]
    }[] = [];
    const templateDir = this.configService.get('gatekeeper.gatekeeperTemplateDir');
    for (const directoryName of Object.keys(directories)) {
      const templatesInDirectory = {
        category: directoryName,
        templates: [],
      };
      for (const templateName of directories[directoryName]) {
        templatesInDirectory.templates.push({
          name: templateName,
          template: jsYaml.load(fs.readFileSync(`${templateDir}/${directoryName}/${templateName}/template.yaml`, 'utf-8')),
        });
      }
      templates.push(templatesInDirectory);
    }
    return templates;
  }
}
