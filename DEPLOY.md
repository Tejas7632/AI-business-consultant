# ─────────────────────────────────────────────────────────────────
# Deploy to Render — IBM watsonx Startup Blueprint Generator
# ─────────────────────────────────────────────────────────────────
#
# HOW TO USE
# ----------
# 1. Create a Web Service on https://render.com
#    - Build Command : cd startup-blueprint-agent && npm ci && npm run build
#    - Start Command : node startup-blueprint-agent/build/web/server-entry.js
#    - Environment   : Node 20
#
# 2. In the Render dashboard → Environment, add:
#    WATSONX_API_KEY      = <your IBM Cloud API key>
#    WATSONX_URL          = https://us-south.ml.cloud.ibm.com
#    WATSONX_PROJECT_ID   = <your project ID>
#    GRANITE_MODEL_ID     = meta-llama/llama-3-1-8b
#    OUTPUT_DIR           = /tmp/blueprints
#    OUTPUT_FORMAT        = json
#    LOG_FILE             = /tmp/logs/agent.log
#    NODE_ENV             = production
#
# 3. Copy your Render deploy hook URL into GitHub Secrets as
#    RENDER_DEPLOY_HOOK_URL and uncomment the deploy job in ci.yml
#
# ─────────────────────────────────────────────────────────────────
# RAILWAY (alternative)
# ─────────────────────────────────────────────────────────────────
# railway.json (place in repo root):
# {
#   "build": { "builder": "NIXPACKS" },
#   "deploy": {
#     "startCommand": "cd startup-blueprint-agent && node build/web/server-entry.js",
#     "healthcheckPath": "/api/health"
#   }
# }
#
# ─────────────────────────────────────────────────────────────────
# HEROKU (alternative)
# ─────────────────────────────────────────────────────────────────
# heroku create your-app-name
# heroku config:set WATSONX_API_KEY=... WATSONX_PROJECT_ID=... WATSONX_URL=...
# git push heroku main
# ─────────────────────────────────────────────────────────────────
