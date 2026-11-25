import urllib.request
import urllib.error
import json
import time
import subprocess

WEB_BASE = "http://localhost:3011"
ADMIN_BASE = "http://localhost:3002"
API_BASE = "http://localhost:4000"

# Generate JWT Admin Token for protected endpoints
token_proc = subprocess.run([
    "node", "-e",
    'const jwt = require("jsonwebtoken"); console.log(jwt.sign({ sub: "771c3128-59f6-4a71-bb96-dd1cdaf3cc2b", email: "admin@geospatialworks.com.bd", role: "ADMIN" }, "local-development-only-secret"));'
], capture_output=True, text=True, cwd="apps/api")
ADMIN_JWT = token_proc.stdout.strip()
AUTH_HEADER = {"Authorization": f"Bearer {ADMIN_JWT}"}

results = []

def test_url(category, name, url, expected_status=200, method="GET", data=None, headers=None, validator=None):
    start = time.time()
    req_headers = {"User-Agent": "GW-Comprehensive-Automated-Tester/1.0"}
    if headers:
        req_headers.update(headers)
    
    encoded_data = None
    if data:
        encoded_data = json.dumps(data).encode("utf-8")
        req_headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=encoded_data, headers=req_headers, method=method)
    status_code = None
    error_msg = None
    body = b""
    
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            status_code = resp.status
            body = resp.read()
    except urllib.error.HTTPError as e:
        status_code = e.code
        body = e.read()
    except Exception as e:
        error_msg = str(e)
    
    elapsed = int((time.time() - start) * 1000)
    passed = (status_code == expected_status)
    validation_note = "Status matches expected"
    
    if passed and validator:
        try:
            val_ok, note = validator(body, status_code)
            if not val_ok:
                passed = False
                validation_note = note
            else:
                validation_note = note
        except Exception as ve:
            passed = False
            validation_note = f"Validation exception: {str(ve)}"
    elif not passed:
        validation_note = f"Expected {expected_status}, got {status_code}. Err: {error_msg}"
        
    res_entry = {
        "id": len(results) + 1,
        "category": category,
        "name": name,
        "url": url,
        "method": method,
        "status": status_code,
        "expected": expected_status,
        "passed": passed,
        "latency_ms": elapsed,
        "note": validation_note
    }
    results.append(res_entry)
    symbol = "✓" if passed else "✗"
    print(f"[{symbol}] Test {res_entry['id']:03d}: {name} ({elapsed}ms) - {res_entry['note']}")

def has_text(text):
    return lambda b, s: (text.lower().encode("utf-8") in b.lower(), f"Contains '{text}'")

def json_list_validator(body, status):
    data = json.loads(body.decode("utf-8"))
    return (isinstance(data, list) and len(data) > 0, f"Returned {len(data)} items")

def json_obj_validator(body, status):
    data = json.loads(body.decode("utf-8"))
    return (isinstance(data, dict), f"Returned valid JSON object with {len(data)} keys")

print("="*80)
print("STARTING GEOSPATIAL WORKS ENTERPRISE COMPREHENSIVE LOCAL SUITE (150+ TESTS)")
print("="*80)

# =========================================================================
# 1. PUBLIC MARKETING & INSTITUTIONAL CORE PAGES (20 Tests)
# =========================================================================
test_url("Public Web Page", "Homepage (/) Landing View", f"{WEB_BASE}/", validator=has_text("Geospatial Works"))
test_url("Public Web Page", "About (/about) Overview", f"{WEB_BASE}/about", validator=has_text("Geospatial Works"))
test_url("Public Web Page", "Our Story (/about/our-story)", f"{WEB_BASE}/about/our-story", validator=has_text("Story"))
test_url("Public Web Page", "Future Ready (/about/future-ready)", f"{WEB_BASE}/about/future-ready", validator=has_text("Future"))
test_url("Public Web Page", "Standards (/about/standards)", f"{WEB_BASE}/about/standards", validator=has_text("Standards"))
test_url("Public Web Page", "Corporate Responsibility (/about/corporate-responsibility)", f"{WEB_BASE}/about/corporate-responsibility", validator=has_text("Responsibility"))
test_url("Public Web Page", "Direct Alias: /our-story", f"{WEB_BASE}/our-story", validator=has_text("Story"))
test_url("Public Web Page", "Direct Alias: /future-ready", f"{WEB_BASE}/future-ready", validator=has_text("Future"))
test_url("Public Web Page", "Direct Alias: /standards", f"{WEB_BASE}/standards", validator=has_text("Standards"))
test_url("Public Web Page", "Direct Alias: /corporate-responsibility", f"{WEB_BASE}/corporate-responsibility", validator=has_text("Responsibility"))
test_url("Public Web Page", "Our Innovations (/our-innovations)", f"{WEB_BASE}/our-innovations", validator=has_text("Innovation"))
test_url("Public Web Page", "Services Catalog Listing (/services)", f"{WEB_BASE}/services", validator=has_text("Services"))
test_url("Public Web Page", "Project Portfolio (/projects)", f"{WEB_BASE}/projects", validator=has_text("Projects"))
test_url("Public Web Page", "News & Insights (/insights)", f"{WEB_BASE}/insights", validator=has_text("Insights"))
test_url("Public Web Page", "Clients & Key Sectors (/clients)", f"{WEB_BASE}/clients", validator=has_text("Client"))
test_url("Public Web Page", "Leadership & Team Directory (/team)", f"{WEB_BASE}/team", validator=has_text("Team"))
test_url("Public Web Page", "Careers Portal (/career)", f"{WEB_BASE}/career", validator=has_text("Career"))
test_url("Public Web Page", "Contact & Office Coordinates (/contact)", f"{WEB_BASE}/contact", validator=has_text("Contact"))
test_url("Public Web Page", "Interactive Cost Estimator (/cost-estimator)", f"{WEB_BASE}/cost-estimator", validator=has_text("Estimator"))
test_url("Public Web Page", "Client Support Chat Portal (/chat)", f"{WEB_BASE}/chat", validator=has_text("Chat"))

# =========================================================================
# 2. DETAILED SERVICE CAPABILITY PAGES (11 Real Services)
# =========================================================================
services = [
    ("topographic-survey", "Topographic Surveying"),
    ("uav-mapping", "UAV Drone & LiDAR Mapping"),
    ("hydrographic-survey", "Hydrographic Bathymetry"),
    ("engineering-design", "Civil & Structural Design"),
    ("bathymetric-survey", "Deep Bathymetric Surveying"),
    ("gis-solutions", "Enterprise GIS Solutions"),
    ("boundary-survey", "Cadastral & Boundary Demarcation"),
    ("environmental-monitoring", "Environmental & Coastal Impact"),
    ("subsurface-utility", "Subsurface Utility Engineering"),
    ("building-engineering", "Architectural & Building Engineering"),
    ("road-bridge-infrastructure", "Transportation & Bridge Alignment")
]
for slug, label in services:
    test_url("Service Detail Page", f"Service: {label} (/services/{slug})", f"{WEB_BASE}/services/{slug}", validator=has_text("Geospatial"))

# =========================================================================
# 3. VERIFIED INFRASTRUCTURE PROJECTS (17 PPT Extracted Projects)
# =========================================================================
projects = [
    ("page-16-passenger-facilities-modernization-at-gabtoli", "Gabtoli Terminal Modernization"),
    ("page-17-gabtoli-terminal-3d-engineering---structural", "Gabtoli 3D Structural Engineering"),
    ("page-18-gulshan-1-intersection-to-progati-sarani-high", "Gulshan-1 to Badda High Street"),
    ("page-19-gulshan-badda-corridor-passenger-waiting-shel", "Gulshan-Badda Shelters & Footpaths"),
    ("page-20-passenger-facilities-modernization-at-mohakha", "Mohakhali Terminal Modernization"),
    ("page-21-mohakhali-terminal-ticketing-counters---3d-ar", "Mohakhali 3D Architectural Design"),
    ("page-22-mohakhali-terminal-drainage-network---palisad", "Mohakhali Drainage & Palisading"),
    ("page-23-ltp-of-sanitary-landfill-at-moheshkhali-solid", "Moheshkhali Landfill Baseline Study"),
    ("page-24-moheshkhali-sanitary-landfill-structural-draw", "Moheshkhali Structural Drawings"),
    ("page-25-web-ais-pilot-research-project-on-irrigation", "Web-AIS Pilot Research Project"),
    ("page-26-web-ais-spatial-data-outputs--tbm--land-cover", "Web-AIS Spatial Outputs & TBM"),
    ("page-27-installation-of-water-level-gauge-readers---t", "Water Level Gauge Readers Installation"),
    ("page-28-gangarampur-hydrological-water-level-monitori", "Gangarampur Hydrological Station"),
    ("page-29-abdulpur-railway-bypass-topographic---uav-pho", "Abdulpur Railway Bypass UAV Drone Survey"),
    ("page-30-abdulpur-railway-bypass-photogrammetry---surf", "Abdulpur Bypass Surface Models & Contours"),
    ("page-31-bus-route-rationalization---corridor-concept", "Dhaka Bus Route Rationalization"),
    ("page-32-dtca-arterial-corridor-digital-surface-model", "DTCA Arterial Corridor DSM & Orthomosaic")
]
for slug, label in projects:
    test_url("Project Case Study", f"Project: {label} (/projects/{slug})", f"{WEB_BASE}/projects/{slug}", validator=has_text("Geospatial"))

# =========================================================================
# 4. ARTICLE & RESEARCH CASE STUDIES (17 Extracted Articles)
# =========================================================================
for slug, label in projects:
    art_slug = f"project-{slug}"
    test_url("Insight / Article Page", f"Article: {label} (/insights/{art_slug})", f"{WEB_BASE}/insights/{art_slug}", validator=has_text("Geospatial"))

# =========================================================================
# 5. INTERNAL ENTERPRISE PLATFORM & FIELD OPERATIONS ROUTES (15 Tests)
# =========================================================================
internal_routes = [
    ("Login Gateway", "/login"),
    ("Forgot Password", "/forgot-password"),
    ("Reset Password", "/reset-password"),
    ("Executive Dashboard", "/dashboard"),
    ("Field Attendance Logger", "/attendance"),
    ("GPS Geofenced Attendance Map", "/attendance/map"),
    ("Staff & Surveyor Roster", "/employees"),
    ("Survey Tasks & Field Board", "/tasks"),
    ("Leave Management", "/leaves"),
    ("Field Early Departures", "/leaves/early-departures"),
    ("Field Expense Logging", "/expenses"),
    ("Expense Audit Compliance", "/expenses/compliance"),
    ("Surveyor Payroll Processing", "/payroll"),
    ("Administrative Approvals Queue", "/approvals"),
    ("Platform Settings & Calibration", "/settings")
]
for label, path in internal_routes:
    test_url("Internal Operations Route", f"Ops: {label} ({path})", f"{WEB_BASE}{path}")

# =========================================================================
# 6. NESTJS BACKEND REST API ENDPOINTS (Public & Authenticated) (22 Tests)
# =========================================================================
test_url("Backend REST API", "GET /api/v1/projects (All Projects)", f"{API_BASE}/api/v1/projects", validator=json_list_validator)
test_url("Backend REST API", "GET /api/v1/projects/:slug (Single Project)", f"{API_BASE}/api/v1/projects/page-16-passenger-facilities-modernization-at-gabtoli", validator=json_obj_validator)
test_url("Backend REST API", "GET /api/v1/services (All Services)", f"{API_BASE}/api/v1/services", validator=json_list_validator)
test_url("Backend REST API", "GET /api/v1/services/:slug (Single Service)", f"{API_BASE}/api/v1/services/topographic-survey", validator=json_obj_validator)
test_url("Backend REST API", "GET /api/v1/articles (All Articles)", f"{API_BASE}/api/v1/articles", validator=json_list_validator)
test_url("Backend REST API", "GET /api/v1/articles/:slug (Single Article)", f"{API_BASE}/api/v1/articles/project-page-16-passenger-facilities-modernization-at-gabtoli", validator=json_obj_validator)
test_url("Backend REST API", "GET /api/v1/team (Verified Staff & CV Records)", f"{API_BASE}/api/v1/team", validator=json_list_validator)
test_url("Backend REST API", "GET /api/v1/cms/hero-slides (Homepage Hero Slides)", f"{API_BASE}/api/v1/cms/hero-slides", validator=json_list_validator)
test_url("Backend REST API", "GET /api/v1/cms/sections/home (Home Page Sections)", f"{API_BASE}/api/v1/cms/sections/home", validator=json_list_validator)
test_url("Backend REST API", "GET /api/v1/cms/sections/our-story (Story Sections)", f"{API_BASE}/api/v1/cms/sections/our-story", validator=json_list_validator)
test_url("Backend REST API", "GET /api/v1/cms/sections/future-ready (Future Ready Sections)", f"{API_BASE}/api/v1/cms/sections/future-ready", validator=json_list_validator)
test_url("Backend REST API", "GET /api/v1/cms/sections/standards (Standards Sections)", f"{API_BASE}/api/v1/cms/sections/standards", validator=json_list_validator)
test_url("Backend REST API", "GET /api/v1/cms/sections/safety (Safety & Responsibility Sections)", f"{API_BASE}/api/v1/cms/sections/safety", validator=json_list_validator)
test_url("Backend REST API", "GET /api/v1/careers/jobs (Public Job Vacancies)", f"{API_BASE}/api/v1/careers/jobs", validator=json_list_validator)
test_url("Backend REST API", "GET /api/v1/careers/admin/jobs (Admin Job Posts)", f"{API_BASE}/api/v1/careers/admin/jobs", headers=AUTH_HEADER, validator=json_list_validator)
test_url("Backend REST API", "GET /api/v1/fleet/equipment (Surveying Hardware & UAVs)", f"{API_BASE}/api/v1/fleet/equipment", validator=json_list_validator)
test_url("Backend REST API", "GET /api/v1/fleet/partners (Institutional Client Logos)", f"{API_BASE}/api/v1/fleet/partners", validator=json_list_validator)
test_url("Backend REST API", "GET /api/v1/clients/admin/all (Client Messaging Directory)", f"{API_BASE}/api/v1/clients/admin/all", headers=AUTH_HEADER)
test_url("Backend REST API", "GET /api/v1/inbox/admin/conversations (Inbox Threads)", f"{API_BASE}/api/v1/inbox/admin/conversations", headers=AUTH_HEADER)
test_url("Backend REST API", "GET /api/v1/contact/admin/inquiries (Client Inquiries)", f"{API_BASE}/api/v1/contact/admin/inquiries", headers=AUTH_HEADER, validator=json_list_validator)
test_url("Backend REST API", "GET /api/docs (OpenAPI Swagger Documentation)", f"{API_BASE}/api/docs", validator=has_text("Swagger UI"))

# =========================================================================
# 7. INTERACTIVE FORM SUBMISSION & AUTH WORKFLOWS (3 Tests)
# =========================================================================
test_contact_payload = {
    "fullName": "Automated Quality Assurance Bot",
    "email": "qa-test@geospatialworks.com.bd",
    "phone": "+8801700000000",
    "serviceType": "TOPOGRAPHIC SURVEY",
    "message": "[Organization: Automated Testing Systems]\nExecuting complete automated integration validation."
}
test_url("Interactive API Workflow", "POST /api/v1/contact/inquiry (Live Lead Ingestion)", f"{API_BASE}/api/v1/contact/inquiry", expected_status=201, method="POST", data=test_contact_payload, validator=json_obj_validator)

auth_test_payload = {
    "email": "invalid-probe@geospatialworks.com.bd",
    "password": "wrong-password"
}
test_url("Security & Auth Workflow", "POST /api/v1/auth/login (Invalid Auth Rejection)", f"{API_BASE}/api/v1/auth/login", expected_status=401, method="POST", data=auth_test_payload)

# =========================================================================
# 8. CRITICAL ASSETS, LOGOS & EXTRACTED DIAGRAMS INTEGRITY (40+ Tests)
# =========================================================================
key_assets = [
    ("Corporate Brand Logo", "/gw-logo-pure-original.png"),
    ("ArcGIS Pro Software Badge", "/software-logos/arcgis-pro-dark-tight.png"),
    ("QGIS Software Badge", "/software-logos/qgis-dark-tight.png"),
    ("Agisoft Metashape Software Badge", "/software-logos/agisoft-metashape-dark-tight.png"),
    ("AutoCAD Civil 3D Software Badge", "/software-logos/autocad-civil-3d-dark-tight.png"),
    ("Full Software Suite Banner", "/software-logos/geospatial-logos-banner-dark.png"),
    ("Senior Drafter Photo: Rakibul Islam", "/team-photos/rakibul_islam.jpg"),
    ("Project Lead Photo: Delwar Hossain", "/team-photos/delwar_hossain.jpg"),
    ("Survey Specialist: Kazi Md. Shah Alam", "/team-photos/kazi_md_shah_alam.jpg"),
    ("Slide 16 Gabtoli Terminal Photo", "/projects-extracted/page_16/img_02.jpg"),
    ("Slide 17 Gabtoli 3D Model", "/projects-extracted/page_17/img_05.jpg"),
    ("Slide 18 Gulshan Intersection Drawing", "/projects-extracted/page_18/img_02.jpg"),
    ("Slide 19 Gulshan Badda Shelter", "/projects-extracted/page_19/img_02.jpg"),
    ("Slide 20 Mohakhali Terminal Photo", "/projects-extracted/page_20/img_02.jpg"),
    ("Slide 21 Mohakhali 3D Render", "/projects-extracted/page_21/img_06.jpg"),
    ("Slide 22 Mohakhali Drainage Plan", "/projects-extracted/page_22/img_02.jpg"),
    ("Slide 23 Moheshkhali Landfill Map", "/projects-extracted/page_23/img_01.png"),
    ("Slide 24 Moheshkhali Structural Sheet", "/projects-extracted/page_24/img_02.png"),
    ("Slide 25 Web-AIS Irrigation Map", "/projects-extracted/page_25/img_02.jpg"),
    ("Slide 26 Web-AIS TBM Geodetics", "/projects-extracted/page_26/img_02.jpg"),
    ("Slide 27 Gauge Reader Equipment", "/projects-extracted/page_27/img_02.jpg"),
    ("Slide 28 Gangarampur Station Hydrology", "/projects-extracted/page_28/img_02.jpg"),
    ("Slide 29 Abdulpur Bypass Aerial Flight", "/projects-extracted/page_29/img_02.jpg"),
    ("Slide 30 Abdulpur Surface 3D DSM", "/projects-extracted/page_30/img_03.jpg"),
    ("Slide 31 Bus Route Concept Map", "/projects-extracted/page_31/img_01.jpg"),
    ("Slide 32 DTCA Corridor Orthomosaic", "/projects-extracted/page_32/img_02.jpg"),
    ("Real Media UAV Topo Banner", "/real-media/service-topographic-uav.png")
]
for label, asset_path in key_assets:
    test_url("Static Asset Integrity", f"Asset: {label} ({asset_path})", f"{WEB_BASE}{asset_path}")

# Test Software Docx Webp Icons
for i in range(1, 22):
    docx_path = f"/software-logos/docx/image{i}.webp"
    test_url("Software Icon Asset", f"Tool Icon #{i} ({docx_path})", f"{WEB_BASE}{docx_path}")

# =========================================================================
# 9. ENTERPRISE ADMIN PORTAL (PORT 3002) (15 Tests)
# =========================================================================
test_url("Admin Portal", "Admin Root UI Gateway (/)", f"{ADMIN_BASE}/", validator=has_text("Geospatial Works"))
test_url("Admin Portal", "Admin Static Manifest / Security Response", f"{ADMIN_BASE}/_next/static/chunks/main-app.js", expected_status=404)
test_url("Admin Portal", "Admin Reverse Proxy: /api/projects", f"{ADMIN_BASE}/api/projects", validator=json_list_validator)
test_url("Admin Portal", "Admin Reverse Proxy: /api/services", f"{ADMIN_BASE}/api/services", validator=json_list_validator)
test_url("Admin Portal", "Admin Reverse Proxy: /api/articles", f"{ADMIN_BASE}/api/articles", validator=json_list_validator)
test_url("Admin Portal", "Admin Reverse Proxy: /api/team", f"{ADMIN_BASE}/api/team", validator=json_list_validator)
test_url("Admin Portal", "Admin Reverse Proxy: /api/cms/hero-slides", f"{ADMIN_BASE}/api/cms/hero-slides", validator=json_list_validator)
test_url("Admin Portal", "Admin Reverse Proxy: /api/fleet/equipment", f"{ADMIN_BASE}/api/fleet/equipment", validator=json_list_validator)
test_url("Admin Portal", "Admin Reverse Proxy: /api/careers/jobs", f"{ADMIN_BASE}/api/careers/jobs", validator=json_list_validator)
test_url("Admin Portal", "Admin Reverse Proxy: /api/contact/admin/inquiries", f"{ADMIN_BASE}/api/contact/admin/inquiries", headers=AUTH_HEADER, validator=json_list_validator)
test_url("Admin Portal", "Admin Reverse Proxy: /api/careers/admin/jobs", f"{ADMIN_BASE}/api/careers/admin/jobs", headers=AUTH_HEADER, validator=json_list_validator)
test_url("Admin Portal", "Admin Image Proxy: /projects-extracted/page_16/img_02.jpg", f"{ADMIN_BASE}/projects-extracted/page_16/img_02.jpg")
test_url("Admin Portal", "Admin Image Proxy: /team-photos/rakibul_islam.jpg", f"{ADMIN_BASE}/team-photos/rakibul_islam.jpg")
test_url("Admin Portal", "Admin Image Proxy: /software-logos/arcgis-pro-dark-tight.png", f"{ADMIN_BASE}/software-logos/arcgis-pro-dark-tight.png")
test_url("Admin Portal", "Admin Image Proxy: /real-media/service-topographic-uav.png", f"{ADMIN_BASE}/real-media/service-topographic-uav.png")

# =========================================================================
# 10. SAVE TEST REPORT
# =========================================================================
with open("test_results.json", "w") as f:
    json.dump(results, f, indent=2)

passed_count = sum(1 for r in results if r["passed"])
failed_count = sum(1 for r in results if not r["passed"])
total_count = len(results)

print("="*80)
print(f"COMPREHENSIVE TEST SUITE COMPLETE: {total_count} TOTAL TESTS EXECUTED")
print(f"PASSED: {passed_count} | FAILED: {failed_count} | SUCCESS RATE: {(passed_count/total_count)*100:.1f}%")
print("="*80)
