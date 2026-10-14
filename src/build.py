"""Rebuild index.html from src/page-template.html by inlining the images.
Run from the repo root:  python src/build.py
"""
import base64, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
img = root / "src" / "images"
html = (root / "src" / "page-template.html").read_text(encoding="utf-8")
def data(name):
    return "data:image/jpeg;base64," + base64.b64encode((img / name).read_bytes()).decode()
for key, name in {"LOGO": "logo.jpg", "P1": "one-to-one-1.jpg", "P2": "one-to-one-2.jpg",
                  "VG": "vid-graham.jpg", "VF": "vid-fbad.jpg"}.items():
    html = html.replace("{{" + key + "}}", data(name))
(root / "index.html").write_text(html, encoding="utf-8")
print("index.html rebuilt")
