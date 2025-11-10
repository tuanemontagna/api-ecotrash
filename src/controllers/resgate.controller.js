import Voucher from "../models/Voucher.model.js";
import Usuario from "../models/Usuario.model.js";
import UsuarioVoucher from "../models/UsuarioVoucher.model.js";
import TransacaoPontos from "../models/TransacaoPontos.model.js";
import { enviarEmailDeNotificacao } from "../utils/sendMail.js";

function gerarCodigo(prefix = "VOUCHER") {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const epoch = Date.now().toString().slice(-6);
  return `${prefix}-${rand}${epoch}`;
}

const resgatar = async (req, res) => {
  try {
    const voucherId = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;
    const usuarioId = req?.usuario?.id;

    if (!usuarioId) {
      return res.status(401).send({ message: 'Não autenticado.' });
    }
    if (!voucherId) {
      return res.status(400).send({ message: 'Informe o ID do voucher.' });
    }

    const [usuario, voucher] = await Promise.all([
      Usuario.findOne({ where: { id: usuarioId } }),
      Voucher.findOne({ where: { id: voucherId } }),
    ]);

    if (!usuario) return res.status(404).send({ message: 'Usuário não encontrado.' });
    if (!voucher) return res.status(404).send({ message: 'Voucher não encontrado.' });

    // Valida disponibilidade e validade
    const custo = Number(voucher.custoPontos || 0);
    const disponivel = voucher.quantidadeDisponivel == null ? true : Number(voucher.quantidadeDisponivel) > 0;
    const validadeOk = !voucher.validade || new Date(voucher.validade) >= new Date();

    if (!disponivel) return res.status(400).send({ message: 'Voucher esgotado.' });
    if (!validadeOk) return res.status(400).send({ message: 'Voucher expirado.' });

    if (usuario.saldoPontos < custo) {
      return res.status(400).send({ message: 'Saldo de pontos insuficiente.' });
    }

    // Gera código único com algumas tentativas
    let codigo = gerarCodigo('ECO');
    for (let i = 0; i < 3; i++) {
      const existe = await UsuarioVoucher.findOne({ where: { codigoVoucherGerado: codigo } });
      if (!existe) break;
      codigo = gerarCodigo('ECO');
    }

    // Transação simples (sem transaction DB, pode ser adicionada depois)
    const usuarioVoucher = await UsuarioVoucher.create({
      pontosGastos: custo,
      codigoVoucherGerado: codigo,
      usuarioId: usuario.id,
      voucherId: voucher.id,
    });

    // Atualiza saldo do usuário e quantidade do voucher
    usuario.saldoPontos = Number(usuario.saldoPontos || 0) - custo;
    await usuario.save();

    if (voucher.quantidadeDisponivel != null) {
      voucher.quantidadeDisponivel = Math.max(0, Number(voucher.quantidadeDisponivel) - 1);
      await voucher.save();
    }

    // Registra transação de pontos
    await TransacaoPontos.create({
      tipoTransacao: 'GASTO_VOUCHER',
      pontos: -custo,
      descricao: `Resgate do voucher ${voucher.titulo}`,
      referenciaId: usuarioVoucher.id,
      usuarioId: usuario.id,
    });

    // Envia email (não bloqueia resposta em caso de falha)
    try {
      const assunto = `Seu código de resgate - ${voucher.titulo}`;
      const corpo = `
        <p>Olá, ${usuario.nome},</p>
        <p>Parabéns! Seu resgate foi concluído com sucesso.</p>
        <p><strong>Voucher:</strong> ${voucher.titulo}</p>
        <p><strong>Código:</strong> <code>${codigo}</code></p>
        ${voucher.validade ? `<p><strong>Validade:</strong> ${new Date(voucher.validade).toLocaleDateString('pt-BR')}</p>` : ''}
        <p style="margin-top: 12px;">Guarde este código com segurança. Em caso de dúvidas, responda este e-mail.</p>
      `;
      await enviarEmailDeNotificacao(usuario.email, usuario.nome, assunto, corpo);
    } catch (e) {
      console.warn('Falha ao enviar e-mail de resgate:', e?.message);
    }

    return res.status(201).send({
      message: 'Resgate realizado com sucesso.',
      data: {
        usuarioVoucher,
        saldoPontosAtual: usuario.saldoPontos,
        voucher,
      },
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export default { resgatar };
