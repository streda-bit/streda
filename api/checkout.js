const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { produto } = req.body;

  const precos = {
    turma: {
      pix:    79000,
      cartao: 98700,
      name: 'Aula em Grupo — Arroz, Feijão e Tráfego',
    },
    individual: {
      pix:    129000,
      cartao: 148700,
      name: 'Aula Individual — Arroz, Feijão e Tráfego',
    },
  };

  const item = precos[produto];
  if (!item) return res.status(400).json({ error: 'Produto inválido' });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'pix'],
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.name,
            description: 'Pix: R$' + (item.pix/100).toLocaleString('pt-BR') + ' · Cartão: R$' + (item.cartao/100).toLocaleString('pt-BR'),
          },
          unit_amount: item.pix,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://streda.vercel.app/obrigado',
      cancel_url: 'https://streda.vercel.app',
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
