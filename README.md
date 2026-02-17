# 📱 ZapFlow - App do Cliente (PWA)

Aplicativo Web Progressivo (PWA) de Cardápio Digital para delivery via WhatsApp.
Focado em alta performance, UX moderna (estilo iFood) e arquitetura Serverless.

## 🚀 Funcionalidades

- **Cardápio Digital:** Listagem de produtos por categoria via Supabase.
- **Carrinho Inteligente:** Persistência local, cálculo automático de totais.
- **Opcionais e Adicionais:** Modal para seleção de complementos (Marmitex, Açaí, etc).
- **Checkout WhatsApp:** Envia o pedido formatado diretamente para o WhatsApp da loja.
- **PWA Instalável:** Funciona offline e pode ser instalado na tela inicial (Android/iOS).
- **Multi-Loja:** Identifica a loja e o tema visual automaticamente pelo ID.

## 🛠️ Tecnologias

- **Frontend:** HTML5, CSS3 (TailwindCSS via CDN), JavaScript (ES6 Modules).
- **Backend:** Supabase (PostgreSQL + Realtime).
- **Bibliotecas:** Toastify (Alertas), FontAwesome (Ícones).

## 📂 Estrutura de Arquivos

- `index.html`: Estrutura base (App Shell).
- `app-cliente.js`: Lógica principal, rotas e carrinho.
- `product-modal.js`: Lógica específica da janela de produto/opcionais.
- `styles.css`: Estilização personalizada e temas dinâmicos.
- `service-worker.js`: Cache e funcionalidades Offline.
- `manifest.json`: Configurações de instalação do PWA.

## 🏃‍♂️ Como Rodar Localmente

1. Clone o repositório.
2. Instale a extensão "Live Server" no VS Code.
3. Clique com o botão direito em `index.html` e escolha **"Open with Live Server"**.
   *(Necessário servidor local devido aos Módulos ES6 e Service Worker)*.

## ☁️ Deploy (Vercel)

Este projeto está configurado para Vercel.
O arquivo `vercel.json` garante o roteamento correto para SPA.

---
Desenvolvido com ❤️ por Andre Freitas craidor do ZapFlow 
