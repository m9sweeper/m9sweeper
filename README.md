# m9sweeper

Kubernetes Security for Everyone!

m9sweeper is a free and easy kubernetes security platform. It integrates industry standard open source utilities into a one-stop-shop kubernetes security tool
that can walk most kubernetes adminstrators through securing a kubernetes
cluster as well as the apps running on the cluster.

# Features

m9sweeper makes securing a cluster easy with:

 - CVE Scanning
 - Enforcement of CVE Scanning Rules
 - Reports and Dashboards, including historical reporting to see how your security posture has changed over time
 - CIS Security Benchmarking
 - Pen Testing
 - Deployment Coaching
 - Intrusion Detection
 - Gatekeeper Policy Management

# Toolbox

m9sweeper makes it easy to orchestrate the implementation of a number of free security tools:

[Trivy](https://github.com/aquasecurity/trivy): CVE Scanner

[Kubesec](https://github.com/controlplaneio/kubesec): Deployment Best Practices

[Kube Bench](https://github.com/aquasecurity/kube-bench): CIS Benchmarks

[OPA Gatekeeper](https://github.com/open-policy-agent/gatekeeper): Compliance and Security Policies

[Kube Hunter](https://github.com/aquasecurity/kube-hunter): Cluster Penetration Testing

[Project Falco](https://falco.org/): Intrusion Detection

# Quick Install

While our documentation has more details, installing m9sweeper can be as simple
as running a few CLI commands to install it into your own kubernetes cluster
with helm.

    helm repo add m9sweeper https://helm.m9sweeper.io/chartrepo/m9sweeper && \
    helm repo update && \
    helm upgrade m9sweeper m9sweeper/m9sweeper --install --wait \
      --create-namespace --namespace m9sweeper-system \
      --set-string dash.init.superAdminEmail="super.admin@m9sweeper.io" \
      --set-string dash.init.superAdminPassword="password" \
      --set-string global.jwtSecret="changeme" \
      --set-string global.apiKey="YOUR-API-KEY"

## Docs

All documentation can be found on [m9sweeper.io](https://m9sweeper.io/docs/latest/docs/)

## Contributors ✨

The initial project was created by team members at Intelletive Consulting at times when projects were slow or to train new members, but we hope others will contribute as well. Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jacobbeasley"><img src="https://avatars.githubusercontent.com/u/433581?v=4?s=100" width="100px;" alt="Jacob Beasley"/><br /><sub><b>Jacob Beasley</b></sub></a><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=jacobbeasley" title="Code">💻</a> <a href="https://github.com/m9sweeper/m9sweeper/commits?author=jacobbeasley" title="Documentation">📖</a> <a href="#research-jacobbeasley" title="Research">🔬</a> <a href="#projectManagement-jacobbeasley" title="Project Management">📆</a> <a href="#infra-jacobbeasley" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jasonWoodman"><img src="https://avatars.githubusercontent.com/u/15304205?v=4?s=100" width="100px;" alt="jasonWoodman"/><br /><sub><b>jasonWoodman</b></sub></a><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=jasonWoodman" title="Code">💻</a> <a href="https://github.com/m9sweeper/m9sweeper/commits?author=jasonWoodman" title="Documentation">📖</a> <a href="#research-jasonWoodman" title="Research">🔬</a> <a href="#projectManagement-jasonWoodman" title="Project Management">📆</a> <a href="#infra-jasonWoodman" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/brandan-schmitz"><img src="https://avatars.githubusercontent.com/u/6267549?v=4?s=100" width="100px;" alt="Brandan Schmitz"/><br /><sub><b>Brandan Schmitz</b></sub></a><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=brandan-schmitz" title="Code">💻</a> <a href="#infra-brandan-schmitz" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/m9sweeper/m9sweeper/commits?author=brandan-schmitz" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/KBerndt10"><img src="https://avatars.githubusercontent.com/u/64435961?v=4?s=100" width="100px;" alt="KBerndt10"/><br /><sub><b>KBerndt10</b></sub></a><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=KBerndt10" title="Code">💻</a> <a href="#infra-KBerndt10" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/beckysaunders94"><img src="https://avatars.githubusercontent.com/u/42787609?v=4?s=100" width="100px;" alt="beckysaunders94"/><br /><sub><b>beckysaunders94</b></sub></a><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=beckysaunders94" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sunny1304int"><img src="https://avatars.githubusercontent.com/u/55746651?v=4?s=100" width="100px;" alt="Farhan Tanvir"/><br /><sub><b>Farhan Tanvir</b></sub></a><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=sunny1304int" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jshoberg"><img src="https://avatars.githubusercontent.com/u/47117895?v=4?s=100" width="100px;" alt="jshoberg"/><br /><sub><b>jshoberg</b></sub></a><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=jshoberg" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/charisprose"><img src="https://avatars.githubusercontent.com/u/56838011?v=4?s=100" width="100px;" alt="charisprose"/><br /><sub><b>charisprose</b></sub></a><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=charisprose" title="Code">💻</a> <a href="https://github.com/m9sweeper/m9sweeper/commits?author=charisprose" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.tariquemahmud.net/"><img src="https://avatars.githubusercontent.com/u/2160924?v=4?s=100" width="100px;" alt="Gazi Tarique Mahmud"/><br /><sub><b>Gazi Tarique Mahmud</b></sub></a><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=tarique313" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.intelletive-bd.com/"><img src="https://avatars.githubusercontent.com/u/15213083?v=4?s=100" width="100px;" alt="Shibly"/><br /><sub><b>Shibly</b></sub></a><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=sforkani" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sabbirali"><img src="https://avatars.githubusercontent.com/u/1538742?v=4?s=100" width="100px;" alt="sabbirali"/><br /><sub><b>sabbirali</b></sub></a><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=sabbirali" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/GrantWK"><img src="https://avatars.githubusercontent.com/u/17361213?v=4?s=100" width="100px;" alt="Grant Keiner"/><br /><sub><b>Grant Keiner</b></sub></a><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=GrantWK" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/grantoenges"><img src="https://avatars.githubusercontent.com/u/91495894?v=4?s=100" width="100px;" alt="grantoenges"/><br /><sub><b>grantoenges</b></sub></a><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=grantoenges" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="?s=100" width="100px;" alt="Maggie Tian"/><br /><sub><b>Maggie Tian</b></sub><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><img src="?s=100" width="100px;" alt="Rakibul Rushel"/><br /><sub><b>Rakibul Rushel</b></sub><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="?s=100" width="100px;" alt="Jobayer Ahmed"/><br /><sub><b>Jobayer Ahmed</b></sub><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="?s=100" width="100px;" alt="Steve Gagnon"/><br /><sub><b>Steve Gagnon</b></sub><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="?s=100" width="100px;" alt="Khorshed Alam"/><br /><sub><b>Khorshed Alam</b></sub><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="?s=100" width="100px;" alt="Koti Vellanki"/><br /><sub><b>Koti Vellanki</b></sub><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="?s=100" width="100px;" alt="Sahil Narang"/><br /><sub><b>Sahil Narang</b></sub><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=" title="Code">💻</a> <a href="#infra" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
      <td align="center" valign="top" width="14.28%"><img src="?s=100" width="100px;" alt="Shahriya Siddique"/><br /><sub><b>Shahriya Siddique</b></sub><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><img src="?s=100" width="100px;" alt="Raiyan Prodhan"/><br /><sub><b>Raiyan Prodhan</b></sub><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="?s=100" width="100px;" alt="Kristin Sandness"/><br /><sub><b>Kristin Sandness</b></sub><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="?s=100" width="100px;" alt="Samer Sarker"/><br /><sub><b>Samer Sarker</b></sub><br /><a href="https://github.com/m9sweeper/m9sweeper/commits?author=" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!