import os
import re
import json
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "https://lagoslife.eliysites.com"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

workspace = r"c:\Users\dc941\Documents\LLLife"

# Directories
DIRS = {
    "root": workspace,
    "site": os.path.join(workspace, "site"),
    "chunks": os.path.join(workspace, "site", "_next", "static", "chunks"),
    "media": os.path.join(workspace, "site", "_next", "static", "media"),
    "models": os.path.join(workspace, "assets", "models"),
    "textures": os.path.join(workspace, "assets", "textures"),
    "billboard_images": os.path.join(workspace, "assets", "billboards"),
    "api_data": os.path.join(workspace, "api_data"),
    "extracted_data": os.path.join(workspace, "extracted_data"),
    "analysis": os.path.join(workspace, "analysis")
}

for d in DIRS.values():
    os.makedirs(d, exist_ok=True)

# 1. Models to download
character_models = [
    "chars/f_casual.glb",
    "chars/f_party.glb",
    "chars/f_smart.glb",
    "chars/f_street.glb",
    "chars/f_work.glb",
    "chars/m_casual.glb",
    "chars/m_casual2.glb",
    "chars/m_party.glb",
    "chars/m_smart.glb",
    "chars/m_street.glb",
    "chars/m_work.glb"
]

car_models = [
    "world/car/sedan.glb",
    "world/car/suv.glb",
    "world/car/taxi.glb",
    "world/car/truck.glb",
    "world/car/van.glb"
]

commercial_models = [
    "world/commercial/building-a.glb",
    "world/commercial/building-b.glb",
    "world/commercial/building-c.glb",
    "world/commercial/building-d.glb",
    "world/commercial/building-e.glb",
    "world/commercial/building-g.glb",
    "world/commercial/building-h.glb",
    "world/commercial/building-k.glb",
    "world/commercial/building-skyscraper-a.glb",
    "world/commercial/building-skyscraper-b.glb",
    "world/commercial/building-skyscraper-c.glb",
    "world/commercial/building-skyscraper-e.glb",
    "world/commercial/detail-awning-wide.glb",
    "world/commercial/detail-overhang.glb",
    "world/commercial/detail-parasol-a.glb",
    "world/commercial/detail-parasol-b.glb"
]

suburban_models = [
    "world/suburban/building-type-a.glb",
    "world/suburban/building-type-b.glb",
    "world/suburban/building-type-c.glb",
    "world/suburban/building-type-d.glb",
    "world/suburban/building-type-e.glb",
    "world/suburban/building-type-f.glb",
    "world/suburban/building-type-g.glb",
    "world/suburban/building-type-h.glb",
    "world/suburban/building-type-k.glb",
    "world/suburban/building-type-m.glb",
    "world/suburban/building-type-q.glb",
    "world/suburban/building-type-t.glb",
    "world/suburban/planter.glb",
    "world/suburban/tree-large.glb",
    "world/suburban/tree-small.glb"
]

nature_models = [
    "world/nature/flower_redA.glb",
    "world/nature/flower_yellowA.glb",
    "world/nature/plant_bush.glb",
    "world/nature/plant_bushLarge.glb",
    "world/nature/rock_largeA.glb",
    "world/nature/tree_default.glb",
    "world/nature/tree_palmBend.glb",
    "world/nature/tree_palmTall.glb"
]

pirate_models = [
    "world/pirate/boat-row-small.glb",
    "world/pirate/palm-bend.glb",
    "world/pirate/palm-straight.glb",
    "world/pirate/structure-platform-dock.glb",
    "world/pirate/structure-roof.glb"
]

furniture_models = [
    "furniture/bedSingle.glb",
    "furniture/bedDouble.glb",
    "furniture/kitchenStove.glb",
    "furniture/kitchenFridge.glb",
    "furniture/toilet.glb",
    "furniture/shower.glb",
    "furniture/chair.glb",
    "furniture/loungeSofa.glb",
    "furniture/loungeChair.glb",
    "furniture/tableCoffee.glb",
    "furniture/rugRectangle.glb",
    "furniture/cabinetTelevision.glb",
    "furniture/televisionModern.glb",
    "furniture/desk.glb",
    "furniture/laptop.glb",
    "furniture/chairDesk.glb",
    "furniture/bookcaseOpen.glb",
    "furniture/books.glb",
    "furniture/pottedPlant.glb",
    "furniture/rugRound.glb",
    "furniture/lampRoundFloor.glb",
    "furniture/sideTable.glb",
    "furniture/radio.glb",
    "furniture/bathroomMirror.glb",
    "furniture/kitchenCabinet.glb",
    "furniture/kitchenSink.glb",
    "furniture/washer.glb",
    "furniture/speaker.glb",
    "furniture/bathtub.glb",
    "furniture/cooler.glb",
    "furniture/fan.glb",
    "furniture/generator.glb",
    "furniture/jacuzzi.glb",
    "furniture/kingBed.glb",
    "furniture/piano.glb",
    "furniture/vono.glb"
]

all_models = character_models + car_models + commercial_models + suburban_models + nature_models + pirate_models + furniture_models

# Textures
textures = [
    "/models/world/pirate/Textures/colormap.png",
    "/models/world/commercial/Textures/colormap.png",
    "/models/world/suburban/Textures/colormap.png",
    "/models/world/car/Textures/colormap.png"
]

# Static chunk files from DOM & bundles
chunks = [
    "/_next/static/chunks/1hbzhmilrsj2i.css",
    "/_next/static/chunks/3ni5tbb449gjx.css",
    "/_next/static/chunks/0p91zfawmvoj4.js",
    "/_next/static/chunks/2kstq4kblh5h-.js",
    "/_next/static/chunks/turbopack-32r47vn9gk1gs.js",
    "/_next/static/chunks/3ox82lyaxun21.js",
    "/_next/static/chunks/3dlqm4t3lwqe9.js",
    "/_next/static/chunks/137cyer49p1ei.js",
    "/_next/static/chunks/3aewumg6jlhf3.js",
    "/_next/static/chunks/3vdp8l41vgaco.js",
    "/_next/static/chunks/0u3h5phbnjv14.js",
    "/_next/static/chunks/0u-lpfsr-kyh3.js",
    "/_next/static/chunks/2ttj87p8vn0op.js",
    "/_next/static/chunks/0mzw0ugrs0p8h.js",
    "/_next/static/chunks/0a4az3h_zfpn4.js",
    "/_next/static/chunks/1j4-pmgn7-r9_.js",
    "/_next/static/chunks/3jv557p5iq4mk.js",
    "/_next/static/chunks/3qi9c-v7ubuum.js",
    "/_next/static/chunks/0vks1-_0allxo.js",
    "/_next/static/chunks/2afas8qnowmhu.js",
    "/_next/static/chunks/2lohtkr713v9v.js",
    "/_next/static/chunks/0v9ugcu8gsz7s.js",
    "/_next/static/chunks/28rj3eza8j4he.js",
    "/_next/static/chunks/2h5d-2cshddbh.js",
    "/_next/static/chunks/3k9est-ai4y52.js",
    "/_next/static/chunks/1wzoa_870ez4l.js",
    "/_next/static/chunks/3vct9ii-k-uvy.js",
    "/_next/static/chunks/0jdui2ubgldm6.js",
    "/_next/static/chunks/0cz1d0mv5g_q7.js",
    "/_next/static/chunks/0aebqb-r2y4mc.js",
    "/_next/static/chunks/2z_pbiejpxl6k.js",
    "/_next/static/chunks/2m1axo1s__xif.js",
    "/_next/static/chunks/2y9mt7hzmv74u.js",
    "/_next/static/chunks/0h-j4_yw35a--.js",
    "/_next/static/chunks/2ipskyn6xlm81.js",
    "/_next/static/chunks/0vgk6h7j_ua28.js",
    "/_next/static/chunks/3gg_tw9jrbd5h.js",
    "/_next/static/chunks/1todx7rctijxc.js",
    "/_next/static/chunks/3iluy0onkjs7j.js",
    "/_next/static/chunks/33hpcy7s2rwbe.js",
    "/_next/static/chunks/2c3zakk_tyr-i.js",
    "/_next/static/chunks/0wu-n3qohfqt_.js",
    "/_next/static/chunks/0ive9zeli_v2r.js"
]

fonts = [
    "/_next/static/media/5d52bd6c4cb3f315-s.p.0ez3bnoxb63ra.woff2",
    "/_next/static/media/fba5a26ea33df6a3-s.p.18rizl4rsrl42.woff2"
]

# Basic pages & icons
basics = [
    ("/", "site/index.html"),
    ("/manifest.webmanifest", "site/manifest.webmanifest"),
    ("/icon.svg?icon.1yrju-45dlf-0.svg", "site/icon.svg"),
    ("/apple-icon.png?apple-icon.3g-ksduuva788.png", "site/apple-icon.png"),
    ("/privacy", "site/privacy.html"),
    ("/robots.txt", "site/robots.txt")
]

print("Assembled basic manifest.")
print(f"Models to test: {len(all_models)}")
print(f"Chunks to download: {len(chunks)}")
print(f"Fonts to download: {len(fonts)}")
