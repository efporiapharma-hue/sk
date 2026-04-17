import { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Plus,
  ArrowUpRight,
  History,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MOCK_BILLING, MOCK_PATIENTS, MOCK_OT_RATES, MOCK_BED_RATES, MOCK_USERS, MOCK_LAB_TESTS, MOCK_MATERIAL_RATES } from '@/mockData';
import { BillingRecord } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function Billing() {
  const [bills, setBills] = useState(MOCK_BILLING);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Multi-item invoice state
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [newInvoice, setNewInvoice] = useState({
    patientId: '',
    paymentMode: 'Cash'
  });
  
  const [currentItem, setCurrentItem] = useState({
    category: '',
    description: '',
    amount: '',
    subType: ''
  });

  const handleAddItem = () => {
    if (!currentItem.description || !currentItem.amount) {
      toast.error('Please select a service and ensure amount is valid');
      return;
    }
    setInvoiceItems([...invoiceItems, { 
      description: currentItem.description, 
      amount: parseInt(currentItem.amount), 
      category: currentItem.category 
    }]);
    setCurrentItem({ category: '', description: '', amount: '', subType: '' });
  };

  const removeItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const totalInvoiceAmount = invoiceItems.reduce((sum, item) => sum + item.amount, 0);

  const handleCreateInvoice = () => {
    if (!newInvoice.patientId || invoiceItems.length === 0) {
      toast.error('Please select a patient and add at least one item');
      return;
    }
    const billToAdd = {
      id: `bill-${Date.now()}`,
      patientId: newInvoice.patientId,
      date: new Date().toISOString().split('T')[0],
      items: invoiceItems,
      totalAmount: totalInvoiceAmount,
      paidAmount: totalInvoiceAmount,
      status: 'Paid',
      paymentMode: newInvoice.paymentMode
    };
    setBills([billToAdd as any, ...bills]);
    setInvoiceItems([]);
    setNewInvoice({ patientId: '', paymentMode: 'Cash' });
    toast.success('Independent invoice generated');
  };

  const handleCategoryChange = (val: string) => {
    setCurrentItem({ category: val, description: '', amount: '', subType: '' });
  };

  const handleSubTypeChange = (val: string) => {
    let rate = 0;
    let description = '';

    if (currentItem.category === 'ot') {
      const found = MOCK_OT_RATES.find(r => r.type === val);
      rate = found?.rate || 0;
      description = `${val} Surgery Charges`;
    } else if (currentItem.category === 'ipd') {
      const found = MOCK_BED_RATES.find(r => r.type === val);
      rate = found?.rate || 0;
      description = `${val} Bed Charges (1 Day)`;
    } else if (currentItem.category === 'lab' || currentItem.category === 'path' || currentItem.category === 'radio') {
      const found = MOCK_LAB_TESTS.find(r => r.name === val);
      rate = found?.price || 0;
      description = val;
    } else if (currentItem.category === 'materials') {
      const found = MOCK_MATERIAL_RATES.find(r => r.name === val);
      rate = found?.price || 0;
      description = val;
    } else if (currentItem.category === 'opd') {
      rate = 500;
      description = 'OPD Consultation Fee';
    }

    setCurrentItem({ 
      ...currentItem, 
      subType: val, 
      amount: rate.toString(), 
      description: description 
    });
  };

  const filteredBills = bills.filter(bill => {
    const patient = MOCK_PATIENTS.find(p => p.id === bill.patientId);
    const searchMatch = 
      bill.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient?.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (patient?.mrn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (patient?.phone.includes(searchQuery));
    
    const categoryMatch = filterCategory === 'all' || bill.items.some(item => item.category === filterCategory);
    
    return searchMatch && categoryMatch;
  });

  const groupedBillsByDate = bills.reduce((acc: Record<string, BillingRecord[]>, bill) => {
    const dateKey = bill.date; // Use the ISO date string for grouping/sorting
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(bill);
    return acc;
  }, {});

  const handleDeleteBill = (id: string) => {
    setBills(bills.filter(b => b.id !== id));
    toast.success('Invoice cancelled');
  };

  const handleExportBilling = () => {
    const headers = ['Invoice ID', 'Patient MRN', 'Date', 'Amount', 'Status', 'Mode'];
    const rows = bills.map(b => [
      b.id,
      MOCK_PATIENTS.find(p => p.id === b.patientId)?.mrn || 'N/A',
      b.date,
      b.totalAmount,
      b.status,
      b.paymentMode || 'N/A'
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'hospital_billing.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Billing data exported');
  };

  const printInvoice = (bill: any) => {
    const patient = MOCK_PATIENTS.find(p => p.id === bill.patientId);
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (!printWindow) {
      toast.error('Please allow popups to print invoice');
      return;
    }

    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - ${bill.id}</title>
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
          </style>
        </head>
        <body>
          <div class="header text-center">
            <div class="bold" style="font-size: 16px;">GLOBAL HOSPITAL</div>
            <div>Accounts Department</div>
            <div>Tel: +91 1234567890</div>
          </div>
          
          <div class="divider"></div>
          
          <div>Inv: #${bill.id.toUpperCase()}</div>
          <div>Date: ${formatDate(bill.date)}</div>
          <div>Patient: ${patient?.name || 'Walk-in'}</div>
          <div>MRN: ${patient?.mrn || 'N/A'}</div>
          
          <div class="divider"></div>
          
          <div style="margin: 10px 0;">
            <div class="bold">Service Details:</div>
            <div>Hospital Services & Charges</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="text-right">
            <div class="bold" style="font-size: 14px;">TOTAL: ${formatCurrency(bill.totalAmount)}</div>
            <div>Status: ${bill.status}</div>
            <div>Mode: ${bill.paymentMode || 'N/A'}</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="footer text-center">
            <div>Thank You!</div>
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

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Centralized Account Office</h1>
          <p className="text-muted-foreground">Main hospital revenue collection for OPD, IPD, and OT. Monitoring Pharmacy & Lab collections.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportBilling}>
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <DialogTrigger render={
              <Button variant="outline" className="gap-2">
                <History className="w-4 h-4" />
                History
              </Button>
            } />
            <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0">
              <DialogHeader className="p-6 border-b">
                <DialogTitle>Daily Transaction History</DialogTitle>
                <DialogDescription>Viewing all transactions grouped by date.</DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-8">
                  {Object.entries(groupedBillsByDate).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()).map(([dateKey, dayBills]) => {
                    const typedDayBills = dayBills as BillingRecord[];
                    return (
                    <div key={dateKey} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-medical-blue">{formatDate(dateKey)}</Badge>
                        <Separator className="flex-1" />
                        <span className="text-xs font-bold text-muted-foreground">
                          {typedDayBills.length} Transactions | {formatCurrency(typedDayBills.reduce((sum, b) => sum + b.totalAmount, 0))}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {typedDayBills.map((bill) => {
                          const patient = MOCK_PATIENTS.find(p => p.id === bill.patientId);
                          return (
                            <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="text-xs font-bold text-medical-blue">#{bill.id.split('-')[1]?.substring(0, 6) || bill.id.substring(bill.id.length-6)}</div>
                                <div>
                                  <p className="text-sm font-semibold">{patient?.name}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase">{bill.items[0]?.category || 'General'} Charge</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold">{formatCurrency(bill.totalAmount)}</p>
                                <Badge variant="outline" className="text-[8px] h-4">{bill.paymentMode}</Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                  })}
                </div>
              </ScrollArea>
              <DialogFooter className="p-6 border-t">
                <Button variant="outline" onClick={() => setIsHistoryOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger render={
              <Button className="bg-medical-blue gap-2">
                <Plus className="w-4 h-4" />
                Create New Invoice
              </Button>
            } />
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Independent Billing & Invoicing</DialogTitle>
                <DialogDescription>Add multiple services and items to create a manual invoice.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-2">
                  <Label>Select Patient</Label>
                  <Select value={newInvoice.patientId} onValueChange={(v) => setNewInvoice({...newInvoice, patientId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Search patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_PATIENTS.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.mrn})</SelectItem>)}
                    </SelectContent>
                  </Select>
                  
                  {newInvoice.patientId && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-1 mt-2 animate-in fade-in slide-in-from-top-1 text-[11px]">
                      {(() => {
                        const p = MOCK_PATIENTS.find(pat => pat.id === newInvoice.patientId);
                        const doctor = MOCK_USERS.find(u => u.id === p?.attendingDoctorId);
                        return (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-400 uppercase tracking-wider">Patient Info</span>
                              <Badge variant="outline" className="text-[8px]">{doctor?.department || 'General'}</Badge>
                            </div>
                            <p className="font-bold text-slate-700">{p?.name}</p>
                            <div className="flex gap-4 text-slate-500">
                              <span>Ph: {p?.phone}</span>
                              <span>MRN: {p?.mrn}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <Separator />
                
                <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-100">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Add Service / Item</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Category</Label>
                      <Select value={currentItem.category} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="opd">OPD Consultation</SelectItem>
                          <SelectItem value="ipd">IPD / Ward</SelectItem>
                          <SelectItem value="ot">Surgery / OT</SelectItem>
                          <SelectItem value="lab">Pathology / Lab</SelectItem>
                          <SelectItem value="radio">Radiology</SelectItem>
                          <SelectItem value="materials">Materials / Disposables</SelectItem>
                          <SelectItem value="pharmacy">Pharmacy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {currentItem.category && (
                      <div className="space-y-1.5 animate-in fade-in zoom-in-95">
                        <Label className="text-xs">Service / Item</Label>
                        <Select value={currentItem.subType} onValueChange={handleSubTypeChange}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentItem.category === 'ot' && MOCK_OT_RATES.map(r => <SelectItem key={r.type} value={r.type}>{r.type} Surgery</SelectItem>)}
                            {currentItem.category === 'ipd' && MOCK_BED_RATES.map(r => <SelectItem key={r.type} value={r.type}>{r.type} Bed</SelectItem>)}
                            {(currentItem.category === 'lab' || currentItem.category === 'path') && MOCK_LAB_TESTS.filter(t => t.category === 'Pathology').map(t => <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>)}
                            {currentItem.category === 'radio' && MOCK_LAB_TESTS.filter(t => t.category === 'Radiology').map(t => <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>)}
                            {currentItem.category === 'materials' && MOCK_MATERIAL_RATES.map(t => <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>)}
                            {currentItem.category === 'opd' && <SelectItem value="OPD Consultation">Standard OPD</SelectItem>}
                            {currentItem.category === 'pharmacy' && <SelectItem value="Pharmacy Bill">Manual Pharma Entry</SelectItem>}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1.5">
                      <Label className="text-xs">Description</Label>
                      <Input 
                        className="h-8" 
                        value={currentItem.description} 
                        onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Rate (₹)</Label>
                      <Input 
                        type="number"
                        className="h-8" 
                        value={currentItem.amount} 
                        onChange={(e) => setCurrentItem({...currentItem, amount: e.target.value})} 
                      />
                    </div>
                  </div>
                  <Button className="w-full h-8 bg-slate-800 text-xs" onClick={handleAddItem}>Add to Invoice</Button>
                </div>

                {invoiceItems.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Invoice Items</p>
                    <div className="space-y-2">
                      {invoiceItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-100 rounded-lg text-xs">
                          <div className="flex-1">
                            <span className="font-bold">{item.description}</span>
                            <Badge variant="secondary" className="ml-2 text-[8px] h-3 uppercase">{item.category}</Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold">₹{item.amount}</span>
                            <Button variant="ghost" size="icon" className="h-5 w-5 text-rose-500" onClick={() => removeItem(idx)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center p-3 bg-medical-blue/5 rounded-xl border border-medical-blue/10">
                      <span className="text-sm font-bold text-medical-blue uppercase tracking-wider">Total Amount</span>
                      <span className="text-lg font-bold text-medical-blue">₹{totalInvoiceAmount}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Payment Mode</Label>
                  <Select value={newInvoice.paymentMode} onValueChange={(v) => setNewInvoice({...newInvoice, paymentMode: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="UPI">UPI / QR</SelectItem>
                      <SelectItem value="Card">Credit/Debit Card</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setInvoiceItems([]); setNewInvoice({ patientId: '', paymentMode: 'Cash' }); }}>Discard</Button>
                <Button className="bg-medical-blue" onClick={handleCreateInvoice} disabled={invoiceItems.length === 0}>Generate Bill</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-medical-blue/5">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Total Hospital Revenue</p>
            <h3 className="text-2xl font-bold text-medical-blue">₹1,42,250</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Aggregated from all departments</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Main Office Collection</p>
            <h3 className="text-2xl font-bold text-emerald-600">₹84,250</h3>
            <p className="text-[10px] text-muted-foreground mt-1">OPD, IPD, OT Services</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Pharmacy Revenue</p>
            <h3 className="text-2xl font-bold text-teal-600">₹32,500</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Collected at Pharmacy POS</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Lab & Radiology</p>
            <h3 className="text-2xl font-bold text-purple-600">₹25,500</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Collected at Lab Counter</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Recent Invoices</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search name, MRN, phone..." 
                className="pl-10 bg-slate-50 border-none h-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[140px] h-9 bg-white border-slate-200">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="opd">OPD</SelectItem>
                <SelectItem value="ipd">IPD</SelectItem>
                <SelectItem value="lab">Lab</SelectItem>
                <SelectItem value="pharmacy">Pharmacy</SelectItem>
                <SelectItem value="ot">OT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                  <TableHead className="whitespace-nowrap">Invoice ID</TableHead>
                  <TableHead className="whitespace-nowrap">Patient Details</TableHead>
                  <TableHead className="whitespace-nowrap">Department</TableHead>
                  <TableHead className="whitespace-nowrap">Contact Info</TableHead>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead className="whitespace-nowrap">Amount</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => {
                  const patient = MOCK_PATIENTS.find(p => p.id === bill.patientId);
                  const doctor = MOCK_USERS.find(u => u.id === patient?.attendingDoctorId);
                  return (
                    <TableRow key={bill.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-bold text-medical-blue whitespace-nowrap">#{bill.id.startsWith('bill-') ? bill.id.split('-')[1].substring(0, 6) : bill.id.toUpperCase()}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{patient?.name || 'Walk-in'}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{patient?.mrn || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline" className="text-[10px] font-semibold border-blue-100 bg-blue-50 text-blue-700">
                          {doctor?.department || 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col text-[11px]">
                          <span className="text-slate-600 font-medium">{patient?.phone}</span>
                          <span className="text-slate-400">{patient?.email || 'No email provided'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(bill.date)}</TableCell>
                      <TableCell className="font-bold whitespace-nowrap">{formatCurrency(bill.totalAmount)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="secondary" className={`border-none ${
                          bill.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                          bill.status === 'Partial' ? 'bg-amber-50 text-amber-600' :
                          'bg-rose-50 text-rose-600'
                        }`}>
                          {bill.status === 'Paid' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : 
                           bill.status === 'Partial' ? <Clock className="w-3 h-3 mr-1" /> : 
                           <AlertCircle className="w-3 h-3 mr-1" />}
                          {bill.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase">{bill.paymentMode || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-medical-blue" title="Patient 360 Overview" onClick={() => window.location.href = `/patient-overview?id=${bill.patientId}`}>
                            <Search className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => printInvoice(bill)}>
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-medical-blue" onClick={() => toast.info('Editing invoice...')}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDeleteBill(bill.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
