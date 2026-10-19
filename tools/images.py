import json,sys,os,hashlib,re,subprocess,concurrent.futures as cf
from urllib.parse import urlparse
c=json.load(open(sys.argv[1])); outdir=sys.argv[2]; os.makedirs(outdir,exist_ok=True)
raw=os.path.join(outdir,'_raw'); os.makedirs(raw,exist_ok=True)
urls=sorted({b['src'] for p in c.values() for b in p['blocks'] if b['t']=='img'})
def name(u):
    base=os.path.splitext(os.path.basename(urlparse(u).path))[0]
    base=re.sub(r'-(\d+x\d+)(-\d+x\d+)?$','',base); base=re.sub(r'-scaled$','',base)
    base=re.sub(r'[^A-Za-z0-9]+','-',base).strip('-').lower()[:60]
    return f"{base}-{hashlib.md5(u.encode()).hexdigest()[:6]}"
def fetch(u):
    n=name(u); f=os.path.join(raw,n+os.path.splitext(urlparse(u).path)[1].lower())
    if not os.path.exists(f): subprocess.run(['curl','-sfL','-o',f,u],check=True)
    return u,n,f
m={}
with cf.ThreadPoolExecutor(8) as ex:
    for u,n,f in ex.map(fetch,urls): m[u]={'name':n,'raw':f}
json.dump(m,open(os.path.join(outdir,'_map.json'),'w'),indent=1)
print(len(m),'images')
