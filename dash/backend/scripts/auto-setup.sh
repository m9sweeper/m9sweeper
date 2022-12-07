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


# Change the namespace in the initialize file
sed -i'.before-'$namespace'' -e 's/m9sweeper-system/'$namespace'/g' initialize_proxy.yaml
# Create a service account, role, rolebinding, and deployment to create the nginx reverse proxy. These will be deleted at the end.
kubectl -n $namespace create -f initialize_proxy.yaml;

# Wait 10 seconds for pod to be running

echo "Waiting for init pod to be created..."
sleep 15; 

# Grab the pod name and copy the reverse_proxy_setup.sh script to the root directory of the setup pod
M9SWEEPER_PROXY=$(kubectl -n $namespace get pods -o name --no-headers=true | grep m9sweeper-proxy | sed 's/pod\///')
kubectl -n $namespace cp ./openssl.cnf $M9SWEEPER_PROXY:/etc/ssl/openssl.cnf;
kubectl -n $namespace cp ./reverse_proxy_setup.sh $M9SWEEPER_PROXY:/reverse_proxy_setup.sh;

# Run the reverse_proxy_setup script
kubectl -n $namespace exec -it $M9SWEEPER_PROXY -- /bin/sh -c "chmod +x /reverse_proxy_setup.sh; ./reverse_proxy_setup.sh $namespace $url $clusterid"

# Delete the k8's resources that created the reverse proxy
kubectl -n $namespace delete -f initialize_proxy.yaml;

clear
echo "Reverse Proxy is now setup and running."