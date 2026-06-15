const CACHE_NAME = 'ponto-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/pages/ponto.html',
    '/pages/registros.html',
    '/styles/ponto.css',
    '/styles/modal.css',
    '/dist/ponto.js',
    '/dist/registros.js',
    '/dist/registros-ui.js',
    '/dist/sw-register.js'
    // Posteriormente, adicione aqui o caminho do seu manifest.json e ícones
];

// Instalação: Salva os arquivos essenciais no cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Ativação: Limpa caches antigos se a versão mudar
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
});

// Interceptação de Rede: Serve do cache ou busca na rede
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Ouve o comando para forçar a atualização vindo do banner
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});