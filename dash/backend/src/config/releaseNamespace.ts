export default {
    // what namespace to install service accounts to, by default. Can be overridden situationally, but defaults to default 
    // namespace because we know default namespace usually will exist. 
    serviceAccountNamespace: process.env.RELEASE_NAMESPACE || 'default' 
};
