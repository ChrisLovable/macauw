"""Create a fully offline self-contained HTML version from the Vercel project."""
from pathlib import Path
import base64
p=Path(__file__).resolve().parent
assets=p/'assets'
def uri(path,mime):
    return 'data:'+mime+';base64,'+base64.b64encode((assets/path).read_bytes()).decode('ascii')
logo=uri('macauw-club.png','image/png')
emblem=uri('beretta-emblem.png','image/png')
background=uri('range.jpg','image/jpeg')
wetland=uri('wetland.jpg','image/jpeg')
veld=uri('veld-static.jpg','image/jpeg')
koedoe=veld
biltong=uri('biltong-flash.webp','image/webp')
icon=uri('icon-192.png','image/png')
shotgun=uri('shotgun-report.wav','audio/wav')
mallard_atlas=uri('bird-mallard-wingbeat.webp','image/webp')
goose_atlas=uri('bird-goose-wingbeat.webp','image/webp')
pigeon_atlas=uri('bird-rotsduif-exact-20frames.png','image/png')
hare_atlas=uri('hare-running-8frame.webp','image/webp')
kudu_mp4=uri('kudu-original-source.mp4','video/mp4')
html=(p/'index.html').read_text(encoding='utf-8')
css=(p/'style.css').read_text(encoding='utf-8')
js=(p/'game.js').read_text(encoding='utf-8')
css=css.replace("url('/assets/range.jpg')", "url('"+background+"')")
css=css.replace("url('/assets/wetland.jpg')", "url('"+wetland+"')")
css=css.replace("url('/assets/veld-static.jpg')", "url('"+veld+"')")
css=css.replace("url('/assets/koedoe-static.jpg')", "url('"+koedoe+"')")
js=js.replace("bg.src='/assets/range.jpg';", "bg.src='"+background+"';")
js=js.replace("wetlandBg.src='/assets/wetland.jpg';", "wetlandBg.src='"+wetland+"';")
js=js.replace("veldBg.src='/assets/veld-static.jpg';", "veldBg.src='"+veld+"';")
js=js.replace("biltongImage.src='/assets/biltong-flash.webp';", "biltongImage.src='"+biltong+"';")
js=js.replace("kuduVideo.src='/assets/kudu-original-source.mp4';", "kuduVideo.src='"+kudu_mp4+"';")
js=js.replace("new Audio('/assets/shotgun-report.wav')", "new Audio('"+shotgun+"')")
for old,new in [('bird-mallard-wingbeat.webp',mallard_atlas),('bird-goose-wingbeat.webp',goose_atlas),('bird-rotsduif-exact-20frames.png',pigeon_atlas),('hare-running-8frame.webp',hare_atlas),]:
    js=js.replace("'/assets/"+old+"'","'"+new+"'")
js=js.replace("if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost')){", "if(false && 'serviceWorker' in navigator){")
html=html.replace('<link rel="stylesheet" href="/style.css">','<style>'+css+'</style>')
html=html.replace('<script src="/game.js" defer></script>','<script>'+js+'</script>')
for path,data in [('macauw-club.png',logo),('beretta-emblem.png',emblem)]:
    html=html.replace('src="/assets/'+path+'"','src="'+data+'"')
html=html.replace('href="/assets/icon-192.png"','href="'+icon+'"')
html=html.replace('<link rel="manifest" href="/manifest.webmanifest">','')
html=html.replace('<meta property="og:image" content="/assets/icon-512.png">','')
output=p.parent/'Macauw-V20-Oorspronklike-Rotsduif-Speel-Nou.html'
output.write_text(html,encoding='utf-8')
print('Saved',output,output.stat().st_size,'bytes')
