---
title: "LDAP Login"
linkTitle: "LDAP Login"
weight: 3
description: >
  How to configure user login using LDAP
---

M9sweeper supports user login using LDAP with a configurable implementation. Setting up this login method requires
some knowledge of the underlying directory structure, which will be specific to your LDAP implementation.

## Initial Configuration Setup

To begin setting up an LDAP server, log into M9sweeper as an admin and go to "Organization Settings" > "Sign on Methods",
then select "Add External Auth Configuration." From the "Auth Type" dropdown, select "LDAP" to open the configuration
menu.

![../img_2](../img_2.png)

### Provider Type

Identifies the type of LDAP system being used to authenticate users. Any value can be entered, to match the LDAP system
in use by your organization.

### Auth Name

A unique name to identify the sign on method; this will be what users see when selecting a method to log in with.

### URL

The URL where the LDAP server can be reached. It should be defined with `ldap:` as the protocol, such as
`ldap://example.org`

### User Search Base

The base Distinguished Name (DN) at which users can be found, consisting of all the ancestor entries of a user entry; so
if a specific user would be defined as `cn=exampleuser,dc=example,dc=org`, the user search base would be
`dc=example,dc=org`. Alternatively, a user defined as `uid=anotheruser,ou=users,dc=example,dc=org` would have a search
base of `ou=users,dc=example,dc=org`.

### Username Attribute

The attribute used to define unique users found at the user search base, this is the field M9sweeper will search by when
given a username. For the user `cn=exampleuser,dc=example,dc=org` the username attribute would be `cn`, and for
`uid=anotheruser,ou=users,dc=example,dc=org` the attribute would be `uid`.

### Admin DN and Admin Password

The full DN an admin account on the server, along with its password. In order to pull the necessary information from an
LDAP server, M9sweeper needs to connect with admin credentials, which are provided here. The admin DN is the full DN of
a given user, such as `cn=admin,dc=example,dc=org`.

### Default User Authority

The default permissions given to a user who has a valid account in the LDAP server, but is not part of a group with
specific permissions (which will be defined in the following steps). Choosing an authority other than `None` will allow
any member of the organization to log into M9sweeper, with whatever rights are defined. Users part of a group with
defined permissions will have those permissions override whatever is set here, even if those permissions are lower.

Setting the default authority as `None` will cause users that are not part of a group with access permissions to be
given an "Access Denied" error upon logging in.

## Group User Authority Settings

The following steps go over how to manage user authority through LDAP groups. These steps are optional, in which case
you will need to set a default user authority for all users logging in with LDAP, however it is much more secure to
define access controls by group.

![../img_3](../img_3.png)

### Group Search Base

The base DN that M9sweeper should look for groups at, defined the same way as the user search base; a group such as
`cn=usergroup,ou=groups,dc=example,dc=org` would have a search base of `ou=groups,dc=example,dc=org`.

### Group Class

The object class that groups are instances of in your LDAP server, such as `posixGroup`. If not known, you can find this
value by searching for groups in your LDAP server and looking for the `objectClass` attribute of your user groups.

### Group Member Attribute

The attribute within a group that defines which users are members of that group. A group defined as follows:

```text
dn: cn=readonlyusers,ou=groups,dc=example,dc=org
memberUid: exampleuser
memberUid: anotheruser
cn: readonlyusers
```

Referencing users defined as:

```text
dn: uid=exampleuser,dc=example,dc=org
uid: exampleuser
```
```text
dn: uid=anotheruser,dc=example,dc=org
uid: anotheruser
```

Would use `memberUid` as the Group Member Attribute.

### Group Member User Attribute

The unique attribute of users which groups reference to establish membership. A group defined as follows:

```text
dn: cn=readonlyusers,ou=groups,dc=example,dc=org
memberUid: exampleuser
memberUid: anotheruser
cn: readonlyusers
```

Referencing users defined as:

```text
dn: uid=exampleuser,dc=example,dc=org
uid: exampleuser
```
```text
dn: uid=anotheruser,dc=example,dc=org
uid: anotheruser
```

Would use `uid` as the Group Member User Attribute.

### Group Auth Level Attribute

The attribute of a group used to define the authority level of a group. Any attribute can be selected, though selecting
a unique attribute allows for tighter control of M9sweeper permissions.

### Group Auth View Only Value, Group Auth Admin Value, and Group Auth Super Admin Value

These define which values of the previous attribute correspond to which auth level in M9sweeper. 
