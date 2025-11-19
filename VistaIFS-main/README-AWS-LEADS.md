
# VistaIFS – AWS Leads Endpoint (Amplify)

This adds a serverless endpoint to capture website leads without Zapier.

## What this folder contains
- `amplify/backend/function/leadHandler/src/index.mjs` – Lambda code (DynamoDB + SES email).

## One-time setup (run in your project root)
```bash
# 1) Initialize Amplify if not already
amplify init

# 2) Create a DynamoDB table for leads
amplify add storage
#  -> NoSQL Database
#  -> Provide resource name: vistaLeads
#  -> Table name: VistaLeads
#  -> Partition key: id (String)
#  -> Add sort key? No
#  -> Add GSI? No
#  -> Enable Lambda access? Yes (we will attach later too)

# 3) Add the Lambda function
amplify add function
#  -> Name: leadHandler
#  -> Runtime: Node.js
#  -> Template: Hello World
#  -> Advanced settings: None
#  -> Permissions: grant access to storage: vistaLeads (create/update)

# 4) Replace the generated file with our code
#    Overwrite the file at amplify/backend/function/leadHandler/src/index.mjs with this repo's version.

# 5) Add a REST API and map POST /leads to the function
amplify add api
#  -> REST
#  -> Name: vistaApi
#  -> Path: /leads
#  -> Lambda: leadHandler
#  -> Restrict API? No (or add auth later)
#  -> Add another path? No

# 6) Configure environment variables for the function
amplify update function
#  -> select leadHandler
#  -> Environment variables:
#     LEADS_TABLE=VistaLeads
#     TO_EMAIL=S.Sambrano@MariniaGroup.com    # must be SES-verified in sandbox
#     FROM_EMAIL=S.Sambrano@MariniaGroup.com  # must be SES-verified

# 7) Push
amplify push
```

## After deploy
Amplify will show an API URL similar to:
```
https://xxxxxx.execute-api.us-west-2.amazonaws.com/prod/leads
```
Put that into `assets/js/vista-config.js`:
```js
window.VISTA_LEADS_WEBHOOK = "https://xxxxxx.execute-api.us-west-2.amazonaws.com/prod/leads";
```

## Verify SES (until your account is out of sandbox)
In AWS Console → **SES** → **Email Addresses** → **Verify new email address**
- Verify both FROM and TO emails (same is fine while in sandbox).

## Test
```bash
curl -X POST "$VISTA_API/leads" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","company":"Acme","page":"/"}'
```

You should see a 200 response and a new item in DynamoDB (Table: VistaLeads).
