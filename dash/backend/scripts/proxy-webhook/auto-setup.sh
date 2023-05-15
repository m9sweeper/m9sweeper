# Ensure the script returns a failure code if a error is encountered for use in CICD pipelines.
set -e

#####################
# Set flags and help options
#####################
show_help(){
    echo "Useage: ./auto-setup.sh [-n or --namespace] NAMESPACE [-u or --url] M9SWEEPER_URL [-c or --cluster] CLUSTERID \n If you do not specify the default options will be used: \n namespace: m9sweeper-system\n URL: http://m9sweeper-dash.$namespace.svc.cluster.local:3000\n ClusterID: 1"
}
namespace="m9sweeper-system"
url="http://m9sweeper-dash.$namespace.svc.cluster.local:3000"
clusterid=1

while :; do
    case $1 in
        -h|-\?|--help)
            show_help    # Display a usage synopsis.
            exit
            ;;
        -n|--namespace)       # Takes an option argument; ensure it has been specified.
            if [ "$2" ]; then
                namespace=$2
                shift
            fi
            ;;
        -u|--url)       # Takes an option argument; ensure it has been specified.
            if [ "$2" ]; then
                url=$2
                shift
            fi
            ;;
        -c|--cluster)       # Takes an option argument; ensure it has been specified.
            if [ "$2" ]; then
                clusterid=$2
                shift
            fi
            ;;
        --)              # End of all options.
            shift
            break
            ;;
        -?*)
            printf 'WARN: Unknown option (ignored): %s\n' "$1" >&2
            ;;
        *)               # Default case: No more options, so break out of the loop.
            break
    esac

    shift
done

##################
# Main
##################

# Copy the initialize_proxy.yaml and openssl.cnf files to run the sed command against.
cp initialize_proxy.yaml init.yaml
cp openssl.cnf ssl.cnf

# Change the namespace in the initialize file and openssl configuration
sed -I '' -e 's/m9sweeper-system/'$namespace'/g' init.yaml
sed -I '' -e 's/m9sweeper-system/'$namespace'/g' ssl.cnf

# Create a service account, role, rolebinding, and deployment to create the nginx reverse proxy. These will be deleted at the end.
kubectl -n $namespace create -f init.yaml;

# Wait 30 seconds for pod to be running - sometimes the first run pulling the image takes a bit.

echo "Waiting for init pod to be created..."
sleep 30; 

# Delete the existing validating webhook configuration.
kubectl -n $namespace delete validatingwebhookconfiguration m9sweeper-webhook

# Grab the pod name and copy the reverse_proxy_setup.sh script to the root directory of the setup pod
M9SWEEPER_PROXY=$(kubectl -n $namespace get pods -o name --no-headers=true | grep m9sweeper-proxy | sed 's/pod\///')
kubectl -n $namespace cp ./ssl.cnf $M9SWEEPER_PROXY:/etc/ssl/openssl.cnf;
kubectl -n $namespace cp ./reverse_proxy_setup.sh $M9SWEEPER_PROXY:/reverse_proxy_setup.sh;

# Run the reverse_proxy_setup script
kubectl -n $namespace exec -it $M9SWEEPER_PROXY -- /bin/sh -c "chmod +x /reverse_proxy_setup.sh; ./reverse_proxy_setup.sh $namespace $url $clusterid"

# Delete the k8's resources that created the reverse proxy
kubectl -n $namespace delete -f init.yaml;
rm init.yaml;
rm ssl.cnf;

clear
echo "Reverse Proxy is now setup and running."