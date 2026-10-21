// Cloudflare Pages Function for Red Carpet B2B inquiries.
// Required secrets: RESEND_API_KEY, RESEND_FROM, TURNSTILE_SECRET_KEY.
// Required public variable: TURNSTILE_SITE_KEY (injected into the page build separately).
const json = (data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});
const trim=(v,max)=>typeof v==="string"?v.trim().slice(0,max):"";
export async function onRequestPost({request,env}){
  if(!env.RESEND_API_KEY||!env.RESEND_FROM||!env.TURNSTILE_SECRET_KEY)return json({error:"Slanje upita trenutačno nije dostupno."},503);
  const origin=request.headers.get("Origin");
  if(origin){try{const host=new URL(origin).hostname;if(host!=="redcarpet.hr"&&host!=="www.redcarpet.hr"&&!host.endsWith(".pages.dev"))return json({error:"Nedopušten izvor."},403)}catch{return json({error:"Neispravan izvor."},403)}}
  if(Number(request.headers.get("content-length")||0)>12000)return json({error:"Zahtjev je prevelik."},413);
  let data;try{const raw=await request.text();if(raw.length>12000)return json({error:"Zahtjev je prevelik."},413);data=JSON.parse(raw)}catch{return json({error:"Neispravan zahtjev."},400)}
  if(!data||typeof data!=="object"||Array.isArray(data))return json({error:"Neispravan zahtjev."},400);
  if(trim(data.website,200))return json({ok:true});
  const fullName=trim(data.fullName,120),company=trim(data.company,160),city=trim(data.city,120),phone=trim(data.phone,40),email=trim(data.email,180),message=trim(data.message,3000),sector=trim(data.sector,180),objectType=trim(data.objectType,100),area=trim(data.area,80),preferredDate=trim(data.preferredDate,120),token=trim(data.turnstileToken,2500);
  if(!fullName||!company||!city||!message||!objectType||!area||!data.gdpr||!token||(!phone&&!email))return json({error:"Popunite obvezna polja."},400);
  if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:"Neispravna e-mail adresa."},400);
  if(phone&&!/^[+\d()\s/-]{6,40}$/.test(phone))return json({error:"Neispravan telefon."},400);
  let verify;
  try{verify=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:token,remoteip:request.headers.get("CF-Connecting-IP")||undefined})}).then(r=>r.json())}catch{return json({error:"Provjera zaštite nije uspjela."},502)}
  if(!verify.success)return json({error:"Sigurnosna provjera nije uspjela. Pokušajte ponovno."},400);
  const expectedHost=new URL(request.url).hostname;
  if(verify.hostname!==expectedHost)return json({error:"Sigurnosna provjera ne odgovara stranici."},403);
  const safe=v=>v.replace(/[<>\r\n]/g," ");
  const textBody=["Novi Red Carpet B2B upit",`Ime: ${fullName}`,`Tvrtka: ${company}`,`Grad: ${city}`,`Telefon: ${phone||"-"}`,`E-mail: ${email||"-"}`,`Usluga: ${sector||"-"}`,`Vrsta objekta: ${objectType}`,`Površina ili broj komada: ${area}`,`Željeni termin: ${preferredDate||"-"}`,"",message].join("\n");
  try{
    const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${env.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:env.RESEND_FROM,to:["redcarpet.hrvatska@gmail.com"],subject:`Red Carpet B2B upit – ${safe(company)}`,text:textBody,...(email?{reply_to:email}:{})})});
    if(!response.ok)return json({error:"Dostava nije uspjela. Kontaktirajte nas izravno e-mailom."},502);
    return json({ok:true});
  }catch{return json({error:"Dostava trenutačno nije dostupna."},502)}
}
export async function onRequestGet(){return json({error:"Metoda nije dopuštena."},405)}
