<template>
  <button
    @click="$router.push('/home')"
    class="fixed top-5 left-5 z-50 w-10 h-10 flex items-center justify-center bg-slate-800/80 hover:bg-slate-700/90 rounded-full shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-700/50 hover:border-slate-600 cursor-pointer">
    <span class="material-icons text-white text-2xl">arrow_back</span>
  </button>
</template>
