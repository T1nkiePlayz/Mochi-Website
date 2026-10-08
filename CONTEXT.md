# Mochi Website

The public site and signed-in account portal for the Mochi game launcher. This file is a glossary of the words used in the product and its UI.

## Language

**Piko**:
A game managed by Mochi. The identity of the game.
_Avoid_: game entry, title

**Tofu**:
One way of running a Piko: an environment, profile, version, or modded setup. A Piko has one or more Tofus.
_Avoid_: instance, profile (when meaning the Mochi concept)

**Account**:
The person's Mochi identity, shared by the website and the launcher.
_Avoid_: user (in UI copy)

**Sign-in method**:
Any way to prove who you are: password, email code, Google, GitHub, passkey, or authenticator app.

**Linked account**:
A Google or GitHub identity attached to an Account, usable as a sign-in method.
_Avoid_: connected account, provider

**Authenticator app**:
The time-based one-time-code second factor.
_Avoid_: TOTP, 2FA app (in UI copy)

**Passkey**:
A device-bound or password-manager credential used as a sign-in method or second factor.

**Cloud access**:
Permission, granted by an administrator, for an Account to use Mochi Cloud.
_Avoid_: cloud eligibility, metadata access

**Cloud sync**:
The Account holder's own switch for syncing library metadata. Only possible with Cloud access.

**Mochi Cloud**:
The optional service that syncs Piko and Tofu metadata between devices. It never stores game files.

**Service key**:
A credential for an outside service (IGDB, Nexus Mods) saved privately on the Account. Never shown again after saving.
_Avoid_: API key, provider credential

**Administrator**:
An Account that can grant Cloud access and manage others' Cloud sync.

## Relationships

- An **Account** has any number of **Sign-in methods**, **Linked accounts**, and **Service keys**.
- **Cloud sync** requires **Cloud access**; an **Administrator** grants the access, the Account holder toggles the sync.
- **Mochi Cloud** syncs **Pikos** and their **Tofus**, never game installations.
