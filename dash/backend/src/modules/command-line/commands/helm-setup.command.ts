import {Injectable} from '@nestjs/common';
import { DatabaseService } from '../../shared/services/database.service';
import {UserDao} from "../../user/dao/user.dao";
import * as bcrypt from 'bcryptjs';
import {ApiKeyDao} from "../../api-key/dao/api-key.dao";
import {DockerRegistriesDao} from "../../docker-registries/dao/docker-registries.dao";
import {DockerRegistriesDto} from "../../docker-registries/dto/docker-registries-dto";
import {plainToInstance} from "class-transformer";
import {KubernetesApiService} from "../services/kubernetes-api.service";
import { ExceptionsService } from '../../exceptions/services/exceptions.service';
import { ExceptionCreateDto } from '../../exceptions/dto/exceptioncreateDto';
import { IcliRegistry, IHelmInputRegistry } from "../dto/IHelmInputRegistry";
import {generateRandomString} from "./generate-random-string";
import {MineLoggerService} from '../../shared/services/mine-logger.service';


/**
 * These commands are used to setup initial m9sweeper data, such as the first admin user, when installing m9sweeper on
 * the kubernetes cluster
 */
@Injectable()
export class HelmSetupCommand {

    constructor(private readonly databaseService: DatabaseService,
                private readonly userDao: UserDao,
                private readonly apiKeyDao: ApiKeyDao,
                private readonly kubernetesApiService: KubernetesApiService,
                private readonly registryDao: DockerRegistriesDao,
                protected readonly logger: MineLoggerService,
                private readonly exceptionService: ExceptionsService) {
    }

    async runSeed(): Promise<boolean> {
        const promises: Promise<any>[] = [];
        if (process.env.SUPER_ADMIN_EMAIL && process.env.SUPER_ADMIN_PASSWORD) {
            promises.push(this.databaseService.getConnection().then(knex => {
                // Try both ts & js version
                const ts = knex.seed.run({specific: 'super-admin-seed.ts'})
                    .then(r => this.logger.log({ label: 'Seeding ts', data: r}, 'HelmSetupCommand.runSeed'));
                const js = knex.seed.run({specific: 'super-admin-seed.js'})
                    .then(r => this.logger.log({ label: 'Seeding js', data: r}, 'HelmSetupCommand.runSeed'));
                return Promise.all([ts, js]);
            }).catch(e => this.logger.error('Error running Super admin seed', e, 'HelmSetupCommand.runSeed')));
        }

        if (process.env.TRAWLER_API_KEY) {
            const trawlerUserExists = !!(await this.userDao.loadUser({email: 'Trawler'}));
            if (!trawlerUserExists) {
                const encryptedTrawlerApiKey = await bcrypt.hash(process.env.TRAWLER_API_KEY, await bcrypt.genSalt(10))
                promises.push(
                    this.userDao.create({
                        email: 'Trawler',
                        first_name: 'Trawler',
                        last_name: 'Trawler',
                        source_system_id: '0',
                        source_system_type: 'LOCAL_AUTH',
                        source_system_user_id: '0',
                        password: encryptedTrawlerApiKey,
                        authorities: [{id: 6}],
                    })
                        .then(trawlerUser => this.apiKeyDao.createApiKey({
                            user_id: trawlerUser[0],
                            name: 'Trawler API key',
                            api: process.env.TRAWLER_API_KEY,
                            is_active: true,
                        }))
                        .catch());
            } else {
              this.logger.log({ label: 'Skipping creation of Trawler user - already exists'}, 'HelmSetupCommand.runSeed');
            }
        }
        
        // generate KubeBench and KubeHunter api keys
        const randomKHApiKey = process.env.KUBE_HUNTER_API_KEY || generateRandomString(33);
        const randomKBApiKey = process.env.KUBE_BENCH_API_KEY || generateRandomString(33);
        const randomFalcoApiKey = process.env.FALCO_API_KEY || generateRandomString(33);

        const kubebenchUserExists = !!(await this.userDao.loadUser({email: 'Kubebench'}));
        if (!kubebenchUserExists) {
            const encryptedKubebenchApiKey = await bcrypt.hash(randomKBApiKey, await bcrypt.genSalt(10))
            promises.push(
                this.userDao.create({
                    email: 'Kubebench',
                    first_name: 'Kubebench',
                    last_name: 'Kubebench',
                    source_system_id: '0',
                    source_system_type: 'LOCAL_AUTH',
                    source_system_user_id: '0',
                    password: encryptedKubebenchApiKey,
                    authorities: [{id: 5}],
                })
                    .then(
                        kubebenchUser => this.apiKeyDao.createApiKey({
                        user_id: kubebenchUser[0],
                        name: 'Kubebench API key',
                        api: randomKBApiKey,
                        is_active: true,
                    })
                    )
                    .catch());
        } else {
          this.logger.log({ label: 'Skipping creation of KubeBench user - already exists'}, 'HelmSetupCommand.runSeed');
        }

        const kubehunterUserExists = !!(await this.userDao.loadUser({email: 'Kubehunter'}));
        if (!kubehunterUserExists) {
            const encryptedKubehunterApiKey = await bcrypt.hash(randomKHApiKey, await bcrypt.genSalt(10))
            promises.push(
                this.userDao.create({
                    email: 'Kubehunter',
                    first_name: 'Kubehunter',
                    last_name: 'Kubehunter',
                    source_system_id: '0',
                    source_system_type: 'LOCAL_AUTH',
                    source_system_user_id: '0',
                    password: encryptedKubehunterApiKey,
                    authorities: [{id: 4}],
                })
                    .then(kubehunterUser => this.apiKeyDao.createApiKey({
                        user_id: kubehunterUser[0],
                        name: 'Kubehunter API key',
                        api: randomKHApiKey,
                        is_active: true,
                    }))
                    .catch());
        } else {
          this.logger.log({ label: 'Skipping creation of KubeHunter user - already exists'}, 'HelmSetupCommand.runSeed');
        }

        const falcoUserExists = !!(await this.userDao.loadUser({email: 'Falco'}));
        if (!falcoUserExists) {
            const encryptedFalcoApiKey = await bcrypt.hash(randomFalcoApiKey, await bcrypt.genSalt(10))
            promises.push(
                this.userDao.create({
                    email: 'Falco',
                    first_name: 'Falco',
                    last_name: 'Falco',
                    source_system_id: '0',
                    source_system_type: 'LOCAL_AUTH',
                    source_system_user_id: '0',
                    password: encryptedFalcoApiKey,
                    authorities: [{id: 7}],
                })
                    .then(falcoUser => this.apiKeyDao.createApiKey({
                        user_id: falcoUser[0],
                        name: 'falco API key',
                        api: randomFalcoApiKey,
                        is_active: true,
                    }))
                    .catch());
        } else {
          this.logger.log({ label: 'Skipping creation of Falco user - already exists'}, 'HelmSetupCommand.runSeed');
        }

      await Promise.all(promises);
      return true;
    }

    // @TODO: clean up log messages to make this silent
    // Populates the docker registries tables with initial registries passed in through env variable
    async populateRegistries(): Promise<boolean> {
        const b64Registries = process.env.INITIAL_REGISTRIES_JSON;
        // Expects a JSON containing the fields registries that is a list of registries (name, hostname, login_required, username, password)
        let registries: IcliRegistry[];
        try {
            registries = (JSON.parse(Buffer.from(b64Registries, "base64").toString("ascii")) as IHelmInputRegistry)?.registries;
        } catch (e) {
          this.logger.error('Could not parse JSON', e, 'HelmSetupCommand.populateRegistries');
          return false;
        }

        if (!registries?.length) {
          this.logger.log({ label: 'Registry data not present or could not be read'}, 'HelmSetupCommand.populateRegistries');
          return false;
        }

        const existingRegistries = await this.registryDao.getDockerRegistries(null);

        const promises = [];
        for (const registry of registries) {
            // Skip registries missing the name of hostname since they are required
            if (registry?.name && registry?.hostname) {
                if(!existingRegistries.find(existing => existing.hostname === registry.hostname)) {

                    // Necessary because if login_required was undefined the DB's default value is true
                    if (!registry.login_required) registry.login_required = false;
                    const registryInfo: DockerRegistriesDto = plainToInstance(DockerRegistriesDto, registry);
                    promises.push(
                        this.registryDao.createDockerRegistry(registryInfo).then(() => 0)
                            .catch(er => this.logger.error({label: 'Error saving registry', data: registry}, er, 'HelmSetupCommand.populateRegistries'))
                    );
                } else {
                  this.logger.log({ label: 'Registry already exists with hostname', data: { registry, hostname: registry.hostname}}, 'HelmSetupCommand.populateRegistries');
                }
            } else {
              this.logger.log({label: 'Skipping registry due to missing required fields', data: { registry }}, 'HelmSetupCommand.populateRegistries');
            }
        }

        await Promise.all(promises);
        return true;
    }

    async loadDefaultNamespaceExceptions(): Promise<boolean> {
        if ((await this.exceptionService.getAllExceptions()).length === 0) {
            // create a default namespace exception
            const exception = new ExceptionCreateDto();
            exception.namespaces = ['kube-system', 'istio-system',
                'kube-node-lease', 'm9sweeper-system', 'cert-manager',
                'gatekeeper-system', 'logging-system', 'monitoring-system'];
            if (process.env.DEFAULT_NAMESPACE_EXCEPTIONS) {
                exception.namespaces = process.env.DEFAULT_NAMESPACE_EXCEPTIONS.split(",");
            }
            exception.clusters = [];
            exception.policies = [];
            const yesterday = new Date();
            yesterday.setDate(new Date().getDate() - 1);
            exception.startDate = yesterday.toISOString().substring(0, 10); // no time limit
            exception.endDate = null; // no time limit
            exception.relevantForAllClusters = true;
            exception.relevantForAllPolicies = true;
            exception.relevantForAllKubernetesNamespaces = false;
            exception.status = 'active';
            exception.scannerId = null; // all scanners
            exception.title = 'Whitelist Certain Kubernetes Namespaces';
            exception.reason = 'Provide reasonable defaults for the set of namespaces that can be ' +
              'safely ignored in a typical environment. ';
            this.logger.log({label: 'Creating default namespace exceptions', data: { namespaces: exception.namespaces}}, 'HelmSetupCommand.loadDefaultNamespaceExceptions');
            const id = await this.exceptionService.createException([{exception}], null, false, true);
            if (id[0]) {
              this.logger.log({label: 'Exception successfully created'}, 'HelmSetupCommand.loadDefaultNamespaceExceptions');
            }
        } else {
          this.logger.log({label: 'Skipping creation of default namespace exceptions - exceptions already exist'}, 'HelmSetupCommand.loadDefaultNamespaceExceptions');
        }
        return true;
    }

}
