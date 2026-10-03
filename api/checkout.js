const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { produto, metodo } = req.body;

  const precos = {
    turma: {
      pix:    { amount: 79000,  name: 'Aula em Grupo — Arroz, Feijão e Tráfego (Pix)' },
      cartao: { amount: 98700,  name: 'Aula em Grupo — Arroz, Feijão e Tráfego (Cartão)' },
    },
    individual: {
      pix:    { amount: 129000, name: 'Aula Individual — Arroz, Feijão e Tráfego (Pix)' },
      cartao: { amount: 148700, name: 'Aula Individual — Arroz, Feijão e Tráfego (Cartão)' },
    },
  };

  const item = precos[produto]?.[metodo];
  if (!item) return res.status(400).json({ error: 'Produto ou método inválido' });

  const payment_method_types = metodo === 'pix' ? ['pix'] : ['card'];

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types,
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: { name: item.name },
          unit_amount: item.amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://streda.vercel.app/obrigado',
      cancel_url: 'https://streda.vercel.app',
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message, err.type, err.code);
    res.status(500).json({ error: err.message });
  }
};
