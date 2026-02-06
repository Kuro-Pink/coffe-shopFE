'use client';

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  List,
  ListItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function OrderAccordion({ order, getOriginal, getFinal }: any) {
  return (
    <Accordion disableGutters elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className="flex justify-between w-full items-center">
          <div>
            <Typography variant="body2" className="font-semibold">
              {order.orderNumber}
            </Typography>

            <Typography variant="caption" className="text-gray-600 block">
              {format(new Date(order.createdAt), 'HH:mm - dd/MM/yyyy', {
                locale: vi,
              })}
            </Typography>

            <div className="flex items-center gap-2 mt-1">
              <Typography variant="caption">{order.items.length} món</Typography>

              {order.voucherDiscount > 0 && (
                <Chip
                  size="small"
                  color="info"
                  icon={<LocalOfferIcon fontSize="small" />}
                  label={`-${order.voucherDiscount.toLocaleString('vi-VN')} ₫`}
                />
              )}
            </div>
          </div>

          <Typography className="font-bold text-green-600">
            {order.totalAmount.toLocaleString('vi-VN')} ₫
          </Typography>
        </div>
      </AccordionSummary>

      <AccordionDetails>
        <List dense>
          {order.items.map((item: any, index: number) => (
            <ListItem key={index} className="flex justify-between">
              <div>
                <Typography>{item.name}</Typography>
                <div className="flex gap-2">
                  {getOriginal(item) > getFinal(item) && (
                    <Typography className="line-through text-gray-400">
                      {(getOriginal(item) * item.quantity).toLocaleString('vi-VN')} ₫
                    </Typography>
                  )}
                  <Typography className="font-bold text-orange-700">
                    {(getFinal(item) * item.quantity).toLocaleString('vi-VN')} ₫
                  </Typography>
                </div>
              </div>
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
