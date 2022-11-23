# Create a service account, role, rolebinding, and deployment to create the nginx reverse proxy. These will be deleted at the end.
kubectl -n m9sweeper-system create -f initialize_proxy.yaml;

# Wait 10 seconds for pod to be running
clear
echo "Waiting for init pod to be created..."
sleep 10; 

# Grab the pod name and copy the reverse_proxy_setup.sh script to the root directory of the setup pod
M9SWEEPER_PROXY=$(kubectl -n m9sweeper-system get pods -o name --no-headers=true | grep m9sweeper-proxy | sed 's/pod\///')
kubectl -n m9sweeper-system cp ./openssl.cnf $M9SWEEPER_PROXY:/etc/ssl/openssl.cnf;
kubectl -n m9sweeper-system cp ./reverse_proxy_setup.sh $M9SWEEPER_PROXY:/reverse_proxy_setup.sh;

# Run the reverse_proxy_setup script
kubectl -n m9sweeper-system exec -it $M9SWEEPER_PROXY -- /bin/sh -c "chmod +x /reverse_proxy_setup.sh; ./reverse_proxy_setup.sh"

# Delete the k8's resources that created the reverse proxy
kubectl -n m9sweeper-system delete -f initialize_proxy.yaml;

clear
echo "Reverse Proxy is now setup and running."