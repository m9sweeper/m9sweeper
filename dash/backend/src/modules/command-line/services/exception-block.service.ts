import {forwardRef, Inject, Injectable} from "@nestjs/common";
import {ExceptionDto} from "../../exceptions/dto/exception-dto";
import * as fse from "fs-extra";
import * as fs from "fs";
import {ConfigService} from "@nestjs/config";
import * as jsYaml from "js-yaml";
import {ExceptionsService} from "../../exceptions/services/exceptions.service";
import {NamespaceService} from "../../namespace/services/namespace.service";
import {ClusterService} from "../../cluster/services/cluster.service";
import {DEFAULT_SCHEMA} from "js-yaml";


@Injectable()
export class ExceptionBlockService {
    defaultTemplateDir: string;
    constructor(private readonly configService: ConfigService,
                private readonly exceptionsService: ExceptionsService,
                private readonly kubernetesNamespaceService: NamespaceService,
                @Inject(forwardRef(() => ClusterService))
                private readonly clusterService: ClusterService) {
        this.defaultTemplateDir = this.configService.get('gatekeeper.gatekeeperTemplateDir');
    }


    async syncGatekeeperExceptionBlocks(): Promise<void> {
        console.log(`.....................................Exception Block Syncing Started at ${new Date().toUTCString()}.....................................`);
        const clusters = await this.clusterService.getAllClusters();
        for (const cluster of clusters) {
            console.log(`Starting for cluster Name: ${cluster.name} Id: ${cluster.id}......................................`);
            const deployedTemplateList = await this.clusterService.getDeployedTemplateList(cluster.id);
            const commonExceptionBlock = await this.calculateCommonExceptionBlocks(cluster.id);
            const clusterTemplatesExists = await this.copyGatekeeperTemplatesForCluster(cluster.id);
            if (clusterTemplatesExists) {
                const directoryObj = await this.getDirectoryStructure(cluster.id);
                for (const dir in directoryObj) {
                    for (const subDir of directoryObj[dir]) {
                        const templatePath = `${this.defaultTemplateDir}/../cluster-${cluster.id}-gatekeeper-templates/${dir}/${subDir}/template.yaml`;
                        try {
                            const templateObj = jsYaml.load(fs.readFileSync(templatePath, 'utf-8')) as any;
                            const templateExceptionBlock = await this.templateSpecificExceptionBlock(templateObj, commonExceptionBlock, cluster.id);
                            const templateWithModifiedRego = await this.saveExceptionBlockToTemplateFile(templatePath, templateObj, templateExceptionBlock);
                            if (deployedTemplateList && deployedTemplateList.length) {
                                if (deployedTemplateList.includes(templateObj.metadata.name)) {
                                    this.clusterService.patchTemplateWithModifiedRego(templateObj.metadata.name,
                                        templateWithModifiedRego, cluster.id)
                                        .catch(e => {console.log('Error patching template: ' + e);});
                                }
                            }
                        } catch (error) {
                            console.log(`Could not read ${templatePath}`, error);
                        }
                    }
                }
            }
        }
        console.log(`.....................................Exception Block Syncing Ended at ${new Date().toUTCString()}.....................................`);
    }
    
    
    async calculateCommonExceptionBlocks(clusterId: number): Promise<{commonExceptionBlock: string, commonExceptionBlockWithImagePattern: string}> {
        // Calculating Exception Block That will be applied to every template of every cluster.
        const commonExceptions = await this.exceptionsService.getAllCommonExceptions();
        let commonNamespaces = await this.kubernetesNamespaceService.getCommonNamespaces();
        const clusterNamespaces = await this.kubernetesNamespaceService.getNamespacesByClusterId(clusterId);
        commonNamespaces = commonNamespaces.filter(n => clusterNamespaces.map(cn => cn.name).includes(n.name));

        let commonExceptionBlock = '';
        let commonExceptionBlockWithImagePattern = '';
        if (commonExceptions && commonExceptions.length) {
            for (const exception of commonExceptions) {
                if (exception.namespaces.length) {
                    exception.namespaces = exception.namespaces.filter(n => clusterNamespaces.map(cn => cn.name).includes(n.name));
                } else {
                    exception.namespaces = commonNamespaces;
                }
                const exceptionBlock = await this.calculateExceptionBlock(exception);
                commonExceptionBlock += exceptionBlock.exceptionBlock;
                commonExceptionBlockWithImagePattern += exceptionBlock.exceptionBlockWithImagePattern;
            }
        }
        // console.log(`''''''''''''''''''''''''''''''''${clusterId}''''''''''''''''''''''''''''''''`);
        // console.log(commonExceptionBlock);
        // console.log(`''''''''''''''''''''''''''''''''${clusterId}''''''''''''''''''''''''''''''''`);
        return {commonExceptionBlock, commonExceptionBlockWithImagePattern};
    }


    async calculateCommonExceptionBlocksWithIssueIdentifier(clusterId: number, issueIdentifier: string): Promise<{commonExceptionBlockWithIssueIdentifier: string, commonExceptionBlockWithIssueIdentifierWithImagePattern: string}> {
        // Calculating Exception Block That will be applied to every template of every cluster.
        const commonExceptions = await this.exceptionsService.getAllCommonExceptionsWithIssueIdentifier(issueIdentifier);
        let commonNamespaces = await this.kubernetesNamespaceService.getCommonNamespaces();
        const clusterNamespaces = await this.kubernetesNamespaceService.getNamespacesByClusterId(clusterId);
        commonNamespaces = commonNamespaces.filter(n => clusterNamespaces.map(cn => cn.name).includes(n.name));

        let commonExceptionBlockWithIssueIdentifier = '';
        let commonExceptionBlockWithIssueIdentifierWithImagePattern = '';
        if (commonExceptions && commonExceptions.length) {
            for (const exception of commonExceptions) {
                if (exception.namespaces.length) {
                    exception.namespaces = exception.namespaces.filter(n => clusterNamespaces.map(cn => cn.name).includes(n.name));
                } else {
                    exception.namespaces = commonNamespaces;
                }
                const exceptionBlockWithIssueIdentifier = await this.calculateExceptionBlock(exception);
                commonExceptionBlockWithIssueIdentifier += exceptionBlockWithIssueIdentifier.exceptionBlock;
                commonExceptionBlockWithIssueIdentifierWithImagePattern += exceptionBlockWithIssueIdentifier.exceptionBlockWithImagePattern;
            }
        }
        // console.log(`''''''''''''''''''''''''''''''''${clusterId}''''''''''''''''''''''''''''''''`);
        // console.log(commonExceptionBlock);
        // console.log(`''''''''''''''''''''''''''''''''${clusterId}''''''''''''''''''''''''''''''''`);
        return {commonExceptionBlockWithIssueIdentifier, commonExceptionBlockWithIssueIdentifierWithImagePattern};
    }

    async templateSpecificExceptionBlock(template: any, commonExceptionBlock: {commonExceptionBlock: string, commonExceptionBlockWithImagePattern: string}, clusterId: number): Promise<{templateExceptionBlock: string, templateExceptionBlockWithImagePattern: string}> {
        let templateExceptionBlock = '';
        let templateExceptionBlockWithImagePattern = '';
        const templateIssueIdentifier = template.metadata.name;
        const commonExceptionBlockWithTemplateIssueIdentifier = await this.calculateCommonExceptionBlocksWithIssueIdentifier(clusterId, templateIssueIdentifier);
        const exceptionsForTemplateIssueIdentifier = await this.exceptionsService.getExceptionsForIssueIdentifier(templateIssueIdentifier, clusterId);
        if (exceptionsForTemplateIssueIdentifier && exceptionsForTemplateIssueIdentifier.length) {
            const clusterNamespaces = await this.kubernetesNamespaceService.getNamespacesByClusterId(clusterId);
            exceptionsForTemplateIssueIdentifier.map(e => {
                if (!e.namespaces.length) {
                    e.namespaces = clusterNamespaces;
                }
            });
            for (const exception of exceptionsForTemplateIssueIdentifier) {
                const exceptionBlock = await this.calculateExceptionBlock(exception);
                templateExceptionBlock += exceptionBlock.exceptionBlock;
                templateExceptionBlockWithImagePattern += exceptionBlock.exceptionBlockWithImagePattern;
            }
        }
        templateExceptionBlock = commonExceptionBlock.commonExceptionBlock +
                                commonExceptionBlockWithTemplateIssueIdentifier.commonExceptionBlockWithIssueIdentifier +
                                templateExceptionBlock;
        if (templateExceptionBlock === '') {
            templateExceptionBlock = ` true,\n  `;
        }

        templateExceptionBlockWithImagePattern = commonExceptionBlock.commonExceptionBlockWithImagePattern +
                                                commonExceptionBlockWithTemplateIssueIdentifier.commonExceptionBlockWithIssueIdentifierWithImagePattern +
                                                templateExceptionBlockWithImagePattern;

        if (templateExceptionBlockWithImagePattern === '') {
            templateExceptionBlockWithImagePattern = ' {true, true},\n  ';
        }
        return {templateExceptionBlock, templateExceptionBlockWithImagePattern};
    }

    async saveExceptionBlockToTemplateFile(templatePath: string, templateObj: any, exceptionBlock:{templateExceptionBlock: string, templateExceptionBlockWithImagePattern: string}): Promise<any> {
        let modifiedRego= '';
        let rego = templateObj.spec.targets[0].rego;
        // console.log(rego);
        rego = rego.split('# START M9S EXCEPTION BLOCK 1#');
        rego.splice(1, 0, exceptionBlock.templateExceptionBlock);
        modifiedRego = [rego[0], rego[1]].join('# START M9S EXCEPTION BLOCK 1#\n  ');
        let existingCode = rego[rego.length - 1];
        existingCode = existingCode.split('# END M9S EXCEPTION BLOCK 1#');
        if (existingCode.length > 1) {
            existingCode[0] = '# END M9S EXCEPTION BLOCK 1#';
        }
        modifiedRego += existingCode.join('');

        rego = modifiedRego.split('# START M9S EXCEPTION BLOCK 2#');
        rego.splice(1, 0, exceptionBlock.templateExceptionBlockWithImagePattern);
        modifiedRego = [rego[0], rego[1]].join('# START M9S EXCEPTION BLOCK 2#\n  ');
        existingCode = rego[rego.length - 1];
        existingCode = existingCode.split('# END M9S EXCEPTION BLOCK 2#');
        if (existingCode.length > 1) {
            existingCode[0] = '# END M9S EXCEPTION BLOCK 2#';
        }
        modifiedRego += existingCode.join('');

        // console.log(modifiedRego);
        templateObj.spec.targets[0].rego = modifiedRego;
        const objectToYaml = jsYaml.dump(templateObj, {schema: DEFAULT_SCHEMA});
        fs.writeFileSync(templatePath, objectToYaml, 'utf-8');
        return templateObj;
    }

    async copyGatekeeperTemplatesForCluster(clusterId: number): Promise<boolean> {
        const folderName = `${this.defaultTemplateDir}/../cluster-${clusterId}-gatekeeper-templates`;
        if (! await fse.pathExists(folderName)) {
            try {
                await fse.copy(this.defaultTemplateDir, folderName);
                console.log(`Templates were copied to ${folderName}`);
                return true;
            } catch (err) {
                console.log(err);
                return false;
            }
        } else {
            console.log(`${folderName} already Exists!`);
            return true;
        }
    }

    async deleteGatekeeperTemplatesForCluster(clusterId: number): Promise<boolean> {
        const folderName = `${this.defaultTemplateDir}/../cluster-${clusterId}-gatekeeper-templates`;
        try {
            await fse.remove(folderName);
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async readFolderNames(pathName: string): Promise<string[]> {
        try {
            const readDirNamesFromFile = jsYaml.load(fs.readFileSync(pathName, 'utf-8')) as any;
            return readDirNamesFromFile.resources;
        } catch (e) {
            console.log(`Could not read file ${pathName}`);
            console.log(e);
            return [];
        }
    }

    async getDirectoryStructure(clusterId: number): Promise<{ [dirName: string]: string[] }> {
        const clusterTemplateDir = `${this.configService.get('gatekeeper.gatekeeperTemplateDir')}/../cluster-${clusterId}-gatekeeper-templates`;
        const dirStructure = {};
        const topDirs = await this.readFolderNames(`${clusterTemplateDir}/kustomization.yaml`);
        if (topDirs && topDirs.length) {
            for(const dir of topDirs) {
                const fileName = `${clusterTemplateDir}/${dir}/kustomization.yaml`;
                dirStructure[dir] = await this.readFolderNames(fileName);
            }
            // console.log(dirStructure);
        }
        return dirStructure;
    }



    async calculateExceptionBlock(exception: ExceptionDto): Promise<{ exceptionBlock: string, exceptionBlockWithImagePattern: string }> {
        let exceptionBlock = '';
        let exceptionBlockWithImagePattern = '';

        if (!exception.namespaces.length){
            return {exceptionBlock, exceptionBlockWithImagePattern};
        }

        const imageMatch = exception.imageMatch;
        let imageMatchArray = imageMatch.split('%');
        imageMatchArray = imageMatchArray.filter(e => !['', ' ', undefined].includes(e));
        const imagePattern = imageMatchArray.join('');

        let namespaceRego = '';
        let namespaceRegoWithImagePattern = '';
        for (const namespace of exception.namespaces) {
            namespaceRego += ` pod.metadata.namespace == "${namespace.name}",\n `;
        }
        if (imagePattern === '') {

        } else {
            for (const namespace of exception.namespaces) {
                namespaceRegoWithImagePattern += ` {pod.metadata.namespace == "${namespace.name}",\n   regex.match("${imagePattern}", container.image)},\n `;
            }
        }
        const template = `# Exception ${exception.id} - ${exception.title} #\n ${namespaceRego === '' ? ` true\n` : namespaceRego}\n  `;
        exceptionBlock += template;
        const templateWithImagePattern = `# Exception ${exception.id} - ${exception.title} #\n ${namespaceRegoWithImagePattern === '' ? ` {true, true}\n` : namespaceRegoWithImagePattern}\n  `;
        exceptionBlockWithImagePattern += templateWithImagePattern;

        return { exceptionBlock, exceptionBlockWithImagePattern }
    }

}
