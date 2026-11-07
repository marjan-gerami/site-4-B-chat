// Vercel serverless function. Configure OPENAI_API_KEY in Vercel environment settings.
const facts = [
  ['Vita A1',4400000,true,true,7],['Vita B2',3900000,true,false,6],
  ['Vita C3',5800000,true,true,8],['Vita D4',4100000,true,true,3],
  ['Vita E5',4600000,true,false,9],['Vita F6',4200000,true,true,4]
];
const instruction = `تو دستیار فارسی فروشگاه آزمایشی ساعت هوشمند ویتا هستی. فقط درباره محصولات و اطلاعات قطعی زیر پاسخ بده. اطلاعات نامعلوم، تخفیف، موجودی، زمان ارسال، گارانتی و ویژگی‌های دیگر را حدس نزن. اگر کاربر معیارهای خرید خود را بیان کرد، می‌توانی محصولات را بر اساس آن معیارها مقایسه کنی؛ هرگز به پژوهش، گروه آزمایشی یا «پاسخ درست» اشاره نکن. پاسخ‌ها کوتاه، دقیق و محترمانه باشند. خرید و پرداخت واقعی وجود ندارد. اطلاعات محصولات (نام، قیمت تومان، ضربان قلب، اکسیژن خون، شارژدهی روز): ${JSON.stringify(facts)}.`;
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'دستیار هنوز پیکربندی نشده است.'});
  const {messages}=req.body||{};
  if(!Array.isArray(messages)||messages.length>24)return res.status(400).json({error:'درخواست نامعتبر است.'});
  const clean=messages.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string').slice(-12).map(m=>({role:m.role,content:m.content.slice(0,1500)}));
  if(!clean.length||clean[clean.length-1].role!=='user')return res.status(400).json({error:'پیام کاربر لازم است.'});
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
  try{
    const response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4o-mini',temperature:0.2,max_tokens:350,messages:[{role:'system',content:instruction},...clean]}),signal:controller.signal});
    if(!response.ok)return res.status(502).json({error:'ارتباط با دستیار برقرار نشد.'});
    const data=await response.json();
    return res.status(200).json({reply:data?.choices?.[0]?.message?.content||'پاسخی دریافت نشد.'});
  }catch{return res.status(504).json({error:'پاسخ دستیار بیش از حد طول کشید. دوباره تلاش کنید.'});}
  finally{clearTimeout(timeout)}
}
