'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Modal,
  Fab,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import CloseIcon from '@mui/icons-material/Close';
import Fade from '@mui/material/Fade';
import Backdrop from '@mui/material/Backdrop';
import { aiService } from '@/lib/services/aiService';
import { useCartStore } from '@/lib/stores/cartStore';
import ChatProductCard from './ChatProductCard';

interface Props {
  storeId: string;
}

interface ChatProduct {
  productId: string;
  name: string;
  price: number; // finalPrice
  originalPrice?: number;
  discountAmount?: number;
  image?: string;
}

interface ChatOption {
  label: string;
  message: string;
}

interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
  action?: 'CONFIRM_LAST_ORDER';
  products?: ChatProduct[];
  options?: ChatOption[]; // 👈 THÊM DÒNG NÀY
}

const MAIN_OPTIONS: ChatOption[] = [
  { label: '🍹 Đồ uống', message: 'menu nuoc' },
  { label: '🍰 Bánh ngọt', message: 'banh ngot' },
  { label: '🍟 Ăn vặt', message: 'an vat' },
];

const DRINK_OPTIONS: ChatOption[] = [
  { label: '☕ Cà phê', message: 'ca phe' },
  { label: '🧋 Trà sữa', message: 'tra sua' },
  { label: '🍵 Trà', message: 'tra' },
  { label: '🥤 Sinh tố', message: 'sinh to' },
  { label: '🍊 Nước ép', message: 'nuoc ep' },
  { label: '🍫 Matcha / Cacao', message: 'matcha' },
];

const QUICK_OPTIONS: ChatOption[] = [
  { label: '🔥 Món bán chạy', message: 'ban chay' },
  { label: '🌅 Đồ uống buổi sáng', message: 'buoi sang' },
  { label: '🧊 Món ít đá', message: 'it da' },
  { label: '♨️ Món nóng', message: 'nong' },
];

export default function AIChatBox({ storeId }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: 'Xin chào 👋 Mình giúp bạn chọn món nhanh nhé!',
      options: MAIN_OPTIONS,
    },
  ]);
  const [input, setInput] = useState('');
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const addItem = useCartStore((s) => s.addItem);
  const isMobile = useMediaQuery('(max-width:600px)');
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [highlightProducts, setHighlightProducts] = useState<string[]>([]);

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',

    width: isMobile ? '95%' : 600,
    height: isMobile ? '80%' : 720,

    maxWidth: '95vw',
    maxHeight: '85vh',

    bgcolor: 'background.paper',
    borderRadius: 3,
    p: 2,
    boxShadow: 24,

    display: 'flex',
    flexDirection: 'column',
  };

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: 'ai',
          text: 'Chào bạn 👋\nMình có thể giúp gợi ý món, gọi lại đơn cũ hoặc trả lời câu hỏi về menu ☕',
        },
      ]);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleConfirmLastOrder = () => {
    if (!lastOrder) return;

    lastOrder.items.forEach((item: any) => {
      addItem({
        productId: item.productId,
        storeId: storeId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      });
    });

    setMessages((prev) => [
      ...prev,
      { role: 'ai', text: 'Mình đã thêm món như lần trước cho bạn rồi nha ☕😊' },
    ]);
    setLastOrder(null);
  };

  const handleAfterAddToCart = async (productId: string, productName: string) => {
    // AI hỏi upsell ngay sau khi thêm
    setMessages((prev) => [
      ...prev,
      {
        role: 'ai',
        text: `Bạn vừa thêm *${productName}* 🛒\nBạn có muốn dùng thêm món ăn kèm hoặc combo không?`,
        options: [
          { label: 'Có, gợi ý thêm', message: `goi combo ${productId}` },
          { label: 'Không, cảm ơn', message: 'khong combo' },
        ],
      },
    ]);
  };

  const handleSendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;

    // 👉 Nếu khách chọn upsell combo
    if (content.startsWith('goi combo')) {
      const productId = content.split(' ')[2];

      setIsTyping(true);
      const comboRes = await aiService.recommendCombo(storeId, productId);
      setIsTyping(false);

      if (comboRes?.combo) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: comboRes.upsellText || 'Món này hay được gọi kèm nè 😋',
            products: [comboRes.combo],
            options: MAIN_OPTIONS,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: 'Hiện chưa có combo phù hợp lắm, bạn xem thêm menu nhé 😊',
            options: MAIN_OPTIONS,
          },
        ]);
      }
      return;
    }

    // 👉 Nếu khách từ chối combo
    if (content === 'khong combo') {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'Dạ cảm ơn bạn 🥰 Khi nào cần thêm món cứ nói mình nhé!',
          options: MAIN_OPTIONS,
        },
      ]);
      return;
    }

    // push user message
    setMessages((prev) => [...prev, { role: 'user', text: content }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await aiService.chat({
        storeId,
        phone,
        message: content,
      });

      let nextOptions: ChatOption[] | undefined = MAIN_OPTIONS;

      // Nếu user vừa hỏi đồ uống
      if (content.includes('menu nuoc')) nextOptions = DRINK_OPTIONS;

      // Nếu đã vào nhóm nhỏ rồi thì quay lại menu chính
      if (
        content.includes('ca phe') ||
        content.includes('tra sua') ||
        content.includes('sinh to') ||
        content.includes('nuoc ep') ||
        content.includes('matcha')
      ) {
        nextOptions = MAIN_OPTIONS;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: res?.reply || 'AI đang bận chút, anh thử lại nhé 🙏',
          action: res?.action,
          products: res?.products,
          options: nextOptions, // 👈 thêm dòng này
        },
      ]);

      if (res?.lastOrder) setLastOrder(res.lastOrder);
      if (res?.phone) setPhone(res.phone);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Có lỗi xảy ra 😅' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* FLOATING ICON */}
      <Fab
        color="primary"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 86,
          right: 36,
          zIndex: 9999,
          background: 'linear-gradient(to right, #6366f1, #22c55e)',
        }}
      >
        <ForumIcon />
      </Fab>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 300 }}
      >
        <Fade in={open}>
          <Box sx={modalStyle}>
            {/* HEADER */}
            <Box p={2} display="flex" justifyContent="space-between">
              <Typography variant="h6" color="primary" fontWeight={600}>
                🤖 Trợ lý gọi món
              </Typography>
              <CloseIcon sx={{ cursor: 'pointer' }} onClick={() => setOpen(false)} />
            </Box>

            {/* MESSAGES */}
            <Box flex={1} px={2} overflow="auto">
              {messages.map((m, i) => (
                <Box
                  key={i}
                  mb={1.5}
                  display="flex"
                  justifyContent={m.role === 'user' ? 'flex-end' : 'flex-start'}
                >
                  <Box
                    px={1.5}
                    py={1}
                    maxWidth="80%"
                    bgcolor={m.role === 'user' ? '#6366f1' : '#f1f5f9'}
                    color={m.role === 'user' ? 'white' : 'black'}
                    borderRadius={2}
                    whiteSpace="pre-line"
                    fontSize={14}
                  >
                    {m.text}
                    {/* DANH SÁCH MÓN AI GỢI Ý */}
                    {m.products && m.products.length > 0 && (
                      <Box mt={1}>
                        {m.products.map((p) => (
                          <ChatProductCard
                            key={p.productId}
                            productId={p.productId}
                            name={p.name}
                            price={p.price}
                            originalPrice={p.originalPrice}
                            finalPrice={p.finalPrice}
                            discountAmount={p.discountAmount}
                            image={p.image}
                            storeId={storeId}
                            onAddedToCart={handleAfterAddToCart}
                          />
                        ))}
                      </Box>
                    )}
                    {m.options && (
                      <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                        {m.options.map((opt) => (
                          <Button
                            key={opt.label}
                            size="small"
                            variant="outlined"
                            onClick={() => handleSendMessage(opt.message)}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </Box>
                    )}

                    {m.action === 'CONFIRM_LAST_ORDER' && lastOrder && (
                      <Box mt={1} display="flex" gap={1}>
                        <Button size="small" variant="contained" onClick={handleConfirmLastOrder}>
                          Đúng rồi
                        </Button>
                        <Button size="small" variant="outlined" onClick={() => setLastOrder(null)}>
                          Lần sau nhé
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
              <div ref={bottomRef} />
            </Box>

            {isTyping && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300" />
                <span>AI đang trả lời...</span>
              </div>
            )}

            {/* QUICK QUESTIONS */}
            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
              {QUICK_OPTIONS.map((opt) => (
                <Button
                  key={opt.message}
                  size="small"
                  variant="outlined"
                  onClick={() => handleSendMessage(opt.message)}
                >
                  {opt.label}
                </Button>
              ))}
            </Box>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}
