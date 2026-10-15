"""Import TACC's public curtain category. No fabricated prices, units or photographs."""
import json,re,html,pathlib,urllib.request,argparse,subprocess,io,concurrent.futures,tarfile
ROOT=pathlib.Path(__file__).resolve().parents[1]
def convert(products):
 result=[]
 for p in products:
  clean=lambda s:html.unescape(re.sub('<[^>]*>',' ',s or '')).strip()
  name=clean(p['name']);desc=clean(p.get('description','')+' '+p.get('short_description',''))
  price=p['prices'];amount=price.get('price');minor=price.get('currency_minor_unit',0)
  attrs={a['name']:' / '.join(clean(t['name']) for t in a['terms']) for a in p.get('attributes',[])}
  groups=[clean(c['name']) for c in p.get('categories',[])]
  images=p.get('images',[]);photo=images[0] if images else {}
  def proxy(url):
   prefix='https://tacc.co.ke/wp-content/uploads/'
   return '/tacc-media/'+url[len(prefix):] if url.startswith(prefix) else url
  local='assets/curtains/catalog/'+str(p['id'])+'.webp';src=photo.get('src','');sizes={int(w):u for u,w in re.findall(r'(https?://[^, ]+)\s+(\d+)w',photo.get('srcset',''))};thumb=sizes.get(300,photo.get('thumbnail',src));surface=sizes.get(768,src)
  try:width=float(p.get('dimensions',{}).get('width') or 0) or None
  except ValueError:width=None
  if not width:
   match=re.search(r'(\d+(?:\.\d+)?)\s*cm\b',name,re.I);width=float(match[1]) if match else None
  result.append(dict(id='curtain-'+str(p['id']),sourceId=p['id'],name=name,price=float(amount)/(10**minor) if amount not in ['',None] and price['currency_code']=='KES' else None,width=width,uses=['curtain'],color='#ffffff',kind='linen',perMetre=False,ref=' · '.join(filter(None,[attrs.get('TACC Item Ref'),attrs.get('TACC Colour Ref')])) or p.get('sku',''),url=p['permalink'],image=local if src else '',thumbnail=local if src else '',texture=local if src else '',patterned='Patterned Fabrics' in groups,sourceImage=src,textureAspect=1,repeat=2,checked=True,checkedDate='15 October 2026',groups=groups or ['Curtain Fabrics'],inStock=p.get('is_in_stock'),photoAvailable=bool(src),imported=True))
 return result
def cache_and_pack(products):
 from PIL import Image,ImageOps
 folder=ROOT/'assets/curtains/catalog';folder.mkdir(parents=True,exist_ok=True)
 def download(p):
  dst=folder/f'{p["id"]}.webp'
  if dst.exists() or not p['images']:return
  last=None
  for url in dict.fromkeys([p['images'][0].get('thumbnail'),p['images'][0]['src']]):
   if not url:continue
   try:
    data=subprocess.check_output(['curl','-fsSL','--retry','2','--max-time','60',url])
    image=ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert('RGB');image.thumbnail((700,700),Image.Resampling.LANCZOS);image.save(dst,'WEBP',quality=88,method=4);return
   except Exception as error:last=error
  raise RuntimeError(f'Photo {p["id"]} failed') from last
 with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:list(pool.map(download,products))
 packs=ROOT/'assets/curtains/catalog-packs';packs.mkdir(exist_ok=True)
 for old in packs.glob('photos-*.tar'):old.unlink()
 batches=[];batch=[];size=0
 for p in sorted(folder.glob('*.webp')):
  if size+p.stat().st_size>8*1024*1024 and batch:batches.append(batch);batch=[];size=0
  batch.append(p);size+=p.stat().st_size
 if batch:batches.append(batch)
 for n,files in enumerate(batches):
  with tarfile.open(packs/f'photos-{n:02}.tar','w') as archive:
   for p in files:archive.add(p,arcname=p.name)

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--source',type=pathlib.Path);parser.add_argument('--download',action='store_true');args=parser.parse_args()
 if args.source:products=json.loads(args.source.read_text())
 else:
  products=[];page=1
  while True:
   with urllib.request.urlopen(f'https://tacc.co.ke/wp-json/wc/store/v1/products?category=9113&per_page=100&page={page}',timeout=60) as response:batch=json.load(response)
   products+=batch
   if len(batch)<100:break
   page+=1
 assert len({p['id'] for p in products})==len(products)
 if args.download:cache_and_pack(products)
 data=convert(products)
 (ROOT/'assets/curtains/imported-catalog.js').write_text('// TACC category 9113; snapshot 15 October 2026. Listed price is not a verified per-metre rate.\nexport const importedCurtainData='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
 print(f'Imported {len(data)} products; {sum(bool(p["image"]) for p in data)} photos.')
