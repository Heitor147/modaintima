# Documento de Requisitos — Sistema de Gestão de Moda Íntima

> **Status:** Documento de requisitos funcionais e não-funcionais  
**Última atualização:** 2026-05-28  
> **Versão:** 1.0

## 1. Visão Geral

Sistema web de uso interno para gestão operacional de uma microempresa de moda íntima feminina. Centraliza o controle de estoque, pedidos, clientes, produção, financeiro e relatórios em uma única plataforma acessível via navegador.

**Tipo de sistema:** Web app (uso interno)  
**Usuários:** Funcionários da empresa (1–3 simultâneos)  
**Controle de acesso:** Login simples com autenticação JWT (perfil único)  
**Escopo de implementação:** Vide [Documentação Técnica](documentacao-tecnica.md#3-estado-atual-da-implementação-maio2026) para status de cada módulo

---

## 2. Requisitos Funcionais por Módulo

### 2.1 Autenticação ✅ **IMPLEMENTADO**

**RF00.1** — Registrar novo usuário com email e senha.  
**RF00.2** — Fazer login com email e senha, receber JWT de 24h.  
**RF00.3** — Acessar dados do usuário autenticado via `/auth/me`.  
**RF00.4** — Fazer logout (token invalidado no frontend).  

**Status:** ✅ Todos os RF implementados e funcionais

---

**Observação:** O módulo de `produtos` possui CRUD básico implementado no backend (`GET /produtos`, `GET /produtos/:id`, `POST /produtos`, `PUT /produtos/:id`, `DELETE /produtos/:id` que realiza inativação). Com isso, parte dos requisitos relacionados a produtos estão implementados: **RF01 (Cadastro de produtos)** e **RF05 (Inativação de produtos)**. Requisitos de controle de estoque (RF02–RF04) permanecem planejados.


### 2.2 Estoque ⏳ **PLANEJADO**

**RF01** — Cadastrar produtos com nome, categoria, cor, tamanho, preço de custo e preço de venda.  
**RF02** — Registrar entradas e saídas de estoque vinculadas a um produto.  
**RF03** — Consultar saldo atual de estoque por produto.  
**RF04** — Emitir alerta quando o estoque de um produto atingir o estoque mínimo configurado.  
**RF05** — Inativar produtos sem excluí-los do histórico.

**Prioridade:** Alta  
**Estimativa:** ~5 dias  
**Status:** ⏳ Não iniciado

---

### 2.3 Pedidos / Vendas ⏳ **PLANEJADO**

**RF06** — Registrar pedidos vinculados a um cliente.  
**RF07** — Adicionar múltiplos itens (produto + quantidade) a um pedido.  
**RF08** — Acompanhar o status do pedido: `Aguardando`, `Em produção`, `Pronto`, `Entregue`, `Cancelado`.  
**RF09** — Registrar forma de pagamento e status de pagamento.  
**RF10** — Cancelar pedido com registro de motivo.

**Prioridade:** Alta  
**Estimativa:** ~8 dias  
**Status:** ⏳ Não iniciado

---

### 2.4 Clientes (CRM) ⏳ **PLANEJADO**

**RF11** — Cadastrar clientes com nome, telefone, e-mail e endereço.  
**RF12** — Consultar histórico de pedidos por cliente.  
**RF13** — Registrar observações sobre o cliente (ex: preferências, restrições).  
**RF14** — Inativar clientes sem excluí-los do histórico.

**Prioridade:** Alta  
**Estimativa:** ~3 dias  
**Status:** ⏳ Não iniciado

---

### 2.5 Produção / Costura ⏳ **PLANEJADO**

**RF15** — Criar ordens de produção vinculadas a pedidos.  
**RF16** — Definir responsável pela produção e prazo estimado de entrega.  
**RF17** — Acompanhar o status da produção: `Pendente`, `Em andamento`, `Concluída`.  
**RF18** — Registrar data de conclusão real da produção.

**Prioridade:** Alta  
**Estimativa:** ~5 dias  
**Status:** ⏳ Não iniciado

---

## 3. Requisitos Funcionais Adicionais

### 3.1 Financeiro ⏳ **PLANEJADO**

**RF19** — Registrar receitas (geradas automaticamente ao fechar um pedido) e despesas manuais.  
**RF20** — Categorizar despesas (ex: matéria-prima, mão de obra, transporte).  
**RF21** — Consultar saldo do período (receitas − despesas).  
**RF22** — Registrar o status de pagamento de cada transação: `Pendente`, `Pago`, `Atrasado`.

**Prioridade:** Média  
**Estimativa:** ~5 dias  
**Status:** ⏳ Não iniciado

---

### 3.2 Relatórios ⏳ **PLANEJADO**

**RF23** — Relatório de vendas por período.  
**RF24** — Relatório de produtos mais vendidos.  
**RF25** — Relatório de clientes com maior volume de pedidos.  
**RF26** — Relatório de fluxo de caixa por período.  
**RF27** — Relatório de produção (ordens por status, por responsável).

**Prioridade:** Média  
**Estimativa:** ~5 dias  
**Status:** ⏳ Não iniciado

---

## 4. Requisitos Não-Funcionais

**RNF01** — O sistema deve responder a qualquer requisição em menos de 2 segundos em condições normais de uso.  
**RNF02** — Dados sensíveis (senha) devem ser armazenados com hash bcryptjs (salt factor 10).  
**RNF03** — A API deve exigir token JWT válido em todas as rotas, exceto `/auth/login` e `/auth/register`.  
**RNF04** — O sistema deve funcionar em rede local sem dependência de internet.  
**RNF05** — A interface deve ser responsiva e funcional em telas a partir de 1024px.  
**RNF06** — Logs de todas as operações críticas (registro de pedido, alteração de estoque, etc.) devem ser registrados.  
**RNF07** — Backup automático do banco de dados deve ser realizado diariamente.

---

## 5. Regras de Negócio

**RN01** — Um pedido só pode ser criado para um cliente ativo.  
**RN02** — Ao confirmar um pedido, o estoque dos itens é decrementado automaticamente.  
**RN03** — Ao cancelar um pedido, o estoque deve ser restaurado.  
**RN04** — Um pedido com status `Entregue` não pode ser editado.  
**RN05** — Ao fechar um pedido (status `Entregue`), uma receita é gerada automaticamente no financeiro.  
**RN06** — Produtos inativados não aparecem na seleção de novos pedidos.  
**RN07** — Não é permitido excluir produtos, clientes ou pedidos — apenas inativar ou cancelar.  
**RN08** — Uma ordem de produção só pode ser criada para um pedido em status `Aguardando`.  
**RN09** — Apenas usuários com perfil `admin` podem criar outros usuários.  
**RN10** — O responsável por uma ordem de produção pode ser alterado, mas o histórico de mudanças deve ser mantido.

---

## 6. Fora do Escopo

- Integração com loja virtual ou e-commerce
- App mobile
- Múltiplos perfis de acesso (futuramente)
- Emissão de nota fiscal
- Integração com meios de pagamento (ex: PIX automático, cartão)
- Sincronização com redes sociais ou marketplaces
- Sistema de CRM avançado (futuramente)

---

## 7. Roadmap de Desenvolvimento

| Fase | Módulo        | RF Implementados | Estimativa | Status   |
|------|---------------|------------------|------------|----------|
| 1    | Auth          | RF00.1–RF00.4    | ✅ Completo | ✅ Done  |
| 2    | Produtos      | RF01, RF05 implementados; RF02–RF04 planejados | ~5 dias    | ⏳ Parcial |
| 3    | Estoque       | RF01–RF05        | ~5 dias    | ⏳ To-do |
| 4    | Clientes      | RF11–RF14        | ~3 dias    | ⏳ To-do |
| 5    | Pedidos       | RF06–RF10        | ~8 dias    | ⏳ To-do |
| 6    | Produção      | RF15–RF18        | ~5 dias    | ⏳ To-do |
| 7    | Financeiro    | RF19–RF22        | ~5 dias    | ⏳ To-do |
| 8    | Relatórios    | RF23–RF27        | ~5 dias    | ⏳ To-do |
| 9    | Frontend      | Todas as páginas | ~20 dias   | ⏳ To-do |
| 10   | Testes        | Testes E2E       | ~5 dias    | ⏳ To-do |

**Tempo total estimado:** ~65 dias de desenvolvimento (assumindo 1 dev em tempo integral)

---

## 8. Critérios de Aceitação

Uma funcionalidade é considerada **pronta para produção** quando:

1. ✅ Todos os RF relacionados estão implementados e testados
2. ✅ Todos os RNF relacionados são atendidos
3. ✅ Testes unitários com cobertura ≥ 80%
4. ✅ Testes de integração passando
5. ✅ Documentação atualizada
6. ✅ Code review aprovado
7. ✅ Validação funcional com stakeholder

---

**Responsável:** Heitor Henrique Sampaio Chagas  
**Data de criação:** 2026-05-12  
**Última revisão:** 2026-05-13
