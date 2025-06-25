
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Truck } from 'lucide-react';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { Order, OrderStatus } from '@/types/product';

interface OrdersTableProps {
  orders: Order[];
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
  onAddTracking: (order: Order) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onStatusChange,
  onEdit,
  onDelete,
  onAddTracking
}) => {
  const navigate = useNavigate();

  const viewOrderDetails = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'processing':
        return 'secondary';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Tracking</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.userName}</TableCell>
              <TableCell>{formatDate(order.createdAt)}</TableCell>
              <TableCell>{formatCurrency(order.total)}</TableCell>
              <TableCell>
                <Select
                  defaultValue={order.status}
                  onValueChange={(value: OrderStatus) => onStatusChange(order.id, value)}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{order.paymentMethod.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</TableCell>
              <TableCell>
                {order.trackingInfo?.trackingNumber ? (
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span className="text-sm">{order.trackingInfo.trackingNumber}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">No tracking</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => viewOrderDetails(order.id)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onAddTracking(order)}
                  >
                    <Truck className="h-4 w-4 mr-1" />
                    Track
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(order)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => onDelete(order)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
