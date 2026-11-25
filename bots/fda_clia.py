"""Weekly: download FDA's CLIA categorization file and publish recent test systems as JSON.

Source: https://www.accessdata.fda.gov/premarket/ftparea/clia_detail.zip (FDA CLIA database, updated monthly or more often).
Output: docs/data/fda-clia-recent.json  (test systems categorized in the last 24 months)
"""
import datetime, io, json, re, urllib.request, zipfile
URL = "https://www.accessdata.fda.gov/premarket/ftparea/clia_detail.zip"
SPEC = {"1": "General Chemistry", "2": "General Chemistry", "3": "Hematology", "4": "Immunology", "5": "Immunohematology", "6": "Endocrinology",
        "7": "Toxicology/TDM", "8": "Bacteriology", "9": "Mycobacteriology", "10": "Virology", "11": "Parasitology", "12": "Mycology", "13": "Cytology"}
def slug(s):
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")[:90]
raw = urllib.request.urlopen(urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"}), timeout=120).read()
z = zipfile.ZipFile(io.BytesIO(raw)); txt = z.read(z.namelist()[0]).decode("latin-1")
lines = txt.splitlines(); hdr = lines[0].split("|"); ix = {h: i for i, h in enumerate(hdr)}
cut = (datetime.date.today() - datetime.timedelta(days=730)).strftime("%Y/%m/%d")
systems = {}
for l in lines[1:]:
    r = l.split("|")
    if len(r) < len(hdr): continue
    d = r[ix["DATE_EFFECTIVE"]][:10]
    if d < cut: continue
    name = r[ix["TEST_SYSTEM_NAME"]].strip()
    mfr, _, prod = name.partition(", ") if ", " in name else ("", "", name)
    s = systems.setdefault(name, {"name": name, "mfr": mfr, "product": prod or name, "analytes": [], "latest": d})
    q = " ".join(x for x in (r[ix["QUALIFIER1"]], r[ix["QUALIFIER2"]]) if x.strip())
    s["analytes"].append({"a": r[ix["ANALYTE_NAME"]].strip(), "c": r[ix["COMPLEXITY"]].strip().title(), "d": d.replace("/", "-"),
                          "doc": r[ix["DOCUMENT_NUMBER"]].strip(), "q": q.strip()})
    s["latest"] = max(s["latest"], d)
out, used = [], set()
for s in sorted(systems.values(), key=lambda s: s["latest"], reverse=True):
    sl = slug(s["product"] + "-" + s["mfr"].split()[0] if s["mfr"] else s["product"])
    while sl in used: sl += "-x"
    used.add(sl); s["slug"] = sl; s["latest"] = s["latest"].replace("/", "-")
    seen = set(); s["analytes"] = [a for a in s["analytes"] if not ((a["a"], a["c"], a["q"]) in seen or seen.add((a["a"], a["c"], a["q"])))]
    out.append(s)
json.dump({"generated": datetime.date.today().isoformat(), "source": URL, "count": len(out), "systems": out},
          open("docs/data/fda-clia-recent.json", "w"), separators=(",", ":"))
print(len(out), "test systems;", sum(len(s["analytes"]) for s in out), "analyte rows")
