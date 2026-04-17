import { useState } from 'react';
import { 
  FlaskConical, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Printer,
  Share2,
  Image as ImageIcon,
  Download,
  CreditCard,
  Receipt,
  Edit,
  Trash2
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MOCK_PATIENTS, MOCK_LAB_TESTS } from '@/mockData';
import { formatDate, formatCurrency } from '@/lib/utils';

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

export default function Lab() {
  const [activeTab, setActiveTab] = useState<'pathology' | 'radiology'>('pathology');
  const [mainTab, setMainTab] = useState<'orders' | 'billing'>('orders');

  // Billing State
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedTests, setSelectedTests] = useState<{id: string, name: string, price: number}[]>([]);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [bills, setBills] = useState([
    { id: 'LB-1001', patient: 'Sunita Devi', date: '2024-04-10', amount: 1200, status: 'Paid' },
    { id: 'LB-1002', patient: 'Rajesh Kumar', date: '2024-04-10', amount: 450, status: 'Paid' },
    { id: 'LB-1003', patient: 'Priya Singh', date: '2024-04-11', amount: 2800, status: 'Paid' },
  ]);

  const addTestToBill = (testId: string) => {
    const test = MOCK_LAB_TESTS.find(t => t.id === testId);
    if (test) {
      setSelectedTests([...selectedTests, { id: test.id, name: test.name, price: test.price }]);
    }
  };

  const removeTestFromBill = (index: number) => {
    const newTests = [...selectedTests];
    newTests.splice(index, 1);
    setSelectedTests(newTests);
  };

  const totalBillAmount = selectedTests.reduce((sum, t) => sum + t.price, 0);

  const resetBilling = () => {
    setSelectedPatient('');
    setSelectedTests([]);
    setPaymentMode('cash');
  };

  const handleDeleteBill = (id: string) => {
    setBills(bills.filter(b => b.id !== id));
    toast.success('Lab bill removed');
  };

  const handleExportLab = () => {
    const headers = ['Bill ID', 'Patient', 'Date', 'Amount', 'Status'];
    const rows = bills.map(b => [b.id, b.patient, b.date, b.amount, b.status]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'lab_billing.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Lab billing data exported');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lab & Radiology</h1>
          <p className="text-muted-foreground">Diagnostic tests, sample collection, and separate counter billing.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportLab}>
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button 
            variant={mainTab === 'billing' ? 'secondary' : 'outline'} 
            className="gap-2"
            onClick={() => setMainTab(mainTab === 'billing' ? 'orders' : 'billing')}
          >
            <Receipt className="w-4 h-4" />
            {mainTab === 'billing' ? 'View Orders' : 'Lab Billing'}
          </Button>
          <Dialog>
            <DialogTrigger render={
              <Button className="bg-medical-blue gap-2">
                <Plus className="w-4 h-4" />
                New Test Order
              </Button>
            } />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>New Diagnostic Test Order</DialogTitle>
                <DialogDescription>Order pathology or radiology tests for a patient.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_PATIENTS.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.mrn})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Test Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pathology">Pathology (Blood/Urine/etc)</SelectItem>
                      <SelectItem value="radiology">Radiology (X-Ray/USG/CT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Test Name</Label>
                  <Input placeholder="e.g. CBC, Chest X-Ray, LFT" />
                </div>
                <div className="space-y-2">
                  <Label>Urgency</Label>
                  <Select defaultValue="routine">
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="stat">STAT (Emergency)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button className="bg-medical-blue" onClick={() => toast.success('Test order placed successfully')}>Place Order</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {mainTab === 'orders' ? (
        <>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
            <Button 
              variant={activeTab === 'pathology' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveTab('pathology')}
              className={activeTab === 'pathology' ? 'bg-white shadow-sm' : ''}
            >
              Pathology
            </Button>
            <Button 
              variant={activeTab === 'radiology' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveTab('radiology')}
              className={activeTab === 'radiology' ? 'bg-white shadow-sm' : ''}
            >
              Radiology (X-Ray/USG)
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Pending Samples</p>
                <h3 className="text-xl font-bold text-amber-600">12</h3>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">In Processing</p>
                <h3 className="text-xl font-bold text-blue-600">8</h3>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Reports Ready</p>
                <h3 className="text-xl font-bold text-emerald-600">24</h3>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Critical Results</p>
                <h3 className="text-xl font-bold text-rose-600">2</h3>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg">Test Orders</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search patient or MRN..." className="pl-10 bg-slate-50 border-none h-9" />
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
                      <TableHead className="whitespace-nowrap">Order ID</TableHead>
                      <TableHead className="whitespace-nowrap">Patient</TableHead>
                      <TableHead className="whitespace-nowrap">Test Name</TableHead>
                      <TableHead className="whitespace-nowrap">Ordered By</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { id: 'LAB-001', patient: 'Alice Smith', test: 'Complete Blood Count (CBC)', doctor: 'Dr. Sarah Johnson', status: 'Completed', date: '2024-04-10' },
                      { id: 'LAB-002', patient: 'Bob Brown', test: 'Liver Function Test (LFT)', doctor: 'Dr. Sarah Johnson', status: 'Processing', date: '2024-04-10' },
                      { id: 'RAD-001', patient: 'Alice Smith', test: 'Chest X-Ray', doctor: 'Dr. Sarah Johnson', status: 'Sample Collected', date: '2024-04-10' },
                    ].filter(t => activeTab === 'pathology' ? !t.id.startsWith('RAD') : t.id.startsWith('RAD')).map((test) => (
                      <TableRow key={test.id} className="border-slate-50">
                        <TableCell className="font-medium text-medical-blue whitespace-nowrap">#{test.id}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div>
                            <p className="font-medium">{test.patient}</p>
                            <p className="text-[10px] text-muted-foreground">{formatDate(test.date)}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{test.test}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{test.doctor}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="secondary" className={`border-none ${
                            test.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                            test.status === 'Processing' ? 'bg-blue-50 text-blue-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {test.status === 'Completed' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : 
                             test.status === 'Processing' ? <Clock className="w-3 h-3 mr-1" /> : 
                             <AlertCircle className="w-3 h-3 mr-1" />}
                            {test.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            {test.status === 'Completed' && (
                              <>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-medical-blue">
                                  <FileText className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Printer className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {activeTab === 'radiology' && (
                              <Dialog>
                                <DialogTrigger render={
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <ImageIcon className="w-4 h-4" />
                                  </Button>
                                } />
                                <DialogContent className="sm:max-w-[600px]">
                                  <DialogHeader>
                                    <DialogTitle>Radiology Image Viewer</DialogTitle>
                                    <DialogDescription>Viewing digital X-Ray for {test.patient}</DialogDescription>
                                  </DialogHeader>
                                  <div className="aspect-square rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-800">
                                    <img 
                                      src="https://picsum.photos/seed/xray/800/800" 
                                      alt="X-Ray" 
                                      className="w-full h-full object-contain opacity-80"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <DialogFooter className="flex justify-between sm:justify-between">
                                    <Button variant="outline" size="sm" className="gap-2">
                                      <Download className="w-4 h-4" />
                                      Download DICOM
                                    </Button>
                                    <Button className="bg-medical-blue" onClick={() => toast.success('Report shared with doctor')}>Share with Doctor</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Today's Lab Collection</p>
                <h3 className="text-3xl font-bold text-purple-600">₹25,500</h3>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Pending Lab Bills</p>
                <h3 className="text-3xl font-bold text-amber-600">₹4,200</h3>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Total Tests Billed</p>
                <h3 className="text-3xl font-bold text-blue-600">42</h3>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg">Lab Billing History</CardTitle>
              <Dialog onOpenChange={(open) => !open && resetBilling()}>
                <DialogTrigger render={
                  <Button className="bg-medical-blue gap-2 h-9">
                    <Plus className="w-4 h-4" />
                    New Lab Bill
                  </Button>
                } />
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Generate Lab Bill</DialogTitle>
                    <DialogDescription>Collect payment for lab services.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Patient</Label>
                        <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {MOCK_PATIENTS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Add Test</Label>
                        <Select onValueChange={addTestToBill}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select test to add" />
                          </SelectTrigger>
                          <SelectContent>
                            {MOCK_LAB_TESTS.map(t => (
                              <SelectItem key={t.id} value={t.id}>{t.name} (₹{t.price})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow>
                            <TableHead className="h-9">Test Name</TableHead>
                            <TableHead className="h-9 text-right">Price</TableHead>
                            <TableHead className="h-9 w-10"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedTests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-muted-foreground py-4">No tests added yet</TableCell>
                            </TableRow>
                          ) : (
                            selectedTests.map((test, idx) => (
                              <TableRow key={`${test.id}-${idx}`}>
                                <TableCell className="py-2">{test.name}</TableCell>
                                <TableCell className="py-2 text-right">{formatCurrency(test.price)}</TableCell>
                                <TableCell className="py-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-rose-500"
                                    onClick={() => removeTestFromBill(idx)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-medical-blue/5 rounded-lg border border-medical-blue/10">
                      <span className="font-bold">Total Amount:</span>
                      <span className="text-xl font-bold text-medical-blue">{formatCurrency(totalBillAmount)}</span>
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Mode</Label>
                      <Select value={paymentMode} onValueChange={setPaymentMode}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="upi">UPI / QR</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={resetBilling}>Reset</Button>
                    <Button 
                      className="bg-medical-blue" 
                      onClick={() => {
                        toast.success('Lab payment collected successfully');
                        resetBilling();
                      }}
                      disabled={!selectedPatient || selectedTests.length === 0}
                    >
                      Collect {formatCurrency(totalBillAmount)}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead className="whitespace-nowrap">Bill ID</TableHead>
                      <TableHead className="whitespace-nowrap">Patient</TableHead>
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                      <TableHead className="whitespace-nowrap">Amount</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.id} className="border-slate-50">
                        <TableCell className="font-medium text-medical-blue whitespace-nowrap">#{bill.id}</TableCell>
                        <TableCell className="whitespace-nowrap">{bill.patient}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(bill.date)}</TableCell>
                        <TableCell className="font-bold whitespace-nowrap">{formatCurrency(bill.amount)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none">
                            {bill.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success('Printing bill...')}>
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDeleteBill(bill.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
