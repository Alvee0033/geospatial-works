import re

# Read original
with open('apps/admin/src/app/page.tsx.bak', 'r') as f:
    orig = f.read()

# Extract the existing solid tab implementations from orig
hero_jsx = orig[orig.find("activeTab === 'hero'"):orig.find("activeTab === 'sections'")]
services_jsx = orig[orig.find("activeTab === 'services'"):orig.find("activeTab === 'projects'")]
projects_jsx = orig[orig.find("activeTab === 'projects'"):orig.find("activeTab === 'media'")]
media_jsx = orig[orig.find("activeTab === 'media'"):orig.find("activeTab === 'inquiries'")]
inquiries_jsx = orig[orig.find("activeTab === 'inquiries'"):orig.find("</main>")]

print("Extracted existing JSX tab blocks successfully.")
