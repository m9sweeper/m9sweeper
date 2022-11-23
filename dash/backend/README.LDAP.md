## Setting up a local OpenLDAP server

This guide goes through setting up an LDAP server locally and populating it with a list of sample users, along with a number of example groups they are members of. 

This guide is focused on deploying a minimal LDAP server with enough content to run meaningful tests. For more detailed information on LDAP server management and the various commands which can be used, consult the official [OpenLDAP documentation](https://www.openldap.org/doc/admin26/guide.html).

Requirements: Docker

## Running the LDAP image

The docker container can be set up with the following command:

```bash
$ docker run --name <CONTAINER-NAME> -p 389:389 -p 636:636 --detach osixia/openldap:1.5.0
```
Replacing <CONTAINER-NAME> with an identifier of your choosing. This will create a server open on port 389, populated with a default organization at example.org, and an admin account with a username and password of 'admin'

If port 389 or 636 are in use, the left number on each option can be changed to edit which port is exposed.

## Verifying server creation

To check that the server was properly created, first access the command line of the container. If using docker desktop, you can simply select the 'CLI' option on the container you created. To access the container on the command line, enter:

```bash
$ docker exec -it <CONTAINER-ID> /bin/bash
```

Replacing <CONTAINER-ID> with the id output by the `docker run` command.

Once you have access to the container's command line, you can verify that the server was created with the command:

```bash
$ ldapsearch -x -D "cn=admin,dc=example,dc=org" -w admin -b dc=example,dc=org
```

With a fresh install, this should output the following:

```bash
# extended LDIF
#
# LDAPv3
# base <dc=example,dc=org> with scope subtree
# filter: (objectclass=*)
# requesting: ALL
#

# example.org
dn: dc=example,dc=org
objectClass: top
objectClass: dcObject
objectClass: organization
o: Example Inc.
dc: example

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```

### Running the image in Kubernetes

If testing LDAP configuration in the dev environment, you can spin up a docker image directly in the dev cluster and expose it using a service. Run the following commands to boot up a server and access the image shell:

```bash
$ kubectl config use-context minesweeper-dev-northcentral-01
$ kubectl -n m9sweeper-dev run <POD-NAME> --image=osixia/openldap:1.5.0
$ kubectl -n m9sweeper-dev exec -it <POD-NAME> sh
```

You can then verify the server was created using the same ldapsearch as the previous step, and use the same steps as follows to populate it.

## Populating the server with users

OpenLDAP servers are edited using .ldif files, we will be populating the server by creating one such file. To edit a file, you may need to install a text editor onto the docker container. For example, to install vim, run `apt-get update` followed by `apt-get install vim`

Once you have some method of text editing available, copy the contents of the code block below into an example.ldif file in the container.

<details>
    <summary>example.ldif contents</summary>

```
dn: uid=aliceuser,dc=example,dc=org
cn: Alice
objectClass: inetOrgPerson
cn: Alice Superadminuser
sn: Superadminuser
givenName: Alice
initials: AS
displayName: Alice
description: An example super admin user for ldap integration testing
physicalDeliveryOfficeName: Unnamed Offices
telephoneNumber: 555-555-5555
mail: alice.superadminuser@example.org
streetAddress: 12345 Somewhere Ave
postOfficeBox: 12345
l: Minneapolis
St: Minnesota
postalCode: 55455
homePhone: 555-555-6666
Mobile: 555-555-7777
uid: aliceuser

dn: uid=bobuser,dc=example,dc=org
cn: Bob
objectClass: inetOrgPerson
cn: Bob Adminuser
sn: Adminuser
givenName: Bob
initials: BA
displayName: Bob
description: An example admin user for LDAP integration testing
physicalDeliveryOfficeName: Unnamed Offices
telephoneNumber: 777-777-7777
mail: bob.adminuser@example.org
streetAddress: 54321 Somewhere Ave
postOfficeBox: 54321
l: Minneapolis
St: Minnesota
postalCode: 55455
homePhone: 777-777-8888
Mobile: 777-777-9999
uid: bobuser

dn: uid=charlieuser,dc=example,dc=org
cn: Charlie
objectClass: inetOrgPerson
cn: Charlie Readonlyuser
sn: Readonlyuser
givenName: Charlie
initials: CR
displayName: Charlie
description: An example read only user for LDAP integration testing
physicalDeliveryOfficeName: Unnamed Offices
telephoneNumber: 888-888-8888
mail: charlie.readonlyuser@example.org
streetAddress: 55555 Somewhere Ave
postOfficeBox: 54345
l: Minneapolis
St: Minnesota
postalCode: 55455
homePhone: 888-888-7777
Mobile: 888-888-9999
uid: charlieuser

dn: uid=daveuser,dc=example,dc=org
cn: Dave
objectClass: inetOrgPerson
cn: Dave Defaultuser
sn: Defaultuser
givenName: Dave
initials: DD
displayName: Dave
description: An example user with no set permissions for LDAP integration testing
physicalDeliveryOfficeName: Unnamed Offices
telephoneNumber: 555-555-4444
mail: dave.defaultuser@example.org
streetAddress: 32123 Somewhere Ave
postOfficeBox: 12321
l: Minneapolis
St: Minnesota
postalCode: 55455
homePhone: 444-444-8888
Mobile: 444-444-9999
uid: daveuser

dn: ou=groups,dc=example,dc=org
objectClass: organizationalUnit
ou: groups

dn: cn=superadmins,ou=groups,dc=example,dc=org
objectClass: posixGroup
gidNumber: 1
cn: superadmins
memberUid: aliceuser

dn: cn=admins,ou=groups,dc=example,dc=org
objectClass: posixGroup
gidNumber: 2
cn: admins
memberUid: bobuser

dn: cn=readonlyusers,ou=groups,dc=example,dc=org
objectClass: posixGroup
gidNumber: 3
memberUid: charlieuser
cn: readonlyusers
```
</details>

With the file populated, run the command:

```bash
$ ldapadd -x -D "cn=admin,dc=example,dc=org" -w admin -f example.ldif
```

This will populate the server with four different users and three different groups. The first three users (Alice, Bob, and Charlie) will each be a member of one group, with the fourth (Dave) not being associated with any group.

### Setting user passwords

Users cannot be assigned passwords through .ldif files, and will need to be given them one at a time through the CLI. Enter the following:

```bash
$ ldappasswd -x -D "cn=admin,dc=example,dc=org" -w admin -S uid=<USER-ID>,dc=example,dc=org
```

And you will be prompted to enter a new password for whichever user was specified. 

### Verifying user creation

As before, you can run an `ldapsearch` against the server to ensure it was populated correctly. To pass more specific search parameters, such as to show only user accounts, you can use the following syntax:

```bash
$ ldapsearch -x -D "cn=admin,dc=example,dc=org" -w admin -b dc=example,dc=org '(objectclass=inetOrgPerson)'
```

This will return the user objects of each user added earlier, along with the hashed passwords of users who were assigned one.

Searching for other entries can be done by editing the `'(objectclass=*)'` field, for example using `posixGroup` to search for the added groups.

## Using the local LDAP server with m9sweeper

Connecting the LDAP server to m9sweeper requires some knowledge of the data structures the server is using. This section goes over what needs to be entered to connect m9sweeper to the local server we created earlier, as well as some clarification on the expected values of settings fields.

To begin with, go to the 'Sign on Methods' tab in the organization settings, then select 'Add External Auth Configuration.' 

### Sign on method fields

#### Auth Type

Which sign on method is being used, in this case `LDAP`

#### Provider Type

Used to specify the source provider, primarily for external auth configurations. For LDAP servers, enter `GENERIC_LDAP_PROVIDER`

#### Auth Name

A descriptive name for the login method, which will be displayed on the login page. Any text value can be entered here.

#### URL

LDAP URLs are given in the format `ldap://example.org`. For our server, we'll be using localhost followed by whatever port it was exposed on, for example `ldap://localhost:389`

#### User Search Base

The root directory entry that will be used when searching for users, this is the same value that was given to the `-b` flag in the ldapsearch examples used before. In the default setup, it will be `dc=example,dc=org`

#### Username Attribute

When a user enters a username on the login page, this will be the name of the field that will be searched against to find the appropriate user entry. As such it should be a unique field. Typically, it will be whatever is used to identify the user in the `dn` field, in the default setup it is `uid`

#### Admin DN

The full dn (domain name) entry of an admin account; searching an LDAP database and returning user info requires admin access, which we provide here. It's the same value as we've been passing to the `-D` flag, so in our case `cn=admin,dc=example,dc=org`

#### Admin Password

The password of the admin account provided. In a default setup, simply `admin`

#### Default User Authority

In the next few entries we will be creating a mapping to set user permissions depending on which groups they are a part of. This entry specifies what permissions a user should have if they are not part of any specified group. The value defaults to 'None,' which prevents users not part of a group from logging on at all, otherwise they can be given default permissions from view only to super admin.

Note that even with default permissions turned on, a user must enter a valid account and password to access m9sweeper.

#### Group Search Base

Much like the user search base, this specifies the directory which will be used to search for user groups. In the example server, it is `ou=groups,dc=example,dc=org`

#### Group Class

The objectClass of groups used for user permissions. In the default setup, `posixGroup`

#### Group Member Attribute

This is the attribute field within the *group* object that maps to a field within user objects. In this instance, it is `memberUid`

#### Group Member User Attribute

This is the attribute field within the *user* object which maps to the field specified previously in the group objects. In the default server, it is `uid`

#### Group Auth Level Attribute

The attribute in the group objects which is used to define which permissions the group grants to member users. In the default server, we could use *either* `gidNumber` or `cn` to map permissions. In this instance, we'll use `cn`

#### Group Auth View Only Value, Admin Value, and Super Admin Value

These three fields check the value of the attribute specified previously to determine what permissions they should grant users. By using the `cn` as our auth attribute, we can use the more descriptive common names to map permissions, setting View Only Value to `readonlyusers`, Admin Value to `admins`, and Super Admin Value to `superadmins`

***

### Using a Kubernetes pod in the dev environment

In order to access an LDAP server running in a kubernetes pod, you'll need to expose it using a service and change the URL field to reference the service. Create the service with the following command:

```bash
$ kubectl -n m9sweeper-dev expose pod <POD-NAME> --port=<PORT-NUMBER> --target-port=389 --name=<SERVICE-NAME>
```

Once the service is crated, the only field in m9sweeper that needs to be changed is the URL, which will take the following format:

```
ldap://<SERVICE-NAME>:<PORT-NUMBER>
```

***

Once all fields have been entered, make sure to mark the sign on method as 'Active' and save it, and from there test that login works using it.
