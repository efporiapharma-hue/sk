import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  User, 
  CreditCard, 
  ArrowLeft,
  Printer,
  CheckCircle2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { MOCK_INVENTORY, MOCK_PATIENTS } from '@/mockData';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function PharmacyPOS() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('walk-in');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<{
    items: CartItem[];
    total: number;
    subtotal: number;
    tax: number;
    patient: string;
    date: string;
    invoiceId: string;
  } | null>(null);

  const filteredInventory = MOCK_INVENTORY.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (item: any) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { id: item.id, name: item.name, price: 120, quantity: 1 }]); // Mock price
    }
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.id === id) {
        const newQty = Math.max(1, c.quantity + delta);
        return { ...c, quantity: newQty };
      }
      return c;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setIsCheckoutOpen(true);
  };

  const completeSale = () => {
    const invoiceId = `PH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const patientName = selectedPatient === 'walk-in' ? 'Walk-in Customer' : MOCK_PATIENTS.find(p => p.id === selectedPatient)?.name || 'Unknown';
    
    setLastOrder({
      items: [...cart],
      total,
      subtotal,
      tax,
      patient: patientName,
      date: new Date().toLocaleString(),
      invoiceId
    });

    setIsCheckoutOpen(false);
    setIsSuccessOpen(true);
    setCart([]);
    toast.success('Sale completed successfully');
  };

  const printReceipt = () => {
    if (!lastOrder) return;

    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (!printWindow) {
      toast.error('Please allow popups to print receipt');
      return;
    }

    const receiptHtml = `
      <html>
        <head>
          <title>Receipt - ${lastOrder.invoiceId}</title>
          <style>
            @page { margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 58mm; 
              padding: 5mm; 
              margin: 0;
              font-size: 12px;
              line-height: 1.2;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 5px 0; }
            .header { margin-bottom: 10px; }
            .footer { margin-top: 15px; font-size: 10px; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; border-bottom: 1px solid #000; }
            .total-row { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header text-center">
            <div class="bold" style="font-size: 16px;">GLOBAL HOSPITAL</div>
            <div>Pharmacy Department</div>
            <div>Tel: +91 1234567890</div>
          </div>
          
          <div class="divider"></div>
          
          <div>Inv: ${lastOrder.invoiceId}</div>
          <div>Date: ${lastOrder.date}</div>
          <div>Cust: ${lastOrder.patient}</div>
          
          <div class="divider"></div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Amt</th>
              </tr>
            </thead>
            <tbody>
              ${lastOrder.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="divider"></div>
          
          <div class="text-right">
            <div>Subtotal: ₹${lastOrder.subtotal.toFixed(2)}</div>
            <div>Tax (5%): ₹${lastOrder.tax.toFixed(2)}</div>
            <div class="bold" style="font-size: 14px;">TOTAL: ₹${lastOrder.total.toFixed(2)}</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="footer text-center">
            <div>Thank You! Get Well Soon.</div>
            <div>Medicines once sold cannot be returned.</div>
            <div style="margin-top: 5px;">Powered by Global Hospital HMS</div>
          </div>
          
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50">
      {/* Left Side: Inventory Selection */}
      <div className="flex-1 flex flex-col min-w-0 border-r bg-white">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/pharmacy">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Pharmacy POS</h1>
            </div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100">
              Terminal #01 - Active
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search medicine by name or barcode..." 
              className="pl-10 h-11 bg-slate-50 border-none rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredInventory.map((item) => (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:ring-2 hover:ring-medical-blue/20 transition-all border-slate-100 shadow-sm overflow-hidden"
                onClick={() => addToCart(item)}
              >
                <div className="p-4 space-y-3">
                  <div className="h-24 bg-slate-50 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm line-clamp-1">{item.name}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{item.category}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-bold text-medical-blue">₹120.00</span>
                    <Badge variant="secondary" className="text-[10px] bg-slate-100">
                      Stock: {item.stock}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Cart & Checkout */}
      <div className="w-96 flex flex-col bg-white">
        <div className="p-4 border-b">
          <h2 className="font-bold flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Current Order
          </h2>
        </div>

        <div className="p-4 border-b bg-slate-50/50">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Customer / Patient</Label>
            <div className="flex gap-2">
              <select 
                className="flex-1 h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
              >
                <option value="walk-in">Walk-in Customer</option>
                {MOCK_PATIENTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.mrn})</option>
                ))}
              </select>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-50">
              <ShoppingCart className="w-12 h-12" />
              <p className="text-sm font-medium">Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">₹{item.price} per unit</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-lg overflow-hidden h-8">
                      <button 
                        className="px-2 hover:bg-slate-50 border-r"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button 
                        className="px-2 hover:bg-slate-50 border-l"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-slate-50 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tax (5%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold text-medical-blue">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <Button 
            className="w-full h-12 text-lg font-bold bg-medical-blue shadow-lg shadow-medical-blue/20"
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            Checkout
          </Button>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>Select payment method to complete the sale.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            <Button variant="outline" className="h-20 flex-col gap-2 border-2 hover:border-medical-blue hover:bg-medical-blue/5">
              <CreditCard className="w-6 h-6" />
              Cash
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 border-2 hover:border-medical-blue hover:bg-medical-blue/5">
              <CreditCard className="w-6 h-6" />
              Card
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 border-2 hover:border-medical-blue hover:bg-medical-blue/5">
              <CreditCard className="w-6 h-6" />
              UPI / QR
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 border-2 hover:border-medical-blue hover:bg-medical-blue/5">
              <User className="w-6 h-6" />
              Credit
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>Cancel</Button>
            <Button className="bg-medical-blue" onClick={completeSale}>Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground">Invoice #{lastOrder?.invoiceId} has been generated.</p>
            </div>
            <div className="w-full flex gap-2 pt-4">
              <Button variant="outline" className="flex-1 gap-2" onClick={printReceipt}>
                <Printer className="w-4 h-4" />
                Print Receipt
              </Button>
              <Button className="flex-1 bg-medical-blue" onClick={() => setIsSuccessOpen(false)}>
                New Sale
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
