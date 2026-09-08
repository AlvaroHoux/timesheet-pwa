<p align="center">
  <img src="https://gestao.grupocomber.cloud/assets/37306980-8946-4c5d-a97f-cd2cdfdbfe9e" alt="Grupo Comber Logo" width="300" />
</p>

<h1 align="center">Comber Vue Template</h1>

<p align="center">
  🔒 <strong>Repositório Privado & Uso Exclusivo Interno</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue_3-Composition_API-4FC08D?logo=vuedotjs&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/TypeScript-5.5+-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/comber--auth-v2-blue?logo=auth0&logoColor=white" alt="comber-auth" />
  <img src="https://img.shields.io/badge/Vue_Router-4.x-4FC08D?logo=vuerouter&logoColor=white" alt="Vue Router" />
  <img src="https://img.shields.io/badge/Security-HttpOnly%20%2B%20Directus%20RBAC-success" alt="Security" />
</p>

---

## 📌 Para que serve o projeto?

O **`comber-vue-template`** é o repositório base e padronizado para o desenvolvimento de novas aplicações e portais internos do **Grupo Comber**. Ele fornece um boilerplate moderno, altamente performático e seguro, pré-integrado ao ecossistema corporativo.

Construído com **Vue 3 (Composition API)**, **Tailwind CSS v4**, **TypeScript** e **Vite**, o template já vem configurado com o SDK corporativo [`comber-auth`](https://github.com/Grupo-Comber/comber-auth), suporte nativo a temas Claro/Escuro e guardas de rota automatizadas.

### Principais Características
* 🔐 **Autenticação Corporativa Integrada (`comber-auth`)**: Comunicação segura com o **Directus** via cookies `HttpOnly`, gerenciamento de permissões (RBAC) e informações de sessão do usuário.
* 🔀 **Roteamento Protegido com Vue Router 4**: Estrutura pronta com guardas de navegação (`meta: { requiresAuth: true }`) e redirecionamento automático para o portal de login.
* 🎨 **Design System & Tailwind CSS v4**: Configuração CSS-first com `@theme`, suporte imediato a Dark/Light Mode com persistência em `localStorage` e paleta de cores corporativa.
* 🧩 **Componentes e Composables Reutilizáveis**:
  * `useAuth()`: Composable para acesso reativo a dados do usuário logado, cargo/role e métodos de logout.
  * `useTheme()`: Composable para alternância e sincronização de temas.
  * `UserBadge.vue`: Dropdown completo de perfil do usuário com visualização de versão e ação de logout.
  * `ChangeTheme.vue`: Botão acessível para alternar entre tema claro e escuro.
  * `BackButton.vue`: Botão flutuante padronizado de retorno à tela inicial.
* ⚡ **Performance e DX de Última Geração**: Inicialização e Hot Module Replacement (HMR) instantâneos com **Vite 8** e verificação estrita de tipos com **TypeScript**.
* 💎 **Biblioteca de Ícones Integrada**: Suporte nativo ao **Material Icons** pronto para uso em qualquer componente.

---

## ⚙️ Variáveis de Ambiente (`.env`)

Copie o arquivo de exemplo para criar a sua configuração local:

```bash
cp .env.example .env
```

> [!IMPORTANT]
> **Autenticação em Desenvolvimento Local:**
> O portal de login em produção (`https://login.grupocomber.cloud`) bloqueia redirecionamentos para `localhost` por políticas estritas de segurança (prevenção de Open Redirect e vazamento de sessão).
> Portanto, no ambiente local, **não** utilize a URL de produção na variável `VITE_LOGIN_URL`. É necessário clonar e executar o [`comber-login`](https://github.com/Grupo-Comber/comber-login) localmente na sua máquina e apontar para a porta correspondente (ex: `http://localhost:5174`).

| Variável | Descrição | Exemplo Padrão (Local / Prod) |
|:---|:---|:---|
| `VITE_DIRECTUS_URL` | URL base da instância principal do Directus | `https://gestao.grupocomber.cloud` |
| `VITE_AUTH_URL` | Endpoint do Webhook de Autenticação | `https://automa.grupocomber.cloud/webhook/auth` |
| `VITE_LOGIN_URL` | URL do Portal Central de Login (SSO). Em dev, requer `comber-login` local | `http://localhost:5174` *(dev)*<br>`https://login.grupocomber.cloud` *(prod)* |
| `VITE_APP_VERSION` | Versão da aplicação exibida nos componentes (opcional, fallback para `package.json`) | `1.0.0` |

---

## 🚀 Desenvolvimento Local

### 1. Pré-requisito: Executar o `comber-login` Localmente
Para testar os fluxos de login e redirecionamento no ambiente de desenvolvimento:
1. Clone e inicie o repositório [`comber-login`](https://github.com/Grupo-Comber/comber-login):
   ```bash
   git clone https://github.com/Grupo-Comber/comber-login.git
   cd comber-login
   npm install
   npm run dev
   ```
2. Configure o seu `.env` neste template para apontar `VITE_LOGIN_URL` para o endereço do login local (ex: `http://localhost:5174`).

### 2. Instalação de Dependências
```bash
npm install
```

### 3. Executar em Modo de Desenvolvimento
Inicia o servidor de desenvolvimento com hot reload:
```bash
npm run dev
```

### 4. Validação de Tipos (TypeScript)
Executa a checagem estática de tipos sem emitir arquivos:
```bash
npm run typecheck
```

### 5. Build de Produção
Gera o bundle estático otimizado e minificado na pasta `dist/`:
```bash
npm run build
```

### 6. Pré-visualização do Build
Executa um servidor local servindo a pasta `dist/`:
```bash
npm run preview
```

---

## 🔐 Arquitetura de Autenticação & Fluxo de Navegação

```
                          ┌──────────────────────────┐
                          │   Usuário Acessa Rota    │
                          └────────────┬─────────────┘
                                       │
                              Rota requer Auth?
                            (meta.requiresAuth)
                              /              \
                        [SIM]                  [NÃO]
                         /                       \
             ┌───────────────────────┐       ┌───────────────────────┐
             │ Valida Sessão Ativa   │       │ Acesso Permitido à    │
             │   (comber-auth)       │       │       View            │
             └───────────┬───────────┘       └───────────────────────┘
                         │
                   Sessão Válida?
                    /          \
              [SIM]              [NÃO]
               /                   \
   ┌───────────────────────┐   ┌───────────────────────────┐
   │ Carrega a View e      │   │ Redireciona para o Portal │
   │ Disponibiliza useAuth │   │   de Login com ?redirect= │
   └───────────────────────┘   └───────────────────────────┘
```

---

## 📁 Estrutura de Diretórios

```text
comber-vue-template/
├── public/                  # Ícones, manifest e logos institucionais
│   └── icons/
│       ├── icon-192.png
│       ├── icon-512.png
│       ├── logo.png
│       └── logo_contrast.png
├── src/
│   ├── components/          # Componentes visuais reutilizáveis
│   │   ├── BackButton.vue   # Botão de retorno à tela inicial
│   │   ├── ChangeTheme.vue  # Alternador de tema claro/escuro
│   │   └── UserBadge.vue    # Perfil do usuário e menu de logout
│   ├── composables/         # Composables reutilizáveis (Composition API)
│   │   ├── useAuth.ts       # Gestão de estado de autenticação e sessão
│   │   └── useTheme.ts      # Controle e persistência do tema
│   ├── config/              # Configurações globais e versionamento
│   │   └── version.ts
│   ├── router/              # Configuração do Vue Router e rotas
│   │   └── index.ts
│   ├── services/            # Inicialização de serviços e comber-auth
│   │   └── auth.ts
│   ├── styles/              # Estilos globais e tokens Tailwind CSS v4
│   │   └── main.css
│   ├── views/               # Telas / páginas da aplicação
│   │   └── Home.vue         # Tela inicial e showcase do template
│   ├── App.vue              # Componente raiz da aplicação
│   ├── main.ts              # Ponto de entrada da aplicação
│   └── vite-env.d.ts        # Declarações de tipagem e variáveis de ambiente
├── .env.example             # Modelo de variáveis de ambiente
├── index.html               # Documento HTML base
├── package.json             # Dependências e scripts do projeto
├── tailwind.config.ts       # Configurações do Tailwind CSS
├── tsconfig.json            # Configuração do compilador TypeScript
└── vite.config.ts           # Configuração do bundler Vite
```

---

## 🛠️ Como Iniciar um Novo Projeto a partir deste Template

### 1. Criar uma Nova View
Crie seu componente Vue em `src/views/MinhaTela.vue`:

```vue
<template>
  <div class="min-h-screen p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
    <BackButton />
    <h1 class="text-2xl font-bold">Minha Nova Tela</h1>
    <p class="text-slate-600 dark:text-slate-400">Bem-vindo, {{ displayName }}!</p>
  </div>
</template>

<script setup lang="ts">
import BackButton from '@/components/BackButton.vue';
import { useAuth } from '@/composables/useAuth';

const { displayName } = useAuth();
</script>
```

### 2. Registrar a Rota
No arquivo `src/router/index.ts`, adicione a nova rota:

```typescript
import MinhaTela from '@/views/MinhaTela.vue';

const routes = [
  {
    path: '/minha-tela',
    name: 'minha-tela',
    component: MinhaTela,
    meta: { requiresAuth: true }, // Protege com o comber-auth
  },
  // ... outras rotas
];
```

### 3. Utilizar o Design System (Tailwind CSS v4)
Utilize as classes utilitárias e tokens semânticos:
* Cores principais: `bg-blue-600`, `text-blue-500`, `dark:bg-slate-900`.
* Estados de foco acessíveis: `focus-visible:ring-2 focus-visible:ring-blue-500`.
* Transições suaves: `transition-all duration-200`.

---

## 📦 Deploy & Hospedagem

Por ser uma aplicação SPA 100% estática (HTML, CSS e JavaScript compilados), o projeto compilado na pasta `dist/` pode ser hospedado em qualquer servidor web moderno ou CDN (Cloudflare Pages, Nginx, Caddy, Vercel, Netlify).

### Cabeçalhos de Segurança Recomendados no Servidor Web / CDN
```http
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

<p align="center">
  <sub>Grupo Comber &copy; 2026 — Todos os direitos reservados. Uso Interno.</sub>
</p>
