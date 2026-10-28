import { handleUpdate, handlePreCheckout, sendMessage } from './bot/telegram.js';

// ES Modules formati: export default obyekt qaytarish orqali ishlaydi
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS sozlamalari
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 1. TELEGRAM WEBHOOK
    if (url.pathname === '/fuzz/telegram/webhook' && request.method === 'POST') {
      try {
        const update = await request.json();
        // env ni funksiyalarga uzatamiz (D1 bazasi va Bot tokeni uchun)
        if (update.message) ctx.waitUntil(handleUpdate(update, env));
        else if (update.pre_checkout_query) ctx.waitUntil(handlePreCheckout(update, env));
        return new Response('OK', { status: 200, headers: corsHeaders });
      } catch (err) {
        return new Response('Webhook Error', { status: 500, headers: corsHeaders });
      }
    }

    // 2. API ENDPOINTLAR
    if (url.pathname.startsWith('/fuzz/')) {
      const apiPath = url.pathname.replace('/fuzz', '');
      
      try {
        // A) RO'YXATDAN O'TISHNI BOSHLASH
        if (apiPath === '/auth/register-init' && request.method === 'POST') {
          const body = await request.json();
          const { telegramId } = body;
          
          if (!telegramId) {
            return new Response(JSON.stringify({ error: 'Telegram ID kiritilmadi' }), { 
              status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
          }

          // Botga xabar yuboramiz
          const botResponse = await sendMessage(
            env, telegramId, 
            `👋 Salom! Fuzz saytida ro'yxatdan o'tish uchun quyidagi tugmani bosing.`,
            { inline_keyboard: [[ { text: "✅ Tasdiqlash (App)", web_app: { url: `https://fuzz-tau.vercel.app/register?tgId=${telegramId}` } } ]] }
          );

          if (!botResponse.ok) {
            return new Response(JSON.stringify({ error: `Bot xato: ${botResponse.description || 'Xabar yuborilmadi'}` }), { 
              status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
          }

          return new Response(JSON.stringify({ success: true }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }

        // B) RO'YXATDAN O'TISHNI YAKUNLASH
        if (apiPath === '/auth/register-complete' && request.method === 'POST') {
          const body = await request.json();
          // Hozircha muvaffaqiyatli javob
          return new Response(JSON.stringify({ success: true, message: 'Created' }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }

        // C) PAROLNI TIKLASH UCHUN KOD
        if (apiPath === '/auth/forgot-password' && request.method === 'POST') {
          const body = await request.json();
          const { telegramId } = body;
          const code = Math.floor(10000 + Math.random() * 90000).toString();
          
          await sendMessage(env, telegramId, `🔐 Parolni tiklash kodi: <code>${code}</code>`);
          
          return new Response(JSON.stringify({ success: true }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};