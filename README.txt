# UN Data Portal — Full Stack Bundle

This bundle contains:
1) Streamlit Portal (v2): Central + Department mode, Live integrations to DataHub + Power BI + Warehouse (server-side secrets)
2) Node/Express Backend: `/api/catalog`, `/api/metrics/summary`, `/api/powerbi/embed-token` (for the React Canvas UI)

## Files
- `streamlit/UN_Data_Portal_Dashboard_Studio_Streamlit_v2.zip`
- `backend/UN_Data_Portal_Backend_Node_Express.zip`

## Quick start (Backend)
1) Unzip `backend/...`
2) `npm install`
3) `cp .env.example .env` and fill
4) `npm run dev`
5) Verify: `GET http://localhost:8787/health`

## Quick start (Streamlit)
1) Unzip `streamlit/...`
2) `pip install -r requirements.txt`
3) `streamlit run app.py`

## React Canvas UI
Your Canvas UI is already updated to:
- call `GET /api/catalog`
- call `GET /api/metrics/summary`
- call `POST /api/powerbi/embed-token` (groupId + reportId)
Make sure your frontend dev server proxies `/api` to the backend.
