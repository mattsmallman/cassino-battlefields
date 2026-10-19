import json,os,sys
from PIL import Image, ImageOps
m=json.load(open('assets-src/_map.json')); out='site/public/img'; os.makedirs(out,exist_ok=True)
meta={}
for u,v in m.items():
    try:
        im=Image.open(v['raw']); im=ImageOps.exif_transpose(im).convert('RGB')
    except Exception as e: print('FAIL',v['raw'],e); continue
    w,h=im.size; meta[v['name']]={'w':w,'h':h}
    for tw in (640,1280,2000):
        if tw>w and tw!=640: continue
        f=f"{out}/{v['name']}-{tw}.webp"
        if not os.path.exists(f):
            r=im if w<=tw else im.resize((tw,round(h*tw/w)),Image.LANCZOS)
            r.save(f,'WEBP',quality=78,method=5)
    meta[v['name']]['sizes']=[s for s in (640,1280,2000) if s==640 or s<=w]
json.dump(meta,open('site/src/data/imagemeta.json','w'),indent=1)
print(len(meta))
