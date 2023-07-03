{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "dash.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "dash.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create Prometheus name
*/}}
{{- define "dash.prom-name" -}}
{{- $trimmedDashName := include "dash.name" . | trunc 50 | trimSuffix "-" }}
{{- printf "%s-%s" $trimmedDashName "prometheus" | trimSuffix "-" }}
{{- end }}

{{/*
Create Grafana name
*/}}
{{- define "dash.grafana-name" -}}
{{- $trimmedDashName := include "dash.fullname" . | trunc 55 | trimSuffix "-" }}
{{- printf "%s-%s" $trimmedDashName "grafana" | trimSuffix "-" }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "dash.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "dash.labels" -}}
helm.sh/chart: {{ include "dash.chart" . }}
{{ include "dash.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "dash.selectorLabels" -}}
app.kubernetes.io/name: {{ include "dash.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "imagePullSecret" }}
{{- printf "{\"auths\": {\"%s\": {\"auth\": \"%s\"}}}" (required "A valid .Values.image.registry entry required" .Values.image.registry) (printf "%s:%s" (required "A valid .Values.image.credentials.username entry required" .Values.image.credentials.username) (required "A valid .Values.image.credentials.password entry required" .Values.image.credentials.password) | b64enc) | b64enc }}
{{- end }}
