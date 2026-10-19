import json,re,sys,html
from bs4 import BeautifulSoup, NavigableString, Tag
src=sys.argv[1]; out=sys.argv[2]
pages={x['slug']:x for x in json.load(open(src))}
def norm(t): return re.sub(r'\s+',' ',t.replace('\xa0',' ')).strip()
def best(img):
    for a in ('data-src','src'):
        v=img.get(a)
        if v and not v.startswith('data:'): return v
    return None
def inline(el):
    # keep links/em/strong as minimal html
    parts=[]
    for c in el.descendants:
        pass
    h=''.join(str(x) for x in el.contents)
    h=re.sub(r'<(?!/?(a|em|strong|i|b|br)\b)[^>]+>','',h)
    h=re.sub(r'<a [^>]*href="([^"]+)"[^>]*>',r'<a href="\1">',h)
    return norm(h)
def walk(node,blocks,seen):
    for c in node.children:
        if not isinstance(c,Tag): continue
        cls=' '.join(c.get('class',[]))
        if c.name=='a' and 'envira-gallery-link' in cls:
            blocks.append({'t':'img','src':c['href'],'cap':norm(c.get('data-envira-caption') or c.get('title') or '')}); continue
        if c.name=='figure' or (c.name=='div' and 'wp-block-image' in cls and not c.find('figure')):
            img=c.find('img')
            if img and best(img):
                cap=c.find('figcaption')
                blocks.append({'t':'img','src':best(img),'cap':norm(cap.get_text(' ')) if cap else norm(img.get('alt',''))})
            elif c.find('blockquote'):
                walk(c,blocks,seen)
            continue
        if c.name=='img' and best(c):
            blocks.append({'t':'img','src':best(c),'cap':norm(c.get('alt',''))}); continue
        if c.name in ('h1','h2','h3','h4','h5','h6'):
            t=norm(c.get_text(' '))
            if t: blocks.append({'t':'h','l':int(c.name[1]),'x':t})
            continue
        if c.name=='p':
            imgs=c.find_all('img')
            for i in imgs:
                if best(i): blocks.append({'t':'img','src':best(i),'cap':norm(i.get('alt',''))})
            t=inline(c)
            if norm(c.get_text(' ')): blocks.append({'t':'p','x':t})
            continue
        if c.name in ('ul','ol'):
            blocks.append({'t':'list','items':[inline(li) for li in c.find_all('li')]}); continue
        if c.name=='table':
            blocks.append({'t':'table','rows':[[norm(td.get_text(' ')) for td in tr.find_all(['td','th'])] for tr in c.find_all('tr')]}); continue
        if c.name=='blockquote':
            blocks.append({'t':'quote','x':inline(c)}); continue
        walk(c,blocks,seen)
res={}
for slug,pg in pages.items():
    s=BeautifulSoup(pg['content']['rendered'],'html.parser')
    b=[]; walk(s,b,set())
    res[slug]={'title':html.unescape(pg['title']['rendered']),'blocks':b}
json.dump(res,open(out,'w'),indent=1,ensure_ascii=False)
for k,v in res.items(): print(k,len(v['blocks']),sum(1 for x in v['blocks'] if x['t']=='img'))
