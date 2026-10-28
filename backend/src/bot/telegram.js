export async function sendMessage(env, chatId, text, keyboard = null) {
  try {
    const url = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;
    const body = { chat_id: chatId, text, parse_mode: 'HTML' };
    if (keyboard) body.reply_markup = keyboard;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    return await res.json();
  } catch (error) {
    return { ok: false, description: "Telegram bilan aloqa xatosi" };
  }
}

export async function handleUpdate(update, env) {
  if (!update.message) return;
  const message = update.message;
  const chatId = message.chat.id;
  const text = message.text || '';
  const firstName = message.from?.first_name || 'Foydalanuvchi';

  if (text === '/start') {
    await sendMessage(env, chatId, `👋 Salom, <b>${firstName}</b>!\n\nFuzz botiga xush kelibsiz.\nSizning ID ingiz: <code>${chatId}</code>`);
    return;
  }
  await sendMessage(env, chatId, `Iltimos, saytdan foydalaning.`);
}

export async function handlePreCheckout(update, env) {
  const queryId = update.pre_checkout_query.id;
  await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/answerPreCheckoutQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pre_checkout_query_id: queryId, ok: true })
  });
}