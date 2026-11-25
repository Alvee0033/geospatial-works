import sys

with open('apps/admin/src/app/page.tsx.bak', 'r') as f:
    orig = f.read()

# Extract the existing solid handlers and functions
services_jsx = orig[orig.find("activeTab === 'services'"):orig.find("activeTab === 'projects'")]
projects_jsx = orig[orig.find("activeTab === 'projects'"):orig.find("activeTab === 'media'")]
media_jsx = orig[orig.find("activeTab === 'media'"):orig.find("activeTab === 'inquiries'")]
inquiries_jsx = orig[orig.find("activeTab === 'inquiries'"):orig.find("</main>")]

print("Writing apps/admin/src/app/page.tsx...")
