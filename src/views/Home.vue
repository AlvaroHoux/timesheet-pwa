<template>
  <div class="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 relative selection:bg-blue-500 selection:text-white overflow-x-hidden">
    
    <!-- Background Decorativo Moderno (Glows sutis sem imagens pesadas) -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl"></div>
      <div class="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 left-1/3 w-96 h-96 bg-violet-500/10 dark:bg-violet-600/10 rounded-full blur-3xl"></div>
      <div class="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
    </div>

    <!-- Toast Notification Flutuante -->
    <transition
      enter-active-class="transition duration-300 ease-out transform"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition duration-200 ease-in transform"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div
        v-if="toastMessage"
        class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-slate-700/60 max-w-sm">
        <span class="material-icons text-emerald-400 text-xl">check_circle</span>
        <p class="text-xs sm:text-sm font-medium flex-1">{{ toastMessage }}</p>
        <button
          type="button"
          @click="toastMessage = null"
          class="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-md"
          aria-label="Fechar notificação">
          <span class="material-icons text-base">close</span>
        </button>
      </div>
    </transition>

    <!-- Barra de Navegação Superior (Header) -->
    <header class="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <!-- Logo e Marca -->
        <div class="flex items-center gap-3 sm:gap-4">
          <img
            src="/icons/logo_contrast.png"
            alt="Grupo Comber"
            class="h-8 sm:h-9 w-auto object-contain dark:brightness-100 brightness-0 transition-all" />
          <div class="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
              Template Base
            </span>
          </div>
        </div>

        <!-- Controles Superiores: Status, Tema e Perfil -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Status da Conexão / Sessão -->
          <div class="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>comber-auth conectado</span>
          </div>

          <!-- Seletor de Tema -->
          <ChangeTheme :fixed="false" />

          <!-- Badge do Usuário com Dropdown -->
          <UserBadge />
        </div>
      </div>
    </header>

    <!-- Conteúdo Principal -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10 flex flex-col gap-10">
      
      <!-- Hero Section / Apresentação do Template -->
      <section class="relative rounded-3xl bg-linear-to-br from-blue-900/90 via-slate-900/95 to-slate-900 text-white p-6 sm:p-10 md:p-12 overflow-hidden shadow-xl border border-blue-800/30">
        <!-- Glow interno -->
        <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div class="relative z-10 max-w-3xl">
          <div class="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-200 backdrop-blur-xs border border-white/15">
              <span class="material-icons text-sm text-blue-300">verified</span>
              Grupo Comber Padrão
            </span>
            <span class="font-mono text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
              v{{ APP_VERSION }}
            </span>
          </div>

          <h1 class="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Olá, <span class="text-transparent bg-clip-text bg-linear-to-r from-blue-300 via-sky-200 to-indigo-200">{{ displayName }}</span>! 👋
          </h1>
          
          <p class="mt-3 sm:mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Este é o template oficial do <strong class="text-white font-semibold">Grupo Comber</strong> construído com <strong class="text-white font-semibold">Vue 3</strong>, <strong class="text-white font-semibold">Tailwind CSS v4</strong> e autenticação integrada via <strong class="text-white font-semibold">comber-auth</strong>. Pronto para acelerar o desenvolvimento de novas aplicações internas.
          </p>

          <!-- Badges de Tecnologia da Stack -->
          <div class="flex flex-wrap gap-2 mt-6">
            <span class="px-2.5 py-1 text-xs font-medium rounded-md bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1">
              <span class="material-icons text-xs text-emerald-400">check</span> Vue 3.5 (Composition API)
            </span>
            <span class="px-2.5 py-1 text-xs font-medium rounded-md bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1">
              <span class="material-icons text-xs text-sky-400">check</span> Tailwind CSS v4
            </span>
            <span class="px-2.5 py-1 text-xs font-medium rounded-md bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1">
              <span class="material-icons text-xs text-violet-400">check</span> TypeScript & Vite 8
            </span>
            <span class="px-2.5 py-1 text-xs font-medium rounded-md bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1">
              <span class="material-icons text-xs text-amber-400">check</span> comber-auth v2
            </span>
          </div>

          <!-- Ações Rápidas -->
          <div class="flex flex-wrap items-center gap-3 sm:gap-4 mt-8">
            <a
              href="#showcase"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 active:scale-95 text-white shadow-lg shadow-blue-900/40 hover:shadow-blue-600/30 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
              <span class="material-icons text-base">widgets</span>
              Explorar Componentes
            </a>

            <button
              type="button"
              @click="copySnippet('git clone && npm install', 'Comando de setup copiado!')"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 backdrop-blur-xs transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <span class="material-icons text-base">content_copy</span>
              Copiar Setup
            </button>

            <button
              type="button"
              @click="showNotification('Tudo pronto! Seu ambiente de desenvolvimento está operando normalmente.')"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-200 hover:text-white hover:bg-white/5 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
              <span class="material-icons text-base">notifications_active</span>
              Testar Toast
            </button>
          </div>
        </div>
      </section>

      <!-- Grid Bento de Arquitetura & Recursos -->
      <section aria-labelledby="architecture-heading">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <h2 id="architecture-heading" class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Recursos & Módulos Pré-configurados
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Pilares arquiteturais já implementados e prontos para extensão.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          
          <!-- Card 1: Autenticação Directus -->
          <div class="group flex flex-col p-6 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-900/50 group-hover:scale-105 transition-transform duration-200">
              <span class="material-icons text-2xl">verified_user</span>
            </div>
            
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
              <span>Autenticação</span>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">Ativo</span>
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-1">
              Integração completa com <code class="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">comber-auth</code>, guardas de rota automáticas e gestão de perfil de usuário.
            </p>

            <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <div class="flex justify-between">
                <span class="font-medium">Usuário:</span>
                <span class="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{{ displayName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Cargo/Role:</span>
                <span class="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{{ roleName || 'Padrão' }}</span>
              </div>
            </div>
          </div>

          <!-- Card 2: Tailwind v4 & Theming -->
          <div class="group flex flex-col p-6 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            <div class="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-900/50 group-hover:scale-105 transition-transform duration-200">
              <span class="material-icons text-2xl">palette</span>
            </div>
            
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
              <span>Tema & Estilos</span>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50">CSS-first</span>
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-1">
              Tailwind CSS v4 com suporte instantâneo a Dark/Light Mode, persistência no storage e variáveis semânticas.
            </p>

            <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tema atual:</span>
              <span class="capitalize text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                <span class="material-icons text-sm text-amber-500">{{ currentTheme === 'dark' ? 'dark_mode' : 'light_mode' }}</span>
                {{ currentTheme }}
              </span>
            </div>
          </div>

          <!-- Card 3: Roteamento & Guards -->
          <div class="group flex flex-col p-6 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-900/50 group-hover:scale-105 transition-transform duration-200">
              <span class="material-icons text-2xl">alt_route</span>
            </div>
            
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
              <span>Vue Router 4</span>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">Guards</span>
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-1">
              Roteamento estruturado em <code class="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">src/router/</code> com validação de sessão assíncrona automática.
            </p>

            <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Middleware:</span>
              <span class="font-mono font-semibold text-slate-700 dark:text-slate-300">requiresAuth</span>
            </div>
          </div>

          <!-- Card 4: Estrutura Modular -->
          <div class="group flex flex-col p-6 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-100 dark:border-amber-900/50 group-hover:scale-105 transition-transform duration-200">
              <span class="material-icons text-2xl">extension</span>
            </div>
            
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
              <span>Modularidade</span>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50">Clean</span>
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-1">
              Composables desacoplados (<code class="font-mono text-[11px] text-amber-600 dark:text-amber-400">useAuth</code>, <code class="font-mono text-[11px] text-amber-600 dark:text-amber-400">useTheme</code>) e componentes prontos para reuso.
            </p>

            <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Ícones:</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300">Material Icons</span>
            </div>
          </div>

        </div>
      </section>

      <!-- Component Showcase & Sandbox Interativo -->
      <section id="showcase" aria-labelledby="showcase-heading" class="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-8">
        <div>
          <div class="flex items-center gap-2">
            <span class="material-icons text-blue-600 dark:text-blue-400 text-2xl">category</span>
            <h2 id="showcase-heading" class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Showcase de Componentes & Elementos de UI
            </h2>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Exemplos de estilos, botões, estados e formulários estilizados com o padrão de design do template.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- Bloco: Botões & Variantes -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Variantes de Botões
            </h3>
            
            <div class="flex flex-wrap gap-3 items-center">
              <!-- Primário -->
              <button
                type="button"
                @click="showNotification('Ação Primária executada!')"
                class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                Botão Primário
              </button>

              <!-- Secundário / Slate -->
              <button
                type="button"
                @click="showNotification('Ação Secundária selecionada!')"
                class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">
                Secundário
              </button>

              <!-- Sucesso / Positivo -->
              <button
                type="button"
                @click="showNotification('Operação concluída com sucesso!')"
                class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-sm transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 flex items-center gap-1.5">
                <span class="material-icons text-base">check</span>
                Sucesso
              </button>

              <!-- Perigo / Destrutivo -->
              <button
                type="button"
                @click="showNotification('Ação de atenção/perigo disparada!')"
                class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 border border-red-200 dark:border-red-800/60 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                Destrutivo
              </button>

              <!-- Loading State Test -->
              <button
                type="button"
                @click="simulateLoadingAction"
                :disabled="isLoadingAction"
                class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 disabled:cursor-not-allowed active:scale-95 text-white shadow-sm transition-all duration-200 flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                <svg
                  v-if="isLoadingAction"
                  class="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ isLoadingAction ? 'Processando...' : 'Testar Loading' }}</span>
              </button>
            </div>

            <!-- Badges & Status Pills -->
            <div class="pt-4 space-y-2">
              <span class="text-xs font-medium text-slate-500 dark:text-slate-400 block">Badges de Status Semânticos:</span>
              <div class="flex flex-wrap gap-2">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Informativo
                </span>
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Concluído
                </span>
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Em Revisão
                </span>
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Pendente
                </span>
              </div>
            </div>
          </div>

          <!-- Bloco: Inputs & Formulários -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Formulários & Campos Padronizados
            </h3>

            <div class="space-y-3">
              <div>
                <label for="sample-search" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Campo de Pesquisa com Ícone
                </label>
                <div class="relative rounded-xl shadow-2xs">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span class="material-icons text-lg">search</span>
                  </div>
                  <input
                    id="sample-search"
                    v-model="searchQuery"
                    type="text"
                    placeholder="Digite para filtrar dados..."
                    class="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
                </div>
              </div>

              <div>
                <label for="sample-select" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Seleção de Opção
                </label>
                <select
                  id="sample-select"
                  class="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer">
                  <option value="1">Módulo Padrão 01</option>
                  <option value="2">Módulo Financeiro</option>
                  <option value="3">Módulo de Estoque e Compras</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- Guia Rápido do Desenvolvedor (Starter Steps) -->
      <section aria-labelledby="quickstart-heading" class="rounded-3xl bg-linear-to-r from-slate-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 border border-slate-800 shadow-lg">
        <div class="flex items-center gap-2 mb-4">
          <span class="material-icons text-amber-400 text-2xl">tips_and_updates</span>
          <h2 id="quickstart-heading" class="text-xl font-bold tracking-tight text-white">
            Guia Rápido para Criar Novas Telas
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-6">
          <div class="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div class="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs font-bold font-mono">
              01
            </div>
            <h3 class="text-sm font-bold text-slate-100">Criar o Componente da View</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Crie seu arquivo <code class="font-mono text-blue-300">.vue</code> em <code class="font-mono text-blue-300">src/views/MinhaTela.vue</code> utilizando Composition API e Tailwind.
            </p>
          </div>

          <div class="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div class="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold font-mono">
              02
            </div>
            <h3 class="text-sm font-bold text-slate-100">Registrar no Roteador</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Adicione a nova rota no arquivo <code class="font-mono text-indigo-300">src/router/index.ts</code> com a flag <code class="font-mono text-indigo-300">meta: { requiresAuth: true }</code>.
            </p>
          </div>

          <div class="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div class="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center text-xs font-bold font-mono">
              03
            </div>
            <h3 class="text-sm font-bold text-slate-100">Consumir Serviços e Auth</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Utilize o composable <code class="font-mono text-violet-300">useAuth()</code> para obter tokens, endpoints Directus e dados do usuário atual.
            </p>
          </div>
        </div>
      </section>

    </main>

    <!-- Rodapé Padrão Corporativo -->
    <footer class="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md py-6 text-xs text-slate-500 dark:text-slate-400 relative z-10 transition-colors">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="font-semibold text-slate-700 dark:text-slate-300">GRUPO COMBER</span>
          <span>•</span>
          <span>Departamento de Projetos e Processos</span>
        </div>
        <div class="flex items-center gap-4">
          <span class="font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] font-semibold">
            Versão {{ APP_VERSION }}
          </span>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useTheme } from '@/composables/useTheme';
import { APP_VERSION } from '@/config/version';
import ChangeTheme from '@/components/ChangeTheme.vue';
import UserBadge from '@/components/UserBadge.vue';

// Composables de Sessão e Tema
const { displayName, roleName } = useAuth();
const { currentTheme } = useTheme();

// Estado Interativo da Tela de Template
const searchQuery = ref('');
const toastMessage = ref<string | null>(null);
const isLoadingAction = ref(false);

/**
 * Exibe uma mensagem toast com auto-dismiss após 3.5 segundos
 */
const showNotification = (message: string) => {
  toastMessage.value = message;
  setTimeout(() => {
    if (toastMessage.value === message) {
      toastMessage.value = null;
    }
  }, 3500);
};

/**
 * Copia um texto para a área de transferência do usuário
 */
const copySnippet = async (text: string, successMessage: string) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      showNotification(successMessage);
    } else {
      showNotification(successMessage);
    }
  } catch {
    showNotification('Texto copiado com sucesso!');
  }
};

/**
 * Simula uma ação assíncrona de loading para demonstrar estados de UI
 */
const simulateLoadingAction = () => {
  if (isLoadingAction.value) return;
  isLoadingAction.value = true;
  setTimeout(() => {
    isLoadingAction.value = false;
    showNotification('Ação assíncrona finalizada com sucesso!');
  }, 1500);
};
</script>
