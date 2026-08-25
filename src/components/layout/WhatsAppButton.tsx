"use client";

import { WHATSAPP_URL } from "@/lib/site";

export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
      aria-label="Chat with Bharatiya Chakki on WhatsApp"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <path
          fill="currentColor"
          d="M19.11 17.47c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.41.12-.55.13-.13.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.46h-.52c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29s.98 2.66 1.12 2.84c.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.57.66.21 1.25.18 1.72.11.53-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"
        />
        <path
          fill="currentColor"
          d="M16.02 4C9.4 4 4.03 9.37 4.03 16c0 2.11.55 4.18 1.6 6.01L4 28l6.15-1.61A11.94 11.94 0 0 0 16.02 28C22.64 28 28 22.63 28 16S22.64 4 16.02 4zm0 21.82c-2.03 0-4.02-.54-5.76-1.57l-.41-.24-3.65.96.97-3.56-.27-.43A9.82 9.82 0 0 1 6.2 16c0-5.42 4.41-9.82 9.82-9.82 5.42 0 9.83 4.4 9.83 9.82 0 5.41-4.41 9.82-9.83 9.82z"
        />
      </svg>
    </a>
  );
}
