import os
import json
import requests
import streamlit as st
import pandas as pd
from dataclasses import dataclass
from typing import List, Dict, Any, Optional, Tuple

import plotly.express as px
import plotly.graph_objects as go

try:
    import msal
except Exception:
    msal = None

try:
    import sqlalchemy as sa
except Exception:
    sa = None

st.set_page_config(page_title="UN Data Portal & Dashboard Studio", page_icon="📊", layout="wide")

@dataclass
class Dataset:
    id: str
    name: str
    domain: str
    sensitivity: str
    certified: bool
    owner: str
    updateCadence: str
    freshnessSlaHours: int
    description: str
    tables: List[str]
    tags: List[str]
    dept: str

@dataclass
class KpiDef:
    id: str
    name: str
    domain: str
    description: str
    formula: str
    owner: str
    cadence: str
    qualityChecks: List[str]
    dept: str

def _secret(key: str, default: Optional[str]=None) -> Optional[str]:
    return st.secrets.get(key, os.getenv(key, default))

def _json_secret(key: str, default=None):
    raw = _secret(key)
    if not raw:
        return default
    try:
        return json.loads(raw)
    except Exception:
        return default

def format_usd_compact(n: float) -> str:
    n = float(n)
    a = abs(n)
    if a >= 1_000_000_000: return f"${n/1_000_000_000:.1f}B"
    if a >= 1_000_000:     return f"${n/1_000_000:.1f}M"
    if a >= 1_000:         return f"${n/1_000:.1f}K"
    return f"${n:.0f}"

def format_num_compact(n: float) -> str:
    n = float(n)
    a = abs(n)
    if a >= 1_000_000_000: return f"{n/1_000_000_000:.1f}B"
    if a >= 1_000_000:     return f"{n/1_000_000:.1f}M"
    if a >= 1_000:         return f"{n/1_000:.1f}K"
    return f"{n:.0f}"

DEPARTMENTS = [
    {"id": "central", "name": "Central (UN-wide)"},
    {"id": "unfip", "name": "UNFIP / Funding"},
    {"id": "advocacy", "name": "Advocacy / Comms"},
    {"id": "partnerships", "name": "Partnerships / Ops"},
    {"id": "gender", "name": "Gender / Women Rise"},
]

def get_scope_and_dept() -> Tuple[str, str]:
    scope = st.session_state.get("scope_mode", "central")
    dept = st.session_state.get("dept_id", "unfip")
    if scope == "central":
        return "central", "central"
    return "department", dept

def get_dept_config(scope: str, dept: str) -> Dict[str, Any]:
    cfg = _json_secret("DEPARTMENT_CONFIG_JSON", {}) or {}
    out = {}
    if isinstance(cfg.get("central", {}), dict):
        out.update(cfg.get("central", {}))
    if scope == "department" and isinstance(cfg.get(dept, {}), dict):
        out.update(cfg.get(dept, {}))
    return out

REPORT_ANCHORS = {
    "unfip_disbursed_usd": 23500000,
    "unfip_grants_usd": 12700000,
    "unfip_entities_usd": 10800000,
    "unfip_projects_supported": 720,
    "unfip_countries_participating": 138,
    "sdg_goals_lounge_in_person": 2000,
    "sdg_goals_lounge_remote": 500000,
    "sdg_advocates_members": 17,
    "sdg_advocates_social_reach": 23000000,
    "women_rise_survey_respondents": 2300,
    "women_rise_dialogue_participants": 300,
}

MOCK_DATASETS: List[Dataset] = [
    Dataset(
        id="gold_unfip_funding",
        name="UNFIP Funding & Disbursements (Gold)",
        domain="Funding",
        sensitivity="Internal",
        certified=True,
        owner="UNOP / UNFIP – Finance & Analytics",
        updateCadence="Monthly",
        freshnessSlaHours=168,
        description="Curated disbursement facts and breakdowns (grants vs. UN system entities), with implementing partner and thematic tags.",
        tables=["fact_unfip_disbursements","dim_implementing_partner","dim_theme","dim_country","dim_date"],
        tags=["Funding","Donor","Gold","Certified"],
        dept="unfip",
    ),
    Dataset(
        id="gold_initiative_engagement",
        name="Initiatives & Engagement Metrics (Gold)",
        domain="Engagement",
        sensitivity="Internal",
        certified=True,
        owner="UNOP – Partnerships & Comms Analytics",
        updateCadence="Weekly",
        freshnessSlaHours=72,
        description="Engagement KPIs for flagship initiatives (SDG Goals Lounge, Women Rise for All, convenings) with reach and participation.",
        tables=["fact_initiative_events","dim_initiative","dim_location","dim_date"],
        tags=["Events","Reach","KPI","Gold"],
        dept="central",
    ),
    Dataset(
        id="gold_partnership_kpis",
        name="Partnership KPIs (Gold)",
        domain="Partnerships",
        sensitivity="Internal",
        certified=True,
        owner="Office for Partnerships – Ops Analytics",
        updateCadence="Daily",
        freshnessSlaHours=24,
        description="KPI fact table for partnership pipeline/performance: targets, achievements, engagement metrics.",
        tables=["fact_partnership_kpis","dim_partner","dim_program","dim_date"],
        tags=["KPI","M&E","Donor","Gold"],
        dept="partnerships",
    ),
]

MOCK_KPIS: List[KpiDef] = [
    KpiDef(
        id="kpi_unfip_total_disbursed",
        name="UNFIP Total Disbursed (USD)",
        domain="Funding",
        description="Total UNFIP disbursements in the selected period.",
        formula="SUM(disbursed_amount_usd)",
        owner="Finance & Analytics",
        cadence="Monthly",
        qualityChecks=["No negative disbursements","FX normalization applied","Partner IDs valid"],
        dept="unfip",
    ),
    KpiDef(
        id="kpi_lounge_total_reach",
        name="SDG Goals Lounge Reach",
        domain="Engagement",
        description="In-person participants + remote participants for SDG Goals Lounge programming.",
        formula="SUM(in_person_attendees) + SUM(remote_viewers)",
        owner="Partnerships & Comms Analytics",
        cadence="Per event",
        qualityChecks=["Event IDs unique","No null attendance values"],
        dept="central",
    ),
]

MOCK_FUNDING_BREAKDOWN = pd.DataFrame([
    {"name":"Grants","value":REPORT_ANCHORS["unfip_grants_usd"]},
    {"name":"UN system entities (fiduciary)","value":REPORT_ANCHORS["unfip_entities_usd"]},
])

MOCK_UNFIP_TREND = pd.DataFrame([
    {"x":"2020","disbursed_m":18.4},
    {"x":"2021","disbursed_m":20.2},
    {"x":"2022","disbursed_m":22.1},
    {"x":"2023","disbursed_m":21.6},
    {"x":"2024","disbursed_m":23.5},
])

MOCK_INITIATIVE_REACH = pd.DataFrame([
    {"initiative":"SDG Goals Lounge","in_person":REPORT_ANCHORS["sdg_goals_lounge_in_person"],"remote":REPORT_ANCHORS["sdg_goals_lounge_remote"]},
    {"initiative":"Women Rise for All","in_person":REPORT_ANCHORS["women_rise_dialogue_participants"],"remote":REPORT_ANCHORS["women_rise_survey_respondents"]},
    {"initiative":"SDG Advocates","in_person":REPORT_ANCHORS["sdg_advocates_members"],"remote":REPORT_ANCHORS["sdg_advocates_social_reach"]},
])

@st.cache_data(ttl=300, show_spinner=False)
def datahub_search_datasets(query: str="*", start: int=0, count: int=50) -> List[Dataset]:
    endpoint = _secret("DATAHUB_GQL_ENDPOINT")
    token = _secret("DATAHUB_TOKEN")
    if not endpoint or not token:
        raise RuntimeError("Missing DataHub creds (DATAHUB_GQL_ENDPOINT / DATAHUB_TOKEN).")

    scope, dept = get_scope_and_dept()
    cfg = get_dept_config(scope, dept)
    effective_query = cfg.get("DATAHUB_QUERY") or query

    gql = {
        "query": """
        query search($input: SearchInput!) {
          search(input: $input) {
            searchResults {
              entity {
                urn
                ... on Dataset {
                  properties { name description }
                  domain { properties { name } }
                  tags { tags { tag { properties { name } } } }
                }
              }
            }
          }
        }""",
        "variables": {"input": {"type":"DATASET","query": effective_query, "start": start, "count": count}},
    }

    r = requests.post(endpoint, headers={"Authorization": f"Bearer {token}", "Content-Type":"application/json"}, data=json.dumps(gql), timeout=30)
    if r.status_code >= 300:
        raise RuntimeError(f"DataHub search failed: {r.status_code} {r.text[:500]}")
    data = r.json()
    results = data.get("data", {}).get("search", {}).get("searchResults", [])

    out: List[Dataset] = []
    for item in results:
        ds = item.get("entity", {}) or {}
        props = ds.get("properties", {}) or {}
        domain = (ds.get("domain", {}) or {}).get("properties", {}).get("name", "Unknown")
        tags = [(((t or {}).get("tag", {}) or {}).get("properties", {}) or {}).get("name")
                for t in ((ds.get("tags", {}) or {}).get("tags", []) or [])]
        tags = [t for t in tags if t]
        out.append(Dataset(
            id=ds.get("urn", props.get("name","dataset")),
            name=props.get("name") or ds.get("urn") or "Dataset",
            domain=domain,
            sensitivity="Internal",
            certified=True,
            owner="Unassigned",
            updateCadence="Unknown",
            freshnessSlaHours=168,
            description=props.get("description") or "",
            tables=[],
            tags=tags,
            dept=(dept if scope=="department" else "central"),
        ))
    return out

def _powerbi_access_token() -> str:
    tenant = _secret("PBI_TENANT_ID")
    client_id = _secret("PBI_CLIENT_ID")
    client_secret = _secret("PBI_CLIENT_SECRET")
    if not tenant or not client_id or not client_secret:
        raise RuntimeError("Missing Power BI creds (PBI_TENANT_ID / PBI_CLIENT_ID / PBI_CLIENT_SECRET).")
    if msal is None:
        raise RuntimeError("Missing dependency: msal")
    authority = f"https://login.microsoftonline.com/{tenant}"
    app = msal.ConfidentialClientApplication(client_id, authority=authority, client_credential=client_secret)
    scopes = ["https://analysis.windows.net/powerbi/api/.default"]
    res = app.acquire_token_for_client(scopes=scopes)
    if "access_token" not in res:
        raise RuntimeError(f"Token failure: {res.get('error_description', str(res))}")
    return res["access_token"]

def _powerbi_execute_dax(group_id: str, dataset_id: str, dax: str) -> Dict[str, Any]:
    token = _powerbi_access_token()
    url = f"https://api.powerbi.com/v1.0/myorg/groups/{group_id}/datasets/{dataset_id}/executeQueries"
    body = {"queries":[{"query": dax}], "serializerSettings":{"includeNulls": True}}
    r = requests.post(url, headers={"Authorization": f"Bearer {token}", "Content-Type":"application/json"}, data=json.dumps(body), timeout=30)
    if r.status_code >= 300:
        raise RuntimeError(f"executeQueries failed: {r.status_code} {r.text[:500]}")
    return r.json()

def _extract_row_number(exec_res: Dict[str, Any], col: str) -> float:
    row = (((exec_res.get("results") or [{}])[0].get("tables") or [{}])[0].get("rows") or [{}])[0]
    try:
        return float(row.get(col, 0) or 0)
    except Exception:
        return 0.0

@st.cache_data(ttl=300, show_spinner=False)
def powerbi_kpis(period: str) -> Dict[str, float]:
    scope, dept = get_scope_and_dept()
    cfg = get_dept_config(scope, dept)
    group_id = cfg.get("PBI_GROUP_ID") or _secret("PBI_GROUP_ID")
    dataset_id = cfg.get("PBI_DATASET_ID") or _secret("PBI_DATASET_ID")
    if not group_id or not dataset_id:
        raise RuntimeError("Missing Power BI IDs (PBI_GROUP_ID / PBI_DATASET_ID).")

    # Replace these with your exact Power BI measure names
    dax_total = 'EVALUATE ROW("totalDisbursedUsd", [Total Disbursed USD])'
    dax_projects = 'EVALUATE ROW("projectsSupported", [Projects Supported])'
    dax_countries = 'EVALUATE ROW("countriesParticipating", [Countries Participating])'
    dax_in = 'EVALUATE ROW("loungeInPerson", [SDG Lounge In-Person])'
    dax_remote = 'EVALUATE ROW("loungeRemote", [SDG Lounge Remote])'
    dax_adv_reach = 'EVALUATE ROW("advocatesSocialReach", [SDG Advocates Social Reach])'

    r1 = _powerbi_execute_dax(group_id, dataset_id, dax_total)
    r2 = _powerbi_execute_dax(group_id, dataset_id, dax_projects)
    r3 = _powerbi_execute_dax(group_id, dataset_id, dax_countries)
    r4 = _powerbi_execute_dax(group_id, dataset_id, dax_in)
    r5 = _powerbi_execute_dax(group_id, dataset_id, dax_remote)
    r6 = _powerbi_execute_dax(group_id, dataset_id, dax_adv_reach)

    return {
        "totalDisbursedUsd": _extract_row_number(r1, "totalDisbursedUsd"),
        "projectsSupported": _extract_row_number(r2, "projectsSupported"),
        "countriesParticipating": _extract_row_number(r3, "countriesParticipating"),
        "loungeInPerson": _extract_row_number(r4, "loungeInPerson"),
        "loungeRemote": _extract_row_number(r5, "loungeRemote"),
        "advocatesSocialReach": _extract_row_number(r6, "advocatesSocialReach"),
    }

def _warehouse_engine(dsn: str):
    if sa is None:
        raise RuntimeError("Missing dependency: SQLAlchemy")
    return sa.create_engine(dsn, pool_pre_ping=True)

@st.cache_data(ttl=300, show_spinner=False)
def warehouse_query(sql: str, params: Dict[str, Any], dsn: str) -> pd.DataFrame:
    eng = _warehouse_engine(dsn)
    with eng.connect() as conn:
        return pd.read_sql(sa.text(sql), conn, params=params)

def load_charts_from_warehouse(period: str):
    scope, dept = get_scope_and_dept()
    cfg = get_dept_config(scope, dept)

    dsn = cfg.get("WAREHOUSE_DSN") or _secret("WAREHOUSE_DSN")
    if not dsn:
        raise RuntimeError("Missing WAREHOUSE_DSN.")

    sql_breakdown = cfg.get("SQL_FUNDING_BREAKDOWN") or _secret("SQL_FUNDING_BREAKDOWN", "")
    sql_trend = cfg.get("SQL_UNFIP_TREND") or _secret("SQL_UNFIP_TREND", "")
    sql_reach = cfg.get("SQL_INITIATIVE_REACH") or _secret("SQL_INITIATIVE_REACH", "")
    if not (sql_breakdown and sql_trend and sql_reach):
        raise RuntimeError("Missing SQL templates.")

    year = 2024 if period != "y2025" else 2025
    breakdown = warehouse_query(sql_breakdown, {"year": year}, dsn)
    trend = warehouse_query(sql_trend, {"year": year}, dsn)
    reach = warehouse_query(sql_reach, {"year": year}, dsn)
    return breakdown, trend, reach

# Sidebar
st.sidebar.title("Portal Controls")
scope_mode = st.sidebar.selectbox("Operating mode", ["central","department"], index=0, help="Central = UN-wide, Department = scoped assets + workspace")
st.session_state["scope_mode"] = scope_mode

dept_options = [d for d in DEPARTMENTS if d["id"] != "central"]
dept_labels = [d["name"] for d in dept_options]
dept_ids = [d["id"] for d in dept_options]

dept_pick = st.sidebar.selectbox("Department", dept_labels, index=0, disabled=(scope_mode != "department"))
dept_id = dept_ids[dept_labels.index(dept_pick)] if scope_mode == "department" else "central"
st.session_state["dept_id"] = dept_id

run_mode = st.sidebar.selectbox("Run mode", ["Mock (offline)", "Live (DataHub + Power BI + Warehouse)"], index=0)
period = st.sidebar.selectbox("Period", ["y2024","y2025","last_30d","last_6m"], index=0)

if st.sidebar.button("Refresh / Re-run"):
    st.cache_data.clear()
    st.rerun()

# Defaults
datasets = MOCK_DATASETS
kpis = MOCK_KPIS
kpi_vals = {
    "totalDisbursedUsd": REPORT_ANCHORS["unfip_disbursed_usd"],
    "projectsSupported": REPORT_ANCHORS["unfip_projects_supported"],
    "countriesParticipating": REPORT_ANCHORS["unfip_countries_participating"],
    "loungeInPerson": REPORT_ANCHORS["sdg_goals_lounge_in_person"],
    "loungeRemote": REPORT_ANCHORS["sdg_goals_lounge_remote"],
    "advocatesSocialReach": REPORT_ANCHORS["sdg_advocates_social_reach"],
}
funding_breakdown = MOCK_FUNDING_BREAKDOWN.copy()
trend = MOCK_UNFIP_TREND.copy()
initiative_reach = MOCK_INITIATIVE_REACH.copy()

errors = []
if run_mode.startswith("Live"):
    try:
        datasets = datahub_search_datasets("*", 0, 50)
    except Exception as e:
        errors.append(f"DataHub: {e}")
    try:
        kpi_vals.update(powerbi_kpis(period))
    except Exception as e:
        errors.append(f"Power BI: {e}")
    try:
        funding_breakdown, trend, initiative_reach = load_charts_from_warehouse(period)
    except Exception as e:
        errors.append(f"Warehouse: {e}")

# Scope filter (mock)
if run_mode.startswith("Mock"):
    if scope_mode == "department":
        datasets = [d for d in datasets if d.dept in (dept_id, "central")]
        kpis = [k for k in kpis if k.dept in (dept_id, "central")]

# Main
scope_label = "Central (UN-wide)" if scope_mode == "central" else f"Department: {dept_pick}"
st.title("UN Data Portal & Dashboard Studio")
st.caption(f"Mode: **{scope_label}** • Catalog: **DataHub** • KPIs: **Power BI measures** • Charts: **Warehouse SQL**")
if errors:
    st.warning("Some live sources failed:\n\n" + "\n".join([f"• {e}" for e in errors]))

tab_dashboard, tab_catalog, tab_kpis, tab_gallery, tab_integrations = st.tabs(
    ["📊 Dashboard", "🔎 Catalog", "📚 KPI Dictionary", "🖼️ Dashboard Gallery", "🔌 Integrations"]
)

with tab_dashboard:
    c1, c2, c3, c4 = st.columns(4)
    lounge_total = float(kpi_vals["loungeInPerson"]) + float(kpi_vals["loungeRemote"])
    c1.metric("UNFIP Disbursed", format_usd_compact(kpi_vals["totalDisbursedUsd"]))
    c2.metric("Projects Supported", format_num_compact(kpi_vals["projectsSupported"]))
    c3.metric("SDG Goals Lounge Reach", format_num_compact(lounge_total))
    c4.metric("SDG Advocates Reach", format_num_compact(kpi_vals["advocatesSocialReach"]))

    st.markdown("### Disbursements Trend (USD M)")
    fig = px.line(trend, x="x", y="disbursed_m", markers=True)
    st.plotly_chart(fig, use_container_width=True)

    st.markdown("### Funding Breakdown")
    fig = px.pie(funding_breakdown, names="name", values="value", hole=0.35)
    st.plotly_chart(fig, use_container_width=True)

    st.markdown("### Initiative Reach Snapshot")
    fig = go.Figure()
    fig.add_trace(go.Bar(x=initiative_reach["initiative"], y=initiative_reach["in_person"], name="In-person"))
    fig.add_trace(go.Bar(x=initiative_reach["initiative"], y=initiative_reach["remote"], name="Remote / Digital"))
    fig.update_layout(barmode="group")
    st.plotly_chart(fig, use_container_width=True)

with tab_catalog:
    st.markdown("### Dataset Catalog")
    q = st.text_input("Search datasets", value="")
    domains = sorted(list({d.domain for d in datasets})) if datasets else []
    domain = st.selectbox("Domain", ["All domains"] + domains, index=0)

    def keep(d: Dataset) -> bool:
        ok_domain = (domain == "All domains") or (d.domain == domain)
        if not q.strip():
            return ok_domain
        hay = f"{d.name} {d.domain} {d.description} {' '.join(d.tags)}".lower()
        return ok_domain and (q.strip().lower() in hay)

    filtered = [d for d in datasets if keep(d)]
    st.caption(f"Showing {len(filtered)} dataset(s)")
    for d in filtered:
        with st.expander(f"{'✅' if d.certified else '🟡'} {d.name} — {d.domain}", expanded=False):
            st.write(d.description or "—")
            st.write("**Owner:**", d.owner, " • **Sensitivity:**", d.sensitivity)
            st.write("**Cadence:**", d.updateCadence, " • **Freshness SLA (hrs):**", d.freshnessSlaHours)
            st.write("**Dept scope:**", d.dept)
            if d.tags:
                st.write("**Tags:**", ", ".join(d.tags[:40]))
            if d.tables:
                st.write("**Tables:**", ", ".join(d.tables))
            b1, b2, b3 = st.columns(3)
            b1.button("Open in catalog", key=f"open_{d.id}")
            b2.button("Build dashboard (template)", key=f"tmpl_{d.id}")
            b3.button("Request access", key=f"req_{d.id}")

with tab_kpis:
    st.markdown("### KPI Dictionary")
    df = pd.DataFrame([k.__dict__ for k in kpis])
    if df.empty:
        st.info("No KPI dictionary loaded.")
    else:
        st.dataframe(df[["name","domain","description","formula","owner","cadence","dept"]], use_container_width=True, hide_index=True)

with tab_gallery:
    st.markdown("### Dashboard Gallery (starter)")
    gallery = [
        {"name":"Executive Brief (1-page)","audience":"Senior leadership","includes":"Headline KPIs + drivers + risks","scope":"central"},
        {"name":"Funding Deep Dive","audience":"UNFIP team","includes":"Trend + donor/partner breakdown + geography","scope":"unfip"},
        {"name":"Engagement Monitor","audience":"Partnerships/Comms","includes":"Event reach + channel performance","scope":"central"},
        {"name":"Advocacy Reach Report","audience":"Advocacy","includes":"Reach + campaigns + roster","scope":"advocacy"},
    ]
    show = [g for g in gallery if scope_mode == "central" or g["scope"] in ("central", dept_id)]
    for g in show:
        with st.container(border=True):
            st.subheader(g["name"])
            st.caption(f"Audience: {g['audience']} • Scope: {g['scope']}")
            st.write("Includes:", g["includes"])
            x1, x2, x3 = st.columns(3)
            x1.button("Open (Power BI report)", key=f"open_rep_{g['name']}")
            x2.button("Create copy (workspace)", key=f"copy_{g['name']}")
            x3.button("Download template (PBIT)", key=f"pbit_{g['name']}")

with tab_integrations:
    st.markdown("### Central + Department architecture")
    st.write(
        "- **Central**: certified Gold data products + shared semantic model for UN-wide reporting.\n"
        "- **Department**: department workspace/dataset + optional dept schema/marts; still governed by the KPI dictionary and certification.\n"
    )
    st.markdown("#### Department overrides (recommended)")
    st.code(
        'DEPARTMENT_CONFIG_JSON = \'{\n'
        '  "central": {\n'
        '    "PBI_GROUP_ID": "<central-workspace-id>",\n'
        '    "PBI_DATASET_ID": "<central-dataset-id>",\n'
        '    "WAREHOUSE_DSN": "postgresql+psycopg2://user:pass@host:5432/db",\n'
        '    "DATAHUB_QUERY": "*"\n'
        '  },\n'
        '  "unfip": {\n'
        '    "PBI_GROUP_ID": "<unfip-workspace-id>",\n'
        '    "PBI_DATASET_ID": "<unfip-dataset-id>",\n'
        '    "DATAHUB_QUERY": "tags:\\\"dept:unfip\\\" AND *"\n'
        '  }\n'
        '}\'',
        language="toml"
    )
    st.markdown("#### What this enables")
    st.write(
        "- Central BI team maintains certified KPIs and UN-wide models.\n"
        "- Departments build dashboards in their own workspaces while using the same trusted metrics.\n"
        "- The portal becomes the launchpad: discover data products → pick template → create dashboard → publish.\n"
    )
