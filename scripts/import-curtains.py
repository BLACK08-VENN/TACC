"""Import TACC's public curtain category. No fabricated prices, units or photographs."""
import json,re,html,pathlib,urllib.request,argparse
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
  src=photo.get('src','');sizes={int(w):u for u,w in re.findall(r'(https?://[^, ]+)\s+(\d+)w',photo.get('srcset',''))};thumb=sizes.get(300,photo.get('thumbnail',src));surface=sizes.get(768,src)
  try:width=float(p.get('dimensions',{}).get('width') or 0) or None
  except ValueError:width=None
  if not width:
   match=re.search(r'(\d+(?:\.\d+)?)\s*cm\b',name,re.I);width=float(match[1]) if match else None
  result.append(dict(id='curtain-'+str(p['id']),sourceId=p['id'],name=name,price=float(amount)/(10**minor) if amount not in ['',None] and price['currency_code']=='KES' else None,width=width,uses=['curtain'],color='#ffffff',kind='linen',perMetre=False,ref=' · '.join(filter(None,[attrs.get('TACC Item Ref'),attrs.get('TACC Colour Ref')])) or p.get('sku',''),url=p['permalink'],image=proxy(src),thumbnail=proxy(thumb),texture=proxy(surface),patterned='Patterned Fabrics' in groups,sourceImage=src,textureAspect=1,repeat=2,checked=True,checkedDate='15 October 2026',groups=groups or ['Curtain Fabrics'],inStock=p.get('is_in_stock'),photoAvailable=bool(src),imported=True))
 return result
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--source',type=pathlib.Path);args=parser.parse_args()
 if args.source:products=json.loads(args.source.read_text())
 else:
  products=[];page=1
  while True:
   with urllib.request.urlopen(f'https://tacc.co.ke/wp-json/wc/store/v1/products?category=9113&per_page=100&page={page}',timeout=60) as response:batch=json.load(response)
   products+=batch
   if len(batch)<100:break
   page+=1
 assert len({p['id'] for p in products})==len(products)
 data=convert(products)
 (ROOT/'assets/curtains/imported-catalog.js').write_text('// TACC category 9113; snapshot 15 October 2026. Listed price is not a verified per-metre rate.\nexport const importedCurtainData='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
 print(f'Imported {len(data)} products; {sum(bool(p["image"]) for p in data)} photos.')
