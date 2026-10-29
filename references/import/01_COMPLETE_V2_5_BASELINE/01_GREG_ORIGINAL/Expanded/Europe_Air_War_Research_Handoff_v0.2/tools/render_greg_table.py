"""Readable technical poster of all 46 fields from the Greg Speed Table sheet.

This reads the finished workbook's cached values; it does not recompute or
change the underlying spreadsheet.
"""

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
import openpyxl


SCRIPT_DIR = Path(__file__).resolve().parent
# Works both in the original project root and in the ZIP's tools/ directory.
ROOT = SCRIPT_DIR.parent if (SCRIPT_DIR.parent / 'data' / 'WWII_Aircraft_Complete_Data_Table_v0.2.xlsx').exists() else SCRIPT_DIR
SOURCE = ROOT / 'data' / 'WWII_Aircraft_Complete_Data_Table_v0.2.xlsx'
if not SOURCE.exists():
    SOURCE = ROOT / 'WWII_Aircraft_Complete_Data_Table_v0.2.xlsx'
OUTPUT = ROOT / 'visuals' / 'P51B_Greg_Complete_Table_Visual.png'
if not OUTPUT.parent.exists():
    OUTPUT = ROOT / 'P51B_Greg_Complete_Table_Visual.png'

wb = openpyxl.load_workbook(SOURCE, data_only=True, read_only=True)
ws = wb['Greg Speed Table']
rows = ws.iter_rows(min_row=4, max_row=70, min_col=2, max_col=47, values_only=True)
headers = list(next(rows))
assert len(headers) == 46
records = []
for row in rows:
    if row[0] == 20800 and row[2] == '67inHg' and row[3] == 'high':
        records.append(dict(zip(headers, row)))
assert len(records) == 11
assert [int(r['TAS mph']) for r in records] == list(range(130, 431, 30))

W, H = 3400, 4740
NAVY = '#14283A'
NAVY2 = '#213B50'
INK = '#1D3547'
MUTED = '#617788'
PAPER = '#F7FAFC'
WHITE = '#FFFFFF'
GRID = '#D6E1E9'
TEAL = '#107F8F'
TEAL_LIGHT = '#E5F3F3'
AMBER = '#E6A23A'
AMBER_LIGHT = '#FFF3DE'
RED = '#B74343'
RED_LIGHT = '#FCEAEA'
GREEN = '#167D69'
GREEN_LIGHT = '#E4F4EE'

im = Image.new('RGB', (W, H), PAPER)
d = ImageDraw.Draw(im)
FONT_REG = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def font(sz, bold=False):
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, sz)

TITLE = font(69, True)
SUB = font(31)
SECTION = font(32, True)
LABEL = font(28)
LABEL_BOLD = font(28, True)
VALUE = font(27)
VALUE_BOLD = font(27, True)
NOTE = font(27)
TINY = font(24)

margin = 118
content_x0 = margin
label_w = 990
data_x0 = content_x0 + label_w
data_w = W - margin - data_x0
col_w = data_w / len(records)
content_right = W - margin

def txt(x, y, s, f, fill=INK):
    d.text((x, y), str(s), font=f, fill=fill)

def centered(cx, cy, s, f, fill=INK):
    bbox = d.textbbox((0, 0), str(s), font=f)
    d.text((cx - (bbox[2] - bbox[0]) / 2,
            cy - (bbox[3] - bbox[1]) / 2 - bbox[1]), str(s),
           font=f, fill=fill)

def right(x, y, s, f, fill=INK):
    bbox = d.textbbox((0, 0), str(s), font=f)
    txt(x - bbox[2], y, s, f, fill)

def wrap(text, f, max_width):
    out = []
    line = ''
    for part in str(text).split(' '):
        candidate = (line + ' ' + part).strip()
        if d.textlength(candidate, font=f) > max_width and line:
            out.append(line)
            line = part
        else:
            line = candidate
    if line:
        out.append(line)
    return out

def fmt(name, val):
    if val is None:
        return '—'
    if isinstance(val, str):
        if name == 'Stall status':
            return 'STALL' if val.startswith('Below') else 'OK'
        return val
    if name in ['Parasite %', 'Induced %']:
        return f'{val:.0%}'
    if name in ['Density kg/m³', 'CL (1g)', 'CD0', 'CD induced', 'CD wave', 'CD total', 'Induced k', 'Shaft hp/lb']:
        return f'{val:.3f}' if name not in ['CD0', 'CD induced', 'CD wave', 'CD total'] else f'{val:.4f}'
    if name in ['Mach', 'Aspect ratio', 'Lift/drag', 'Wing loading lb/ft²', 'Max instant G', 'Max sustained G', 'Instant deg/s', 'Sustained deg/s', 'Accel m/s²', 'Ps m/s']:
        return f'{val:.2f}' if name in ['Mach', 'Accel m/s²', 'Ps m/s'] else f'{val:.1f}'
    if name == 'Prop eta':
        return f'{val:.0%}'
    if name == 'Wing S m²':
        return f'{val:.2f}'
    if name in ['Altitude ft', 'BHP', 'Weight lb', 'q Pa', 'Parasite drag lbf', 'Induced drag lbf', 'Other drag lbf', 'Total drag lbf', 'Shaft HP avail', 'Useful HP avail', 'Useful HP required', 'Shaft HP required', 'Excess useful HP', 'ROC ft/min', 'Instant radius m', 'Sustained radius m']:
        return f'{val:,.0f}'
    if name in ['TAS mph', 'EAS mph', 'Stall EAS mph']:
        return f'{val:.0f}'
    return f'{val:.2f}' if isinstance(val, float) else str(val)

# Header and source/context badges.
d.rectangle((0, 0, W, 250), fill=NAVY)
d.rectangle((0, 246, W, 254), fill=TEAL)
txt(margin, 37, 'GREG-STYLE  /  COMPLETE SPEED TABLE', TITLE, WHITE)
txt(margin, 144, 'P-51B-15-NA  •  serial 43-24777  •  20,800 ft  •  67 inHg / high blower', SUB, '#C8DCE9')
right(content_right, 151, 'WORKBOOK v0.2   ·   46 FIELDS', font(27, True), '#B9DDDC')

# Small graph: the key Greg-style physical insight that the two drag terms
# cross over rather than having one fixed parasite/induced percentage.
top = 290
graph_left = 275
graph_right = 2160
graph_top = 340
graph_bottom = 704
d.rounded_rectangle((margin, top, 2285, 784), radius=32, fill=WHITE, outline=GRID, width=2)
txt(graph_left, 303, 'DRAG VS TRUE AIRSPEED', SECTION, NAVY)
for gv in (0, 300, 600, 900, 1200):
    py = graph_bottom - gv / 1200 * (graph_bottom - graph_top)
    d.line((graph_left, py, graph_right, py), fill=GRID, width=2)
    right(graph_left - 22, py - 15, f'{gv:,}', TINY, MUTED)
for mph in [130, 190, 250, 310, 370, 430]:
    px = graph_left + (mph - 130) / 300 * (graph_right - graph_left)
    d.line((px, graph_top, px, graph_bottom), fill='#E8EEF3', width=2)
    centered(px, graph_bottom + 34, str(mph), TINY, MUTED)

for name, color in [('Parasite drag lbf', TEAL), ('Induced drag lbf', AMBER), ('Total drag lbf', NAVY2)]:
    pts = []
    for r in records:
        xx = graph_left + (r['TAS mph'] - 130) / 300 * (graph_right - graph_left)
        yy = graph_bottom - r[name] / 1200 * (graph_bottom - graph_top)
        pts.append((xx, yy))
    d.line(pts, fill=color, width=7, joint='curve')
    for xx, yy in pts:
        d.ellipse((xx - 5, yy - 5, xx + 5, yy + 5), fill=color)

ly = 746
for i, (label, col) in enumerate([('PARASITE', TEAL), ('INDUCED', AMBER), ('TOTAL', NAVY2)]):
    xx = graph_left + i * 520
    d.rounded_rectangle((xx, ly - 6, xx + 44, ly + 15), radius=5, fill=col)
    txt(xx + 57, ly - 15, label, font(24, True), MUTED)

d.rounded_rectangle((2315, top, content_right, 784), radius=32, fill=AMBER_LIGHT)
txt(2353, 320, 'IMPORTANT', font(35, True), '#805215')
for i, line in enumerate([
    'This is the entire',
    '46-field structure,',
    'transposed to fit.',
    '',
    'Drag and turn results',
    'are model estimates,',
    'not wind-tunnel data.',
]):
    txt(2353, 390 + 44 * i, line, font(27), '#75562C')

# All original worksheet columns (except the speed field, already in the
# 11-column header) are shown as row labels in worksheet order.
group_specs = [
    ('01', 'FLIGHT CONDITIONS & ATMOSPHERE', 0, 10, TEAL),
    ('02', 'WING GEOMETRY & DRAG COEFFICIENTS', 10, 20, '#3E6996'),
    ('03', 'DRAG FORCES & DRAG SPLIT', 20, 27, '#B57C21'),
    ('04', 'POWER, CLIMB & ACCELERATION', 27, 36, '#337E6A'),
    ('05', 'MANEUVERING ENVELOPE', 36, 44, '#745E9E'),
]

table_y = 828
d.rounded_rectangle((margin, table_y, content_right, table_y + 98), radius=16, fill=NAVY2)
txt(margin + 27, table_y + 23, 'ORIGINAL WORKSHEET FIELD', font(28, True), WHITE)
for i, r in enumerate(records):
    cx = data_x0 + (i + .5) * col_w
    centered(cx, table_y + 50, str(r['TAS mph']), font(33, True), '#FFFFFF')
txt(content_right - 218, table_y - 35, 'TAS (mph) →', font(23, True), MUTED)

row_h = 61
band_h = 67
y = table_y + 105
short_code = '—'
for grp_no, grp_title, start, end, color in group_specs:
    d.rounded_rectangle((margin, y, content_right, y + band_h - 7), radius=9, fill=color)
    txt(margin + 23, y + 11, grp_no, font(30, True), WHITE)
    txt(margin + 102, y + 11, grp_title, font(31, True), WHITE)
    y += band_h
    for local_i, col_i in enumerate(range(start, end)):
        name = headers[col_i]
        a, b = y + local_i * row_h, y + (local_i + 1) * row_h
        if local_i % 2 == 0:
            d.rectangle((margin, a, content_right, b), fill='#EAF1F6')
        if col_i in [0, 1] or name in ['Total drag lbf', 'Excess useful HP', 'ROC ft/min']:
            d.rectangle((margin, a, data_x0 - 1, b), fill='#DBE9F0')
        d.line((margin, b, content_right, b), fill=GRID, width=1)
        for j, row in enumerate(records):
            cx = data_x0 + (j + .5) * col_w
            val = row[name]
            string = fmt(name, val)
            if name in ['Rating', 'Gear']:
                f = font(23)
            elif name == 'Stall status':
                f = font(25, True)
            else:
                f = VALUE_BOLD if name in ['Total drag lbf', 'Excess useful HP', 'ROC ft/min', 'Parasite %', 'Induced %'] else VALUE
            c = INK
            if name in ['Parasite drag lbf', 'Parasite %']:
                c = TEAL
            elif name in ['Induced drag lbf', 'Induced %']:
                c = '#A36A14'
            elif name == 'Excess useful HP' and isinstance(val, (float, int)):
                c = GREEN if val > 0 else RED
            elif name == 'Stall status':
                c = RED if string == 'STALL' else GREEN
            elif name in ['ROC ft/min', 'Ps m/s'] and isinstance(val, (float, int)) and val < 0:
                c = RED
            centered(cx, (a + b) / 2, string, f, c)
        txt(margin + 26, a + 15, name, LABEL_BOLD if name in ['Total drag lbf', 'Excess useful HP', 'ROC ft/min'] else LABEL, INK)
    y += (end - start) * row_h

# Complete metadata fields 45 and 46, with their actual source strings.
meta_y = y + 10
for idx, name in enumerate(headers[44:]):
    a = meta_y + idx * 74
    d.rounded_rectangle((margin, a, content_right, a + 65), radius=11, fill=AMBER_LIGHT if idx == 0 else WHITE, outline=GRID, width=2)
    txt(margin + 27, a + 16, name.upper(), font(28, True), '#75562C' if idx == 0 else NAVY)
    txt(data_x0, a + 15, records[0][name], font(27), '#75562C' if idx == 0 else INK)

# Footer explanation, source and exact modeling assumptions.
note_top = meta_y + 178
d.line((margin, note_top, content_right, note_top), fill='#A7BDCD', width=4)
txt(margin, note_top + 25, 'HOW TO READ THIS TABLE', font(32, True), NAVY)
notes = [
    'Each column is one aircraft speed at 20,800 ft. All 46 original Greg Speed Table fields are included above.',
    'The 130 mph case is below the modeled stall threshold: its calculated climb/turn values are not physically valid.',
    'Provisional assumptions: CD₀ = 0.016, Oswald e = 0.80, propeller η = 0.80, CLmax = 1.60, structural 6 G.',
    'The engine BHP is a historical rating/chart node. Aerodynamic coefficients and propeller efficiency are not measured.',
    'Reference: WWII Aircraft Complete Data Table v0.2 → “Greg Speed Table” (P-51B-15-NA, serial 43-24777).',
]
for i, line in enumerate(notes):
    txt(margin, note_top + 85 + i * 51, line, NOTE, MUTED)

assert note_top + 85 + len(notes) * 51 < H - 65, (note_top, H)
d.rectangle((0, H - 17, W, H), fill=NAVY)
im.save(OUTPUT, optimize=True)
print(f'{OUTPUT}  {im.width}×{im.height}  fields={len(headers)} speeds={len(records)}')
