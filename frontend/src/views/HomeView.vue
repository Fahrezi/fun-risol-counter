<script setup lang="ts"></script>

<template>
  <div class="min-h-svh w-full bg-black text-white flex flex-col justify-center overflow-x-hidden">
    <div class="flex-1 flex flex-col items-center justify-center gap-7 px-5 py-10">
      <span
        class="shine-sweep relative flex items-center justify-center w-[68px] h-[68px] sm:w-[84px] sm:h-[84px] bg-accent border-[3px] border-white shadow-[4px_4px_0_#000] font-black text-[1.3rem] sm:text-[1.6rem] text-ink flex-shrink-0"
      >
        DL
      </span>
      <div class="flex flex-row justify-center gap-[18px] flex-wrap">
        <router-link
          to="/yang-punya"
          class="inline-block px-5 py-3 sm:px-[26px] sm:py-3.5 text-[0.9rem] sm:text-base bg-white text-ink border-[3px] border-white shadow-[5px_5px_0_#ffd400] font-black uppercase no-underline cursor-pointer active:translate-x-[5px] active:translate-y-[5px] active:shadow-none"
        >
          Yang Punya
        </router-link>
        <router-link
          to="/yang-beli"
          class="inline-block px-5 py-3 sm:px-[26px] sm:py-3.5 text-[0.9rem] sm:text-base bg-white text-ink border-[3px] border-white shadow-[5px_5px_0_#ffd400] font-black uppercase no-underline cursor-pointer active:translate-x-[5px] active:translate-y-[5px] active:shadow-none"
        >
          Yang Beli
        </router-link>
      </div>
    </div>
    <div class="text-center text-xs text-white/50 pb-2">v.1.0.0</div>
    <div class="w-full overflow-hidden border-t-[3px] border-b-[3px] border-white py-4 bg-black">
      <div
        class="flex w-max gap-[60px] whitespace-nowrap font-extrabold text-[0.85rem] sm:text-[1.05rem] uppercase tracking-[0.04em] text-white animate-[marquee-scroll_16s_linear_infinite]"
      >
        <span class="pr-[60px]"
          >&ldquo;Sebuah site yang di dedikasikan untuk menghitung jumlah pembelian dagangan
          luthfi&rdquo;</span
        >
        <span class="pr-[60px]"
          >&ldquo;Sebuah site yang di dedikasikan untuk menghitung jumlah pembelian dagangan
          luthfi&rdquo;</span
        >
      </div>
    </div>
  </div>
</template>
