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
import { MOCK_BILLING, MOCK_PATIENTS, MOCK_OT_RATES, MOCK_BED_RATES } from '@/mockData';
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
  const [newInvoice, setNewInvoice] = useState({
    patientId: '',
    category: '',
    amount: '',
    paymentMode: '',
    otType: '',
    bedType: ''
  });

  const handleCategoryChange = (val: string) => {
    setNewInvoice({ ...newInvoice, category: val, amount: '', otType: '', bedType: '' });
  };

  const handleOtTypeChange = (val: string) => {
    const rate = MOCK_OT_RATES.find(r => r.type === val)?.rate || 0;
    setNewInvoice({ ...newInvoice, otType: val, amount: rate.toString() });
  };

  const handleBedTypeChange = (val: string) => {
    const rate = MOCK_BED_RATES.find(r => r.type === val)?.rate || 0;
    // Default to 1 day for manual billing
    setNewInvoice({ ...newInvoice, bedType: val, amount: rate.toString() });
  };

  const handleCreateInvoice = () => {
    if (!newInvoice.patientId || !newInvoice.amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    const billToAdd = {
      id: `bill-${Date.now()}`,
      patientId: newInvoice.patientId,
      date: new Date().toISOString().split('T')[0],
      items: [{ description: `${newInvoice.category.toUpperCase()} Charges`, amount: parseInt(newInvoice.amount), category: newInvoice.category }],
      totalAmount: parseInt(newInvoice.amount),
      paidAmount: parseInt(newInvoice.amount),
      status: 'Paid',
      paymentMode: newInvoice.paymentMode
    };
    setBills([billToAdd as any, ...bills]);
    toast.success('Invoice generated successfully');
  };

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
            <div class="bold" style="font-size: 16px;">DC GLOBAL HOSPITAL</div>
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
            <div style="margin-top: 5px;">Powered by DC Global HMS</div>
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
            Export Billing
          </Button>
          <Button variant="outline" className="gap-2">
            <History className="w-4 h-4" />
            Transaction History
          </Button>
          <Dialog>
            <DialogTrigger render={
              <Button className="bg-medical-blue gap-2">
                <Plus className="w-4 h-4" />
                Create New Invoice
              </Button>
            } />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>Generate a bill for services rendered.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select value={newInvoice.patientId} onValueChange={(v) => setNewInvoice({...newInvoice, patientId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_PATIENTS.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.mrn})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Service Category</Label>
                  <Select value={newInvoice.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="opd">OPD Consultation</SelectItem>
                      <SelectItem value="ipd">IPD / Ward Charges</SelectItem>
                      <SelectItem value="lab">Laboratory Tests</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy / Medicine</SelectItem>
                      <SelectItem value="ot">OT / Surgery Charges</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newInvoice.category === 'ot' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                    <Label>OT Surgery Type</Label>
                    <Select value={newInvoice.otType} onValueChange={handleOtTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select surgery type" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_OT_RATES.map(r => <SelectItem key={r.type} value={r.type}>{r.type} Surgery (₹{r.rate})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newInvoice.category === 'ipd' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                    <Label>Ward / Bed Type</Label>
                    <Select value={newInvoice.bedType} onValueChange={handleBedTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bed type" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_BED_RATES.map(r => <SelectItem key={r.type} value={r.type}>{r.type} Bed (₹{r.rate}/day)</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={newInvoice.amount} 
                    onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})} 
                  />
                </div>
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
                <Button variant="outline">Cancel</Button>
                <Button className="bg-medical-blue" onClick={handleCreateInvoice}>Generate Invoice</Button>
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
                placeholder="Search invoice or MRN..." 
                className="pl-10 bg-slate-50 border-none h-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="whitespace-nowrap">Invoice ID</TableHead>
                  <TableHead className="whitespace-nowrap">Patient</TableHead>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead className="whitespace-nowrap">Amount</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Mode</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => {
                  const patient = MOCK_PATIENTS.find(p => p.id === bill.patientId);
                  return (
                    <TableRow key={bill.id} className="border-slate-50">
                      <TableCell className="font-medium text-medical-blue whitespace-nowrap">#{bill.id.toUpperCase()}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div>
                          <p className="font-medium">{patient?.name}</p>
                          <p className="text-xs text-muted-foreground">{patient?.mrn}</p>
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
