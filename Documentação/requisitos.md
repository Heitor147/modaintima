# Documento de Requisitos — Sistema de Gestão de Moda Íntima

## 1. Visão Geral

Sistema web de uso interno para gestão operacional de uma microempresa de moda íntima feminina. Centraliza o controle de estoque, pedidos, clientes, produção, financeiro e relatórios em uma única plataforma acessível via navegador.

**Tipo de sistema:** Web app (uso interno)  
**Usuários:** Funcionários da empresa (1–3 simultâneos)  
**Controle de acesso:** Login simples com autenticação JWT (perfil único)

---

## 2. Módulos

### 2.1 Estoque

**RF01** — Cadastrar produtos com nome, categoria, cor, tamanho, preço de custo e preço de venda.  
**RF02** — Registrar entradas e saídas de estoque vinculadas a um produto.  
**RF03** — Consultar saldo atual de estoque por produto.  
**RF04** — Emitir alerta quando o estoque de um produto atingir o estoque mínimo configurado.  
**RF05** — Inativar produtos sem excluí-los do histórico.

---

### 2.2 Pedidos / Vendas

**RF06** — Registrar pedidos vinculados a um cliente.  
**RF07** — Adicionar múltiplos itens (produto + quantidade) a um pedido.  
**RF08** — Acompanhar o status do pedido: `Aguardando`, `Em produção`, `Pronto`, `Entregue`, `Cancelado`.  
**RF09** — Registrar forma de pagamento e status de pagamento.  
**RF10** — Cancelar pedido com registro de motivo.

---

### 2.3 Clientes (CRM)

**RF11** — Cadastrar clientes com nome, telefone, e-mail e endereço.  
**RF12** — Consultar histórico de pedidos por cliente.  
**RF13** — Registrar observações sobre o cliente (ex: preferências, restrições).  
**RF14** — Inativar clientes sem excluí-los do histórico.

---

### 2.4 Produção / Costura

**RF15** — Criar ordens de produção vinculadas a pedidos.  
**RF16** — Definir responsável pela produção e prazo estimado de entrega.  
**RF17** — Acompanhar o status da produção: `Pendente`, `Em andamento`, `Concluída`.  
**RF18** — Registrar data de conclusão real da produção.

---

### 2.5 Financeiro

**RF19** — Registrar receitas (geradas automaticamente ao fechar um pedido) e despesas manuais.  
**RF20** — Categorizar despesas (ex: matéria-prima, mão de obra, transporte).  
**RF21** — Consultar saldo do período (receitas − despesas).  
**RF22** — Registrar o status de pagamento de cada transação: `Pendente`, `Pago`, `Atrasado`.

---

### 2.6 Relatórios

**RF23** — Relatório de vendas por período.  
**RF24** — Relatório de produtos mais vendidos.  
**RF25** — Relatório de clientes com maior volume de pedidos.  
**RF26** — Relatório de fluxo de caixa por período.  
**RF27** — Relatório de produção (ordens por status, por responsável).

---

## 3. Requisitos Não Funcionais

**RNF01** — O sistema deve responder a qualquer requisição em menos de 2 segundos em condições normais de uso.  
**RNF02** — Dados sensíveis (senha) devem ser armazenados com hash (bcrypt).  
**RNF03** — A API deve exigir token JWT válido em todas as rotas, exceto login.  
**RNF04** — O sistema deve funcionar em rede local sem dependência de internet.  
**RNF05** — A interface deve ser responsiva e funcional em telas a partir de 1024px.

---

## 4. Regras de Negócio

**RN01** — Um pedido só pode ser criado para um cliente ativo.  
**RN02** — Ao confirmar um pedido, o estoque dos itens é decrementado automaticamente.  
**RN03** — Ao cancelar um pedido, o estoque deve ser restaurado.  
**RN04** — Um pedido com status `Entregue` não pode ser editado.  
**RN05** — Ao fechar um pedido (status `Entregue`), uma receita é gerada automaticamente no financeiro.  
**RN06** — Produtos inativados não aparecem na seleção de novos pedidos.  
**RN07** — Não é permitido excluir produtos, clientes ou pedidos — apenas inativar ou cancelar.

---

## 5. Fora do Escopo

- Integração com loja virtual ou e-commerce
- App mobile
- Múltiplos perfis de acesso
- Emissão de nota fiscal
- Integração com meios de pagamento (ex: PIX automático, cartão)
