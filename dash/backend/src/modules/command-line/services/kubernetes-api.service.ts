import {Injectable} from "@nestjs/common";
import {KubeConfig} from "@kubernetes/client-node/dist/config";
import {CoreV1Api} from "@kubernetes/client-node/dist/gen/api/coreV1Api";
import { Cluster, Context, User } from '@kubernetes/client-node/dist/config_types';
import * as fs from 'fs';
import {
    KubernetesObject,
    KubernetesObjectApi,
    PatchUtils,
    RbacAuthorizationV1Api,
    V1ClusterRole,
    V1ObjectMeta, V1PodList,
    V1PolicyRule, V1RoleBinding, V1RoleRef, V1Secret, V1ServiceAccount, V1Subject
} from '@kubernetes/client-node';
import {V1Pod} from "@kubernetes/client-node/dist/gen/model/v1Pod";
import {V1NamespaceList} from "@kubernetes/client-node/dist/gen/model/v1NamespaceList";
import {ConfigService} from "@nestjs/config";


@Injectable()
export class KubernetesApiService {
    clusterRoles = [
        // basic k8s scraping
        Object.assign(new V1PolicyRule(), {
            apiGroups: [''],
            resources: ['namespaces', 'pods', 'nodes'],
            verbs: ['get', 'watch', 'list']
        }),

        // read/write k8s events
        Object.assign(new V1PolicyRule(), {
            apiGroups: [''],
            resources: ['events'],
            verbs: ['get', 'watch', 'list', 'create']
        }),

        /* WE SHOULD NOT NEED PRIVILEGES FOR SERVICE ACCOUNTS/CLUSTER ROLES AFTER INSTALL, 
           SO LETS NOT GIVE OURSELVES THESE PRIVILEGES 
        Object.assign(new V1PolicyRule(), {
            apiGroups: [''],
            resources: ['serviceaccounts'],
            verbs: ['get', 'watch', 'list', 'create', 'patch', 'update']
        }),

        Object.assign(new V1PolicyRule(), {
            apiGroups: ['rbac.authorization.k8s.io'],
            resources: ['clusterroles'],
            verbs: ['get', 'watch', 'list', 'create', 'update', 'patch', 'delete']
        }),*/

        // api services
        Object.assign(new V1PolicyRule(), {
            apiGroups: ['apiregistration.k8s.io'],
            resources: ['apiservices'],
            verbs: ['get', 'watch', 'list']
        }),

        // gatekeeper
        Object.assign(new V1PolicyRule(), {
            apiGroups: ['constraints.gatekeeper.sh'],
            resources: ['*'],
            verbs: ['get', 'watch', 'list', 'create', 'update', 'patch', 'delete']
        }),
        Object.assign(new V1PolicyRule(), {
            apiGroups: ['templates.gatekeeper.sh'],
            resources: ['constrainttemplates'],
            verbs: ['get', 'watch', 'list', 'create', 'update', 'patch', 'delete']
        }),
        Object.assign(new V1PolicyRule(), {
            apiGroups: ['templates.gatekeeper.sh'],
            resources: ['constrainttemplates/finalizers'],
            verbs: ['get', 'watch', 'list', 'create', 'update', 'patch', 'delete']
        }),
        Object.assign(new V1PolicyRule(), {
            apiGroups: ['templates.gatekeeper.sh'],
            resources: ['constrainttemplates/status'],
            verbs: ['get', 'watch', 'list', 'create', 'update', 'patch', 'delete']
        }),
        Object.assign(new V1PolicyRule(), {
            apiGroups: ['admissionregistration.k8s.io'],
            resources: ['validatingwebhookconfigurations'],
            verbs: ['get', 'watch', 'list', 'create', 'update', 'patch', 'delete']
        }),
    ];
    constructor(private readonly configService: ConfigService) {
    }
    /**
     * Retrieves the config that the cluster is currently on
     * Note: will have internal IP, such as https://10.0.0.1
     */
    loadConfigFromCluster(): KubeConfig {
        const config = new KubeConfig();
        config.loadFromCluster()
        return config;
    }

    loadConfigFromBase64Json(b64Json: string): KubeConfig {
        try {
            const decodedJson = Buffer.from(b64Json, 'base64').toString();
            const config = new KubeConfig();
            config.loadFromString(decodedJson);
            return config;
        } catch (error) {
            console.log(error);
        }
    }

    getBase64Config(config: KubeConfig): string {
        return Buffer.from(config.exportConfig(), 'utf-8').toString('base64');
    }

    makeCoreV1ApiFromConfig(config: KubeConfig): CoreV1Api{
        try {
            return config?.makeApiClient(CoreV1Api) || null;
        } catch (error) {
            console.log(error);
        }
    }

    makeRbacApiFromConfig(config: KubeConfig): RbacAuthorizationV1Api {
        return config?.makeApiClient(RbacAuthorizationV1Api);
    }

    async listNamespaces(kubeConfig: string): Promise<V1NamespaceList> {
        const decodedConfig = this.loadConfigFromBase64Json(kubeConfig);
        const coreV1Config = this.makeCoreV1ApiFromConfig(decodedConfig);
        return coreV1Config?.listNamespace().then(res => {
            const namespaceList = res.body;
            return namespaceList;
        }).catch(err => {
            console.log(err);
            return null;
        });
    }

    async listPods(kubeConfig: string, namespace: string): Promise<V1PodList> {
        const decodedConfig = this.loadConfigFromBase64Json(kubeConfig);
        const coreV1Config = this.makeCoreV1ApiFromConfig(decodedConfig);
        return coreV1Config?.listNamespacedPod(namespace).then(res => {
            const podList = res.body;
            return podList;
        }).catch(err => {
            console.log(err);
            return null;
        });
    }

    async getNamespacedPod(podName: string, namespace: string, kubeConfig: string): Promise<V1Pod> {
        const decodedConfig = this.loadConfigFromBase64Json(kubeConfig);
        const coreV1Config = this.makeCoreV1ApiFromConfig(decodedConfig);
        return coreV1Config?.readNamespacedPod(podName, namespace).then(res => {
            const pod = res.body;
            return pod;
        }).catch(err => {
            console.log(err);
            return null;
        });
    }
    /**
     * Tests a CoreV1Api to ensure it can connect to the cluster & list namespaces
     * @param k8sApi
     */
    async testApi(k8sApi: CoreV1Api): Promise<boolean> {
        return k8sApi?.listNamespace()
            .then(() => true)
            .catch(e => {console.log(e); return false;})
            || Promise.resolve(false);
    }

    /**
     * Builds a kubeconfig using the provided server & raw (base64 encoded) token, and attempts to test it
     * */
    async buildAndTestServiceAccountConfig(server: string, rawToken: string, context: string): Promise<{valid: boolean, config: string, context?: string}> {
        try {
            const token = Buffer.from(rawToken, 'base64').toString('utf-8');
            const config = this.buildServiceAccountConfig(token, server, context);
            const api = this.makeCoreV1ApiFromConfig(config);
            const valid = await this.testApi(api);
            return valid
                ? {context, valid: true, config: this.getBase64Config(config)}
                : {valid: false, config: null};
        } catch (e) {
            return {valid: false, config: null};
        }
    }

    buildServiceAccountConfig(token: string, server: string, context: string): KubeConfig {
        const config = new KubeConfig();
        config.addUser({token, name: "m9sweeper"});
        config.addCluster({server, name: "m9sweeper", skipTLSVerify: true});
        config.addContext({cluster: "m9sweeper", name: context, user: "m9sweeper"});
        config.setCurrentContext(context);
        return config;
    }

    /**
     * Removes all contexts, clusters, and users besides the ones associates with the config's current context
     */
    clearOtherContexts(config: KubeConfig): KubeConfig {
        if (!config) return null;
        const currentContext = this.getCurrentContextAsObject(config);
        config.users = config.users.filter(u => currentContext.user === u.name);
        config.contexts = config.contexts.filter(c => currentContext.name === c.name);
        config.clusters = config.clusters.filter(c => currentContext.cluster === c.name);
        return config;
    }

    /** Returns the config's current context object */
    getCurrentContextAsObject(config: KubeConfig): Context | null {
        return config.getContextObject(config.currentContext);
    }

    customizeCluster(cluster: Cluster, customizations: Partial<Cluster>): Cluster {
        return {
            name: customizations.name || cluster.name,
            server: customizations.server || cluster.server,
            caFile: customizations.caFile || cluster.caFile,
            caData: customizations.caData || cluster.caData,
            // Since it is a boolean we need to ensure its false values override the original true values
            skipTLSVerify: customizations.skipTLSVerify !== undefined ? customizations.skipTLSVerify : cluster.skipTLSVerify,
        };
    }

    /**
     * Create a k8s API from the given config, and test it.
     * Returns null if the API can't connect
     * @param config
     */
    async makeValidApi(config: KubeConfig): Promise<CoreV1Api> {
        if (!config) return Promise.resolve(null);
        const k8sApi = this.makeCoreV1ApiFromConfig(config);
        return this.testApi(k8sApi)
            .then(valid => {if (valid) return k8sApi;})
            .catch(() => null);
    }

    /**
     * Reads the file at the given path and returns its contents as a string
     * Defaults to reading the token file
     */
    getToken(path = '/var/run/secrets/kubernetes.io/serviceaccount/token'): string {
        return fs.readFileSync(path, 'utf-8');
    }

    switchCurrentUserAuthToToken(config: KubeConfig, token: string): void {
        const user = config?.getCurrentUser();
        if (!user) return;
        const userIndex = config.users.indexOf(user);
        // Recreate the user since many of its properties are readonly
        config.users[userIndex] = {
            ...user,
            token,
            certFile: undefined,
            keyFile: undefined,
            certData: undefined,
            keyData: undefined,
            authProvider: undefined
        };
    }

    customizeUser(user: User, customizations: Partial<User>): User {
        return {
            ...user,
            ...customizations
        };
    }

    customizeContext(ctx: Context, customizations: Partial<Context>): Context {
        return {
            ...ctx,
            ...customizations
        };
    }

    /** Retrieves a namespace's token from a cluster & decodes it*/
    async getServiceAccountToken(coreApi: CoreV1Api, serviceAccountName: string, namespaceName: string): Promise<string | null> {
        try {           
            //const secretName = (await coreApi.readNamespacedServiceAccount(serviceAccountName, namespaceName)).body.secrets[0].name;
            const secretName = "m9sweeper"
            const rawToken = (await coreApi.readNamespacedSecret(secretName, namespaceName)).body.data['token'];
            // We will retrieve the token base 64 encoded, and it will only be useful decoded
            return Buffer.from(rawToken, 'base64').toString('utf-8');
        } catch {
            return null;
        }
    }

    /**
     * Simulates the behavior of kubectl apply. patches the object if it exists, creates it if it does not
     * */
    async applyK8sObject(obj: KubernetesObject, config: KubeConfig): Promise<KubernetesObject> {
        const objApi = KubernetesObjectApi.makeApiClient(config);
        try {
            // Casting to any, the interface the function seems to only want a prtial metadata
            // But doesn;t quite work right without all of the fields
            await objApi.read(obj as any);
            return (await objApi.patch(obj)).body;
        } catch (e) { // objApi throws errors if it can't find the object
            if (e.statusCode === 401) {
                console.log('User does not have permission to read the object');
                 return null;
            }
            return await objApi.create(obj)
                .then(res => res.body)
                .catch(er => {
                   if (er.statusCode === 401) {
                       console.log('user does not have permission to create the object');
                       return null;
                   }
                   console.log('Error creating object', e);
                   return null;
                });

        }
    }

    /**
     * Creates a service account in the cluster given by the config and return the config with the user using this service account
     * ensure that if the k8s objects here are changed, those changes are also made in
     * charts/dash/templates/rbac-scrapers.yaml
     * and frontend/src/app/modules/private/pages/clusters/service-account-wizard.html
     * */
    async AddServiceAccount(base64KubeConfig: string): Promise<string> {
        let serviceAccountNamespace = 'default';
        const m9sweeperSystemNamespaceName = this.configService.get('releaseNamespace.serviceAccountNamespace');

        // Get the config & make all of the APIs
        const config = this.loadConfigFromBase64Json(base64KubeConfig);
        const coreApi = this.makeCoreV1ApiFromConfig(config);

        // Figure out whether the service account exists in the m9sweeper system namespace, the default namespace, or not at all
        let existingServiceAccount = null; // will have a reference to the existing service account
        let newServiceAccount = true; // whether or not we have to create a new service account

        const serviceAccountInDefault = await this.getExistingM9sweeperServiceAccountOfANamespace(coreApi, 'default');
        const serviceAccountInM9sweeperSystem = await this.getExistingM9sweeperServiceAccountOfANamespace(coreApi, m9sweeperSystemNamespaceName);

        if (!serviceAccountInDefault.length && !serviceAccountInM9sweeperSystem.length) {
            // does not exist in either so have to create it
            newServiceAccount = true;
            serviceAccountNamespace = m9sweeperSystemNamespaceName;
        } else if (serviceAccountInM9sweeperSystem.length) {
            // exists in m9sweeper system namespace, so use that one
            // note: m9sweeper system namespace takes precedence so that you could install m9sweeper multiple times 
            // in same cluster using different releaseNamespace.serviceAccountNamespace
            newServiceAccount = false;
            existingServiceAccount = serviceAccountInM9sweeperSystem[0];
            serviceAccountNamespace = m9sweeperSystemNamespaceName;
        }else if (serviceAccountInDefault.length) {
            // exists in default namespace, so lets use that one
            newServiceAccount = false;
            existingServiceAccount = serviceAccountInDefault[0];
        } 

        // create/get service account
        let serviceAccount = existingServiceAccount; // defaults to existing one (if it exists)
        let canContinue = true;

        if (newServiceAccount) {
            console.log(`Creating a new service account in ${serviceAccountNamespace}`);

            // Build the service account
            serviceAccount = new V1ServiceAccount();
            serviceAccount.kind = 'ServiceAccount';
            serviceAccount.apiVersion = 'v1';
            serviceAccount.metadata = new V1ObjectMeta();
            serviceAccount.metadata.name = 'm9sweeper';
            serviceAccount.metadata.namespace = serviceAccountNamespace;

            // Save the service account in the cluster
            canContinue = !!(await this.applyK8sObject(serviceAccount, config));
            if (!canContinue) {
                console.log(`Failed to create service account`);
                return null;
            }
        } else {
            // already exists, so no need to patch it (nothing ever changes here).
            console.log(`${existingServiceAccount?.metadata.name} already exists at ${serviceAccountNamespace} namespace.`);
        }

        //Build the secret
        console.log(`Creating a secret in ${serviceAccountNamespace}`);
        const secret : V1Secret = new V1Secret();
        secret.kind = "Secret";
        secret.apiVersion = 'v1';
        secret.metadata = new V1ObjectMeta();
        secret.metadata.name = "m9sweeper";
        secret.type = "kubernetes.io/service-account-token"
        secret.metadata.namespace = serviceAccountNamespace;
        secret.metadata.annotations={'kubernetes.io/service-account.name': "m9sweeper"};     
        const secretResponse = await this.applyK8sObject(secret, config)
        if (!secretResponse){
            console.log("secret response", secretResponse);
            
        }

        // Build the clusterRole w/the rules 
        console.log(`Creating a cluster role in ${serviceAccountNamespace}`);
        const clusterRole: V1ClusterRole = new V1ClusterRole();
        clusterRole.apiVersion = 'rbac.authorization.k8s.io/v1';
        clusterRole.kind = 'ClusterRole';
        clusterRole.metadata = new V1ObjectMeta();
        clusterRole.metadata.name = 'm9sweeper';

        clusterRole.rules = this.clusterRoles;

        // Create the Cluster Role in the cluster or patch it (in case it got corrupted)
        canContinue = !!(await this.applyK8sObject(clusterRole, config));
        if (!canContinue) {
            console.log(`Failed to create cluster role`);
            return null;
        }

        // build a rolebinding linking the previously created service account & role
        console.log(`Creating a cluster role binding in ${serviceAccountNamespace}`);
        const roleBinding = new V1RoleBinding();
        roleBinding.apiVersion = 'rbac.authorization.k8s.io/v1';
        roleBinding.kind = 'ClusterRoleBinding';
        roleBinding.metadata = new V1ObjectMeta();
        roleBinding.metadata.name = 'm9sweeper';
        roleBinding.roleRef = new V1RoleRef();
        roleBinding.roleRef.apiGroup = 'rbac.authorization.k8s.io';
        roleBinding.roleRef.kind = 'ClusterRole';
        roleBinding.roleRef.name = 'm9sweeper';

        const subject = new V1Subject();
        subject.kind = 'ServiceAccount';
        subject.name = 'm9sweeper';
        subject.namespace = serviceAccountNamespace;
        roleBinding.subjects = [subject];

        // Create the rolebinding in the cluster or patch it (in case it got corrupted)
        canContinue = !!(await this.applyK8sObject(roleBinding, config));
        if(!canContinue)  {
            console.log(`Failed to create cluster role binding`);
            return null;
        }

        // Get the service account's token, and replace the user in the config with that service account
        const token = await this.getServiceAccountToken(coreApi, 'm9sweeper', serviceAccountNamespace);
        this.switchCurrentUserAuthToToken(config, token);
        const user = config.getCurrentUser();
        const userIndex = config.users.indexOf(user);
        config.users[userIndex] = this.customizeUser(user, {name: 'm9sweeper'});

        // Set the current context to have the right namespace & user name
        const ctx = this.getCurrentContextAsObject(config);
        const ctxIndex = config.contexts.indexOf(ctx);
        config.contexts[ctxIndex] = this.customizeContext(ctx, { user: 'm9sweeper', namespace: serviceAccountNamespace });

        // Return the config as a base64 encoded JSON string that can be used to connect as this service acct in the future
        return this.getBase64Config(config);
    }

    async getExistingM9sweeperServiceAccountOfANamespace(coreApi: CoreV1Api, namespace: string): Promise<V1ServiceAccount[]> {
        const listExistingServiceAccounts = await coreApi.listNamespacedServiceAccount(namespace);
        return listExistingServiceAccounts.body.items.filter(sc => sc.metadata.name === 'm9sweeper');
    }

    async patchServiceAccountClusterRole(base64KubeConfig: string): Promise<V1ClusterRole | null> {
        const config = this.loadConfigFromBase64Json(base64KubeConfig);
        const rbacApi = this.makeRbacApiFromConfig(config);

        const clusterRole: V1ClusterRole = new V1ClusterRole();
        clusterRole.apiVersion = 'rbac.authorization.k8s.io/v1';
        clusterRole.kind = 'ClusterRole';
        clusterRole.metadata = new V1ObjectMeta();
        clusterRole.metadata.name = 'm9sweeper';

        clusterRole.rules = this.clusterRoles;
        const options = { 'headers': { 'Content-type': PatchUtils.PATCH_FORMAT_JSON_MERGE_PATCH }};

        try {
            const result = await rbacApi.patchClusterRole(clusterRole.metadata.name, clusterRole, undefined, undefined, undefined, undefined, undefined, options);
            console.log('Cluster Role Patch Status: ', result.response.statusCode);
            return result.body;
        } catch (e) {
            console.log(`Error updating Cluster Role ${clusterRole.metadata.name}`, e);
            return null;
        }
    }

    async getServiceAccountDetails(name: string, kubeConfig: string): Promise<void> {
        const releaseNamespace = this.configService.get('releaseNamespace.serviceAccountNamespace');
        try {
            const config = this.loadConfigFromBase64Json(kubeConfig);
            const coreApi = this.makeCoreV1ApiFromConfig(config);
            const acc = await coreApi.readNamespacedServiceAccount(name, releaseNamespace);
            console.log('Service Account Details: ');
            console.log(acc);
        } catch (e) {
            console.log('Something went wrong during reading service account.');
            console.log(e);
        }
    }

    async getClusterRoleDetails(name: string, kubeConfig: string): Promise<void> {
        try {
            const config = this.loadConfigFromBase64Json(kubeConfig);
            const rbacApi = this.makeRbacApiFromConfig(config);
            const clusterRole = await rbacApi.readClusterRole(name);
            console.log('Cluster Role Details: ');
            console.log(clusterRole);
        } catch (e) {
            console.log('Something went wrong during reading cluster role.');
            console.log(e);
        }
    }

    async getClusterRoleBindingDetails(name: string, kubeConfig: string): Promise<void> {
        try {
            const config = this.loadConfigFromBase64Json(kubeConfig);
            const rbacApi = this.makeRbacApiFromConfig(config);
            const clusterRoleBinding = await rbacApi.readClusterRoleBinding(name);
            console.log('Cluster Role Binding Details: ');
            console.log(clusterRoleBinding);
        } catch (e) {
            console.log('Something went wrong during reading cluster role binding.');
            console.log(e);
        }
    }

}
