# n8n-nodes-flarum

This is an n8n community node for [Flarum](https://flarum.org/), the open-source forum software. It lets you interact with a Flarum forum's core [JSON:API](https://docs.flarum.org/rest-api/) directly from your n8n workflows.

[n8n](https://n8n.io/) is a fair-code licensed workflow automation platform.

[Installation](#installation)  
[Credentials](#credentials)  
[Operations](#operations)  
[Compatibility](#compatibility)  
[Resources](#resources)

## Installation

Follow the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

In the n8n Community Nodes panel, search for `n8n-nodes-flarum` and install.

### Manual / self-hosted installation

```bash
cd ~/.n8n/custom
npm install n8n-nodes-flarum
```

Restart n8n afterwards.

## Credentials

You'll need a Flarum **API Key**. Flarum core does not ship an admin UI for this — the key must be added manually to the `api_keys` table of your Flarum database:

| Column    | Value                                                              |
|-----------|---------------------------------------------------------------------|
| `key`     | A long, random, unguessable string (recommended: 40 alphanumeric chars) |
| `user_id` | Optional. If set, the key always acts as this user.                |

Alternatively, some Flarum extensions (e.g. API access managers) provide an admin panel to generate keys.

In n8n, create a **Flarum API** credential with:
- **Base URL** — your forum's root URL, no trailing slash (e.g. `https://forum.example.com`)
- **API Token** — the raw key value only (do **not** prefix it with `Token `, the node adds that automatically)
- **User ID** (optional) — only needed if your key is a master key and you want to act as a specific user for this credential

## Operations

| Resource   | Operations                              |
|------------|------------------------------------------|
| Discussion | List, Get, Create, Update, Delete        |
| Post       | List, Get, Create (reply), Update, Delete|
| User       | List, Get                                |
| Tag        | List                                     |
| Custom     | Any method/path/body — for extension-added endpoints not covered above |

The **Custom** resource is a passthrough: choose a method, enter a path relative to your forum root (e.g. `/api/discussions/5/vote`), and an optional JSON body. Use it for endpoints added by FriendsOfFlarum (FoF) or other extensions.

## Compatibility

Tested against Flarum's core JSON:API on both 1.x and 2.x installations — the public REST surface for the resources above has not changed between major versions. Extension-specific endpoints (via the Custom resource) depend on whatever extensions your forum runs.

Minimum n8n version: 1.0.0 (uses the declarative credential `authenticate` property).

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Flarum REST API documentation](https://docs.flarum.org/rest-api/)

## License

[MIT](LICENSE.md)
