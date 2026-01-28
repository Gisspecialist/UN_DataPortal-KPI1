# UN Data Portal & Dashboard Studio (Streamlit v2)

This build supports **Centralized** and **Per-department** operation in the same portal.

## Run locally
```bash
pip install -r requirements.txt
streamlit run app.py
```

## Deploy (Streamlit Cloud)
1) Push this folder to GitHub
2) Create a new Streamlit Cloud app → `app.py`
3) Add secrets (see `.streamlit/secrets.toml.example`)
4) Switch to **Live** and click **Refresh / Re-run**

## Central vs Department modes
- **Central**: shared UN-wide catalog view + central Power BI workspace/dataset + central warehouse
- **Department**: scoped catalog assets + department Power BI workspace/dataset + optional dept warehouse/schema

Configure department overrides via `DEPARTMENT_CONFIG_JSON` in secrets.

> Replace the measure names inside `powerbi_kpis()` with your exact measures.
