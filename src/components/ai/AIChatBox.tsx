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
  price: number;
  image?: string;
}

interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
  action?: 'CONFIRM_LAST_ORDER';
  products?: ChatProduct[];
}
const quickQuestions = [
  'Gợi ý món cho tôi',
  'Tôi hay uống món gì?',
  'Món ít đá cho tôi',
  'Gọi lại như lần trước',
];

export default function AIChatBox({ storeId }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: 'Xin chào 👋 Em là trợ lý gọi món, em có thể nhớ món cũ cho anh/chị 😊',
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

    width: isMobile ? '95%' : 520,
    height: isMobile ? '80%' : 600,

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
  const handleSendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;

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
      // fallback an toàn
      const aiText = res?.reply || 'AI đang bận chút, anh thử lại nhé 🙏';

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: aiText,
          action: res?.action,
          products: res?.products,
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

  const quickQuestions = ['Món đề xuất', 'Gọi món như lần trước', 'Món bán chạy'];

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
                            image={p.image}
                            storeId={storeId}
                          />
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
              {quickQuestions.map((q) => (
                <Button
                  key={q}
                  size="small"
                  variant="outlined"
                  onClick={() => handleSendMessage(q)}
                >
                  {q}
                </Button>
              ))}
            </Box>

            {/* INPUT */}
            <Box p={2} display="flex" gap={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="Nhập câu hỏi..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button variant="contained" onClick={() => handleSendMessage()}>
                Gửi
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}
