##############################
# Generate Certs
##############################

# Create CA certificate and key
openssl req -nodes -new -x509 -keyout ca.key -out ca.crt -subj "/CN=M9sweeper Proxy" \
  -addext "subjectAltName = DNS:m9sweeper-proxy.$1.svc"

# Generate the private key for the reverse proxy
openssl genrsa -out key.pem 2048

# Generate a Certificate Signing Request (CSR) for the private key, and sign it with the private key of the CA.
openssl req -new -key key.pem \
       	-subj "/CN=m9sweeper-proxy.$1.svc" \
	-addext "subjectAltName = DNS:m9sweeper-proxy.$1.svc" \
    | openssl x509 -req -extfile /etc/ssl/openssl.cnf -extensions v3_req -CA ca.crt -CAkey ca.key -CAcreateserial -out cert.pem

# The API server requires the B64 encoded CA certificate to ensure that request is originating from the correct source.
# This is double encrypted for when the secret is imported
openssl base64 -in ca.crt -out b64ca.crt

# The generated certificate has newline characters which need to be removed.
cat b64ca.crt | tr -d '\n' > b64ca-formatted.crt


##############################
# Read in Kubernetes Service Account Details
##############################

# Point to the internal API server hostname
APISERVER=https://kubernetes.default.svc

# Path to ServiceAccount token
SERVICE_ACCOUNT=/run/secrets/kubernetes.io/serviceaccount

# Read this Pod's namespace
NAMESPACE=$(cat ${SERVICE_ACCOUNT}/namespace)

# Read the ServiceAccount bearer token
TOKEN=$(cat ${SERVICE_ACCOUNT}/token)

# Reference the internal certificate authority (CA)
CACERT=${SERVICE_ACCOUNT}/ca.crt

##############################
# Parse inputs related to nginx configuration
##############################

# Read cert.pem
CERT=$(cat /cert.pem | base64 | tr -d '\n')

# Read key.pem
KEY=$(cat /key.pem | base64 | tr -d '\n')

# Read the cert bundle
CABUNDLE=$(cat /b64ca-formatted.crt)

#set m9sweeper url
M9SWEEPER_URL=${2}

# Set the m9sweeper clusterid
M9SWEEPER_CLUSTER_ID=${3}

# base64 encode the m9sweeper url
M9SWEEPER_URL=$(echo $M9SWEEPER_URL | base64)
M9SWEEPER_URL_B64=$(echo $M9SWEEPER_URL | tr -d " ")

##############################
# Create objects in Kubernetes
##############################

# Create the k8s secret with the m9sweeper URL and CA bundle
curl --cacert ${CACERT} --header 'Content-Type: application/json' --header "Authorization: Bearer ${TOKEN}" -X POST ${APISERVER}/api/v1/namespaces/$1/secrets --data-raw '{
 "apiVersion": "v1",
 "kind": "Secret",
 "metadata": {"namespace":"'$1'","name":"m9sweeper-proxy-secrets"},
 "type": "Opaque",
 "data": {"caBundle":"'$CABUNDLE'","m9sweeperURL":"'$M9SWEEPER_URL_B64'","cert":"'$CERT'","key":"'$KEY'"}
}'

# Create the deployment for the nginx reverse proxy
curl --cacert ${CACERT} --header 'Content-Type: application/yaml' --header "Authorization: Bearer ${TOKEN}" -X POST ${APISERVER}/apis/apps/v1/namespaces/$1/deployments --data \
'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: m9sweeper-reverse-proxy
  namespace: '$1'
spec:
  replicas: 1
  selector:
    matchLabels:
      app: m9sweeper-reverse-proxy
  template:
    metadata:
      labels:
        app: m9sweeper-reverse-proxy
    spec:
      containers:
      - name: m9sweeper-reverse-proxy
        image: owasp/modsecurity:nginx-alpine
        env:
        - name: PROXY_SSL_CERT
          value: "/etc/config/cert.pem"
        - name: PROXY_SSL_CERT_KEY
          value: "/etc/config/key.pem"
        - name: BACKEND
          valueFrom:
            secretKeyRef:
              name: m9sweeper-proxy-secrets
              key: m9sweeperURL
              optional: false
        volumeMounts:
        - name: m9sweeper-proxy-secrets
          mountPath: /etc/config
          readOnly: true
        ports:
        - containerPort: 80
      volumes:
      - name: m9sweeper-proxy-secrets
        secret:
          secretName: m9sweeper-proxy-secrets
          items:
          - key: caBundle
            path: cabundle.crt
          - key: cert
            path: cert.pem
          - key: key
            path: key.pem
'
echo
# Create the m9sweeper-proxy service
curl --cacert ${CACERT} --header 'Content-Type: application/yaml' --header "Authorization: Bearer ${TOKEN}" -X POST ${APISERVER}/api/v1/namespaces/m9sweeper-system/services --data '
kind: Service
apiVersion: v1
metadata:
  name: m9sweeper-proxy
  namespace: '$1'
spec:
  ports:
    - name: https
      port: 443
      targetPort: 443
  selector:
      app: m9sweeper-reverse-proxy
  type: ClusterIP
'

## Create Validating Webhook
curl --cacert ${CACERT} --header 'Content-Type: application/yaml' --header "Authorization: Bearer ${TOKEN}" -X POST ${APISERVER}/apis/admissionregistration.k8s.io/v1/validatingwebhookconfigurations --data '
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
 name: m9sweeper-webhook
webhooks:
 - name: m9sweeper-validation-hook.m9sweeper.io
   clientConfig:
     service:
       name: m9sweeper-proxy
       namespace: '$1'
       path: "/api/clusters/'${M9SWEEPER_CLUSTER_ID}'/validation"
       port: 443
     caBundle: "'$CABUNDLE'"
   rules:
   - apiGroups: ["*"]
     apiVersions: ["v1", "v1beta1"]
     operations: ["CREATE"]
     resources: ["pods"]
     scope: "*"
   timeoutSeconds: 10
   failurePolicy: Ignore
   sideEffects: None
   admissionReviewVersions: ["v1", "v1beta1"]
'
