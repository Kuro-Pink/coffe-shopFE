frontend/
├── src/
│ ├── app/
│ │ ├── layout.tsx # Root layout
│ │ ├── page.tsx # Home/redirect page
│ │ ├── globals.css
│ │ ├── (auth)/ # Auth group
│ │ │ ├── layout.tsx
│ │ │ └── login/
│ │ │ └── page.tsx
│ │ ├── admin/ # Admin routes
│ │ │ ├── layout.tsx
│ │ │ ├── page.tsx
│ │ │ └── stores/
│ │ │ ├── page.tsx
│ │ │ ├── create/
│ │ │ │ └── page.tsx
│ │ │ └── [id]/
│ │ │ └── edit/
│ │ │ └── page.tsx
│ │ ├── host/ # Host routes
│ │ │ ├── layout.tsx
│ │ │ ├── page.tsx
│ │ │ ├── menu/
│ │ │ │ └── page.tsx
│ │ │ ├── tables/
│ │ │ │ └── page.tsx
│ │ │ └── orders/
│ │ │ ├── page.tsx
│ │ │ └── [id]/
│ │ │ └── page.tsx
│ │ └── menu/ # Public customer menu
│ │ └── [storeId]/
│ │ └── page.tsx
│ ├── components/
│ │ ├── common/ # Shared components
│ │ │ ├── LoadingSpinner.tsx
│ │ │ ├── ErrorMessage.tsx
│ │ │ └── ConfirmDialog.tsx
│ │ ├── admin/
│ │ │ ├── StoreCard.tsx
│ │ │ ├── StoreForm.tsx
│ │ │ └── StatsCard.tsx
│ │ ├── host/
│ │ │ ├── MenuManager/
│ │ │ │ ├── CategoryList.tsx
│ │ │ │ ├── ProductList.tsx
│ │ │ │ └── ProductForm.tsx
│ │ │ ├── TableManager/
│ │ │ │ ├── TableCard.tsx
│ │ │ │ └── QRCodeDisplay.tsx
│ │ │ └── OrderManager/
│ │ │ ├── OrderList.tsx
│ │ │ ├── OrderCard.tsx
│ │ │ └── OrderDetail.tsx
│ │ └── customer/
│ │ ├── MenuList.tsx
│ │ ├── ProductCard.tsx
│ │ ├── Cart.tsx
│ │ └── CheckoutModal.tsx
│ ├── lib/
│ │ ├── api.ts # Axios instance
│ │ ├── socket.ts # Socket.io client
│ │ └── stores/ # Zustand stores
│ │ ├── authStore.ts
│ │ └── cartStore.ts
│ ├── types/
│ │ └── index.ts # TypeScript types
│ ├── utils/
│ │ ├── constants.ts
│ │ ├── formatters.ts
│ │ └── validators.ts
│ └── middleware.ts # NextJS middleware
├── public/
│ └── logo.png
├── .env.local
├── next.config.js
└── package.json
Checklist hoàn thành base:

✅ NextJS 14 + TypeScript
✅ Tailwind + MUI
✅ Zustand (auth + cart)
✅ Axios setup với interceptor
✅ TypeScript types đầy đủ
✅ Folder structure chuẩn
✅ Middleware cho protected routes
✅ Environment variables

🎯 Tiếp theo:
Sau khi bạn setup xong base này, mình sẽ hướng dẫn từng phase:

Phase 1: Authentication (Login page)
Phase 2: Admin Module
Phase 3: Host Module - Menu
Phase 4: Host Module - Tables
Phase 5: Customer Menu & Order
Phase 6: Host Orders & Socket.io
Phase 7: Statistics & Polish
