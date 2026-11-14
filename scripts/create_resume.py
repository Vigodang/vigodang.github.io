"""Generate the committed text PDF from JSON on stdin; no application data access."""

from io import BytesIO
from pathlib import Path
from xml.sax.saxutils import escape
import json
import re
import sys
import unicodedata

from pypdf import PdfReader, PdfWriter
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate, Spacer
from reportlab.pdfgen.canvas import Canvas


def clean(value):
    text = unicodedata.normalize("NFC", str(value))
    for mark in "\u2010\u2011\u2012\u2013\u2014\u2212":
        text = text.replace(mark, "-")
    return text.replace("\u00b7", " | ").replace("\u2192", " -> ").replace("\u00d7", "x")


def text(value):
    return escape(clean(value))


def linked(url, label):
    return '<link href="{}" color="#234c3e">{}</link>'.format(escape(str(url), {'"': '&quot;'}), text(label))


def assert_page_one_requirements(data, extracted):
    normalized = re.sub(r"\s+", " ", extracted)
    education = data["education"]
    required = [education[key] for key in ("university", "degree", "minor", "graduation", "location", "award")]
    required.extend([next(skill["label"] for skill in data["skills"] if "deep learning" in skill["label"].lower()), "PyTorch", "TensorFlow"])
    for value in required:
        if clean(value) not in normalized:
            raise ValueError(f"Page one must contain the complete education and deep-learning blocks; missing: {value}")


def main():
    payload = json.load(sys.stdin)
    data, fingerprint = payload["data"], payload["fingerprint"]
    if not re.fullmatch(r"[a-f0-9]{64}", fingerprint):
        raise ValueError("Invalid source fingerprint")
    if not re.fullmatch(r"assets/[A-Za-z0-9_.-]+\.pdf", data["pdf"]):
        raise ValueError("PDF must be an asset filename")
    if data.get("layout", {}).get("educationPlacement") != "page-one-before-technical-capabilities":
        raise ValueError("Resume layout must put education on page one before technical capabilities")
    root = Path(__file__).resolve().parent.parent
    output = root / "src" / data["pdf"]
    output.parent.mkdir(parents=True, exist_ok=True)
    stream = BytesIO()
    ink = colors.HexColor("#202622")
    forest = colors.HexColor("#234c3e")
    muted = colors.HexColor("#48524b")
    base = getSampleStyleSheet()
    styles = {
        "name": ParagraphStyle("ResumeName", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=20, leading=23, textColor=ink, spaceAfter=7),
        "contact": ParagraphStyle("ResumeContact", parent=base["Normal"], fontName="Helvetica", fontSize=10, leading=14, textColor=ink, spaceAfter=3),
        "headline": ParagraphStyle("ResumeHeadline", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=10, leading=14, textColor=forest, spaceAfter=7),
        "body": ParagraphStyle("ResumeBody", parent=base["Normal"], fontName="Helvetica", fontSize=10.3, leading=14.2, textColor=ink, spaceAfter=7, alignment=TA_LEFT),
        "section": ParagraphStyle("ResumeSection", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=11.2, leading=15, textColor=forest, spaceBefore=13, spaceAfter=7, keepWithNext=True, borderColor=colors.HexColor("#c1c8c0"), borderWidth=0, borderPadding=0),
        "project": ParagraphStyle("ResumeProject", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=11, leading=14.5, textColor=ink, spaceAfter=3, keepWithNext=True),
        "meta": ParagraphStyle("ResumeMeta", parent=base["Normal"], fontName="Helvetica", fontSize=10, leading=13.4, textColor=muted, spaceAfter=5),
        "skill": ParagraphStyle("ResumeSkill", parent=base["Normal"], fontName="Helvetica", fontSize=10.3, leading=14.2, textColor=ink, spaceAfter=5),
        "bullet": ParagraphStyle("ResumeBullet", parent=base["Normal"], fontName="Helvetica", fontSize=10.3, leading=14.2, textColor=ink, spaceAfter=5, leftIndent=11, bulletIndent=0),
    }

    def para(value, style="body"):
        return Paragraph(value, styles[style])

    phone_digits = re.sub(r"\D", "", data["phone"])
    # The supplied Australian contact number keeps its exact display text while
    # the telephone URI uses the international form for overseas recruiters.
    phone_uri = "+61" + phone_digits[1:] if phone_digits.startswith("0") else "+" + phone_digits
    story = [
        para(text(data["name"]), "name"),
        para(text(data["headline"]), "headline"),
        para(text(data["location"]) + " | " + linked("tel:" + phone_uri, data["phone"]) + " | " + linked("mailto:" + data["email"], data["email"]), "contact"),
        para(" | ".join([
            linked(data["github"], data["github"].removeprefix("https://")),
            linked(data["linkedin"], "LinkedIn"),
        ]), "contact"),
        para("Profile", "section"),
        para(text(data["summary"])),
    ]
    education = data["education"]
    # Deliberate layout-order exception to the supplied TeX: recruiters can see
    # the complete QUT qualification and graduation date on the first page.
    story.append(KeepTogether([
        para("Education &amp; recognition", "section"),
        para("<b>" + text(education["university"]) + "</b> | Expected " + text(education["graduation"])),
        para(text(education["degree"]) + " | " + text(education["minor"]) + " minor"),
        para(text(education["location"])),
        para("<b>Academic recognition:</b> " + text(education["award"])),
    ]))
    story.append(para("Technical capabilities", "section"))
    for skill in data["skills"]:
        story.append(para("<b>" + text(skill["label"]) + ":</b> " + text(skill["items"]), "skill"))
    story.append(para("Selected engineering &amp; data projects", "section"))
    for project in data["projects"]:
        content = [
            para(text(project["title"]) + (" | " + text(project["subtitle"]) if project["subtitle"] else ""), "project"),
            para(text(project["period"]) + " | " + text(project["role"]), "meta"),
            para(text(project["technologies"]), "meta"),
        ]
        content.extend(Paragraph(text(value), styles["bullet"], bulletText="-") for value in project["bullets"])
        content.append(Spacer(1, 7))
        story.append(KeepTogether(content))
    story.append(para("Additional analytical work", "section"))
    for item in data["additional"]:
        story.append(para("<b>" + text(item["title"]) + ":</b> " + text(item["text"])))

    class ResumeCanvas(Canvas):
        def showPage(self):
            # Draw after the page body, preserving sensible ATS extraction order.
            self.saveState()
            self.setFont("Helvetica", 9)
            self.setFillColor(muted)
            self.drawString(43, 25, clean(data["displayName"]) + " | Updated " + clean(data["reviewed"]))
            self.drawRightString(A4[0] - 43, 25, str(self._pageNumber))
            self.restoreState()
            super().showPage()

    document = SimpleDocTemplate(
        stream, pagesize=A4, rightMargin=43, leftMargin=43,
        topMargin=38, bottomMargin=42, title=clean(data["name"]) + " - Resume",
        author=clean(data["name"]), subject="Public resume generated from shared portfolio facts",
        creator="Vigo Dang portfolio resume generator", pageCompression=1,
    )
    document.build(story, canvasmaker=ResumeCanvas)
    stream.seek(0)
    reader = PdfReader(stream)
    if not 1 <= len(reader.pages) <= 2:
        raise ValueError(f"Resume must fit one or two pages; generated {len(reader.pages)}. Edit shared copy, not the type size.")
    assert_page_one_requirements(data, reader.pages[0].extract_text() or "")
    extracted = "\n".join(page.extract_text() or "" for page in reader.pages)
    normalized = re.sub(r"\s+", " ", extracted)
    expected = [data["name"], data["summary"], data["headline"], education["graduation"], data["email"], data["phone"], education["award"]]
    expected.extend(value for skill in data["skills"] for value in (skill["label"], skill["items"]))
    expected.extend(value for project in data["projects"] for value in (project["title"], project["subtitle"], project["period"], project["role"], project["technologies"], *project["bullets"]))
    expected.extend(value for item in data["additional"] for value in (item["title"], item["text"]))
    for value in expected:
        if clean(value) not in normalized:
            raise ValueError(f"Required resume text missing from PDF extraction: {value}")
    if "June 2027" in extracted or "Jun 2027" in extracted:
        raise ValueError("Obsolete graduation date in PDF")
    if "TensorFlow" not in extracted or "PyTorch" not in extracted:
        raise ValueError("The current CV's PyTorch/TensorFlow capabilities must be retained")
    if "Strobe" in extracted:
        raise ValueError("Strobe is not a project in the supplied current CV")
    writer = PdfWriter()
    writer.clone_document_from_reader(reader)
    writer.add_metadata({
        "/SourceHash": fingerprint,
        "/SourceCVHash": data["sourceCV"]["sha256"],
        "/SourceSchema": str(data["schemaVersion"]),
        "/ResumeLayoutVersion": str(data["layout"]["version"]),
        "/Subject": "Current supplied CV adaptation; shared source SHA-256: " + fingerprint,
    })
    with output.open("wb") as handle:
        writer.write(handle)
    print(f"Generated {output.relative_to(root).as_posix()} ({len(reader.pages)} text PDF page(s), body 10.3 pt)")


if __name__ == "__main__":
    main()
