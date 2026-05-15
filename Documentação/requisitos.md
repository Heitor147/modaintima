# Documento de Requisitos — Sistema de Gestão de Moda Íntima

> **Status:** Documento de requisitos funcionais e não-funcionais  
> **Última atualização:** 2026-05-15  
> **Versão:** 1.0

## 1. Visão Geral

Sistema web de uso interno para gestão operacional de uma microempresa de moda íntima feminina. No estado atual, o backend já cobre autenticação, catálogo de produtos e health check do banco; os demais módulos seguem em planejamento.

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

### 2.2 Produtos ✅ **IMPLEMENTADO**

**RF01** — Cadastrar novo produto com nome, categoria, cor, tamanho, preço de custo, preço de venda, preço unitário e estoque mínimo.  
**RF02** — Listar produtos cadastrados.  
**RF03** — Consultar produto por ID.  
**RF04** — Atualizar dados do produto.  
**RF05** — Inativar produto sem exclusão física.

**Prioridade:** Alta  
**Estimativa:** Concluído  
**Status:** ✅ CRUD de catálogo e soft delete implementados

---

### 2.3 Estoque ⏳ **PLANEJADO**

**RF06** — Registrar entradas e saídas de estoque vinculadas a um produto.  
**RF07** — Consultar saldo atual de estoque por produto.  
**RF08** — Emitir alerta quando o estoque de um produto atingir o estoque mínimo configurado.  
**RF09** — Registrar histórico de movimentações de estoque.  
**RF10** — Ajustar inventário manualmente.

**Prioridade:** Alta  
**Estimativa:** ~5 dias  
**Status:** ⏳ Não iniciado

---

### 2.4 Pedidos / Vendas ⏳ **PLANEJADO**

**RF11** — Registrar pedidos vinculados a um cliente.  
**RF12** — Adicionar múltiplos itens (produto + quantidade) a um pedido.  
**RF13** — Acompanhar o status do pedido: `Aguardando`, `Em produção`, `Pronto`, `Entregue`, `Cancelado`.  
**RF14** — Registrar forma de pagamento e status de pagamento.  
**RF15** — Cancelar pedido com registro de motivo.

**Prioridade:** Alta  
**Estimativa:** ~8 dias  
**Status:** ⏳ Não iniciado

---

### 2.5 Clientes (CRM) ⏳ **PLANEJADO**

**RF16** — Cadastrar clientes com nome, telefone, e-mail e endereço.  
**RF17** — Consultar histórico de pedidos por cliente.  
**RF18** — Registrar observações sobre o cliente (ex: preferências, restrições).  
**RF19** — Inativar clientes sem excluí-los do histórico.

**Prioridade:** Alta  
**Estimativa:** ~3 dias  
**Status:** ⏳ Não iniciado

---

### 2.6 Produção / Costura ⏳ **PLANEJADO**

**RF20** — Criar ordens de produção vinculadas a pedidos.  
**RF21** — Definir responsável pela produção e prazo estimado de entrega.  
**RF22** — Acompanhar o status da produção: `Pendente`, `Em andamento`, `Concluída`.  
**RF23** — Registrar data de conclusão real da produção.

**Prioridade:** Alta  
**Estimativa:** ~5 dias  
**Status:** ⏳ Não iniciado

---

## 3. Requisitos Funcionais Adicionais

### 3.1 Financeiro ⏳ **PLANEJADO**

**RF24** — Registrar receitas (geradas automaticamente ao fechar um pedido) e despesas manuais.  
**RF25** — Categorizar despesas (ex: matéria-prima, mão de obra, transporte).  
**RF26** — Consultar saldo do período (receitas − despesas).  
**RF27** — Registrar o status de pagamento de cada transação: `Pendente`, `Pago`, `Atrasado`.

**Prioridade:** Média  
**Estimativa:** ~5 dias  
**Status:** ⏳ Não iniciado

---

### 3.2 Relatórios ⏳ **PLANEJADO**

**RF28** — Relatório de vendas por período.  
**RF29** — Relatório de produtos mais vendidos.  
**RF30** — Relatório de clientes com maior volume de pedidos.  
**RF31** — Relatório de fluxo de caixa por período.  
**RF32** — Relatório de produção (ordens por status, por responsável).

**Prioridade:** Média  
**Estimativa:** ~5 dias  
**Status:** ⏳ Não iniciado

---

## 4. Requisitos Não-Funcionais

**RNF01** — O sistema deve responder a qualquer requisição em menos de 2 segundos em condições normais de uso.  
**RNF02** — Dados sensíveis (senha) devem ser armazenados com hash bcryptjs (salt factor 10).  
**RNF03** — A API deve exigir token JWT válido nas rotas protegidas (`/auth/me`, `/auth/logout`, `POST/PUT/DELETE /produtos`).  
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
**RN09** — Não há controle de perfil `admin` implementado no backend atual; novos usuários podem ser cadastrados via `/auth/register`.  
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
| 2    | Produtos      | RF01–RF05        | ✅ Completo | ✅ Done  |
| 3    | Estoque       | RF06–RF10        | ~5 dias    | ⏳ To-do |
| 4    | Clientes      | RF16–RF19        | ~3 dias    | ⏳ To-do |
| 5    | Pedidos       | RF11–RF15        | ~8 dias    | ⏳ To-do |
| 6    | Produção      | RF20–RF23        | ~5 dias    | ⏳ To-do |
| 7    | Financeiro    | RF24–RF27        | ~5 dias    | ⏳ To-do |
| 8    | Relatórios    | RF28–RF32        | ~5 dias    | ⏳ To-do |
| 9    | Frontend      | Sem scaffold     | ~20 dias   | ⏳ To-do |
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
**Última revisão:** 2026-05-15
