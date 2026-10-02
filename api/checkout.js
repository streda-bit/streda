const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { produto } = req.body;

  const produtos = {
    turma: {
      name: 'Aula em Grupo — Arroz, Feijão e Tráfego',
      amount: 75000, // R$750 em centavos
    },
    individual: {
      name: 'Aula Individual — Arroz, Feijão e Tráfego',
      amount: 119000, // R$1.190 em centavos
    },
  };

  const item = produtos[produto];
  if (!item) return res.status(400).json({ error: 'Produto inválido' });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'pix'],
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
    res.status(500).json({ error: err.message });
  }
};
