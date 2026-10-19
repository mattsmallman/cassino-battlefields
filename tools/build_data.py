import json,re,html,sys,os
c=json.load(open('src-scrape/content.json')); imap=json.load(open('assets-src/_map.json'))
out='site/src/data'; os.makedirs(out,exist_ok=True)
def strip(h): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',h))).strip()
def img(b): return {'id':imap[b['src']]['name'],'cap':b['cap'].strip()}
def tidy_cap(s):
    s=s.replace('Bombadier','Bombardier').replace('Monatery','Monastery')
    return re.sub(r'\s+([.,])',r'\1',s).strip()
# ---- itineraries
def itinerary(slug):
    days=[];imgs=[]
    for b in c[slug]['blocks']:
        if b['t']=='h' and re.match(r'Day \d',b['x']): days.append({'n':int(re.search(r'\d+',b['x']).group()),'items':[]})
        elif b['t']=='p' and days:
            for part in re.split(r'(?:<br/?>\s*)+',b['x']):
                t=strip(part)
                t=re.sub(r'(\d) (\d\d)\b',r'\1\2',t) if '19 44' in t else t
                if t: days[-1]['items'].append(t)
        elif b['t']=='img': i=img(b); i['cap']=tidy_cap(i['cap']); imgs.append(i)
    return days,imgs
tours={}
for slug in ['cassino','anzio-and-the-garigliano','gothic-line','rome-to-bologna','salerno']:
    d,i=itinerary(slug); tours[slug]={'days':d,'images':i}
json.dump(tours,open(f'{out}/itineraries.json','w'),indent=1,ensure_ascii=False)
# ---- galleries
gal={}
for slug in ['cassino-gallery','anzio-gallery','gothic-line-gallery','salerno-gallery','rome-to-bologna-gallery']:
    gal[slug.replace('-gallery','')]=[dict(img(b),cap=tidy_cap(b['cap'])) for b in c[slug]['blocks'] if b['t']=='img']
gal['home']=[dict(img(b),cap=tidy_cap(b['cap'])) for b in c['home-2']['blocks'] if b['t']=='img']
gal['about']=[]
ab=c['about']['blocks']
for k,b in enumerate(ab):
    if b['t']=='img':
        cap=b['cap'] or (strip(ab[k+1]['x']) if k+1<len(ab) and ab[k+1]['t']=='p' else '')
        gal['about'].append({'id':imap[b['src']]['name'],'cap':tidy_cap(cap)})
for s in ['testimonials','faqs','general-reading-list','regiment-core']:
    gal[s]=[dict(img(b),cap=tidy_cap(b['cap'])) for b in c[s]['blocks'] if b['t']=='img']
json.dump(gal,open(f'{out}/galleries.json','w'),indent=1,ensure_ascii=False)
# ---- testimonials: tokenise em (quote) / strong (attrib)
tests=[]
for b in c['testimonials']['blocks']:
    if b['t']!='p': continue
    x=b['x'].replace('<b>','<strong>').replace('</b>','</strong>').replace('<i>','<em>').replace('</i>','</em>')
    toks=re.findall(r'<(em|strong)>(.*?)</\1>|([^<]+)',re.sub(r'<br/?>',' \n ',x))
    # flatten into list of (kind,text) using simple state machine on raw string
    cur_q=[];cur_a=[]
    # use a char-level pass: collect text inside strong as attribution, else quote
    parts=re.split(r'(<strong>.*?</strong>)',x,flags=re.S)
    for part in parts:
        if part.startswith('<strong>'):
            t=strip(part)
            if not t: continue
            # strong may wrap quote text too if it starts with a quote mark
            if re.match(r'^[‘\'“]',t) and len(t)>120: cur_q.append(t); continue
            if cur_q:
                tests.append({'q':' '.join(cur_q),'a':t}); cur_q=[]
            elif tests: tests[-1]['a']+=' '+t
        else:
            for seg in re.split(r'(?:<br/?>\s*){2,}',part):
                t=strip(seg)
                if t and len(t)>2: cur_q.append(t)
    if cur_q: tests.append({'q':' '.join(cur_q),'a':''})
clean=[]
for t in tests:
    q=t['q'].strip().strip('‘’\'"“” ').replace('taken taken','taken')
    a=re.sub(r'\s+([.,])',r'\1',t['a']).strip()
    parts=[p.strip() for p in re.split(r'\.\s+',a,1)] if a else ['','']
    clean.append({'quote':q,'name':parts[0].rstrip('.'),'from':(parts[1] if len(parts)>1 else '').rstrip('.')})
json.dump(clean,open(f'{out}/testimonials.json','w'),indent=1,ensure_ascii=False)
# ---- books
def books(slug):
    res=[]
    for b in c[slug]['blocks']:
        if b['t']!='p' or 'Reading List' in b['x']: continue
        for line in re.split(r'<br/?>',b['x']):
            m=re.match(r'\s*(?:<em>)?(.*?)(?:</em>)(.*)$',line.strip(),re.S)
            if m: title,author=strip(m.group(1)),strip(m.group(2))
            else: title,author=strip(line),''
            author=author.lstrip('.').strip()
            title=title.rstrip('.').strip()
            if title: res.append({'title':title,'author':author})
    return res
json.dump({'general':books('general-reading-list'),'regiments':books('regiment-core')},open(f'{out}/books.json','w'),indent=1,ensure_ascii=False)
print(len(clean),'testimonials')
for t in clean[:3]+clean[-6:]: print(t)
