-- Remove os dados de exemplo que o seed antigo criava no usuário fictício 'system-seed'.
-- Nenhum usuário real enxergava esses registros (os dados são isolados por userId);
-- a partir de agora cada usuário começa vazio e cadastra os próprios dados.
DELETE FROM "preferencias_lancamento" WHERE "userId" = 'system-seed';
DELETE FROM "lancamentos" WHERE "userId" = 'system-seed';
-- Meio de pagamento tem FK RESTRICT em lancamentos: só apaga o que não estiver em uso.
DELETE FROM "payment_methods" p
  WHERE p."userId" = 'system-seed'
    AND NOT EXISTS (SELECT 1 FROM "lancamentos" l WHERE l."meioPagamentoId" = p."id");
DELETE FROM "lojas" WHERE "userId" = 'system-seed';
DELETE FROM "compradores" WHERE "userId" = 'system-seed';
DELETE FROM "categorias_itens" WHERE "userId" = 'system-seed';
DELETE FROM "categorias_lojas" WHERE "userId" = 'system-seed';
