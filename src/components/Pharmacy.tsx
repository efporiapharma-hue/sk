import { useState } from 'react';
import { 
  Pill, 
  Search, 
  Plus, 
  AlertTriangle, 
  Package, 
  History, 
  ArrowRight,
  ShoppingCart,
  Calendar,
  CreditCard,
  Download,
  Printer,
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
import { Separator } from '@/components/ui/separator';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MOCK_INVENTORY, MOCK_PATIENTS, MOCK_PHARMACY_BILLING } from '@/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function Pharmacy() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const [bills, setBills] = useState(MOCK_PHARMACY_BILLING);
  const [searchQuery, setSearchQuery] = useState('');
  const [newItem, setNewItem] = useState({ name: '', category: 'Medicine', stock: 0, unit: 'Tablets', minStockLevel: 10 });

  const handleAddItem = () => {
    if (!newItem.name) {
      toast.error('Please enter item name');
      return;
    }
    const itemToAdd = {
      ...newItem,
      id: `item-${Date.now()}`,
      expiryDate: '2025-12-31'
    };
    setInventory([...inventory, itemToAdd]);
    setNewItem({ name: '', category: 'Medicine', stock: 0, unit: 'Tablets', minStockLevel: 10 });
    toast.success('New item added to inventory');
  };

  const handleDeleteItem = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
    toast.success('Item removed from inventory');
  };

  const handleExportInventory = () => {
    const headers = ['Name', 'Category', 'Stock', 'Unit', 'Min Level', 'Expiry Date'];
    const rows = inventory.map(item => [
      item.name,
      item.category,
      item.stock,
      item.unit,
      item.minStockLevel,
      item.expiryDate || 'N/A'
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'pharmacy_inventory.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Inventory exported as CSV');
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pharmacy Management</h1>
          <p className="text-muted-foreground">Inventory tracking, medicine sales, and stock alerts.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/pharmacy/pos">
            <Button className="bg-teal-accent hover:bg-teal-600 gap-2">
              <ShoppingCart className="w-4 h-4" />
              Open POS Terminal
            </Button>
          </Link>
          <Button variant="outline" className="gap-2" onClick={handleExportInventory}>
            <Download className="w-4 h-4" />
            Export Inventory
          </Button>
          <Dialog>
            <DialogTrigger render={
              <Button variant="outline" className="gap-2">
                <History className="w-4 h-4" />
                Purchase Stock
              </Button>
            } />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Purchase New Stock</DialogTitle>
                <DialogDescription>Record a new purchase from a supplier.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Medicine / Item</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventory.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Purchase Price (₹)</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Supplier Name</Label>
                  <Input placeholder="Enter supplier name" />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input type="date" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button className="bg-medical-blue" onClick={() => toast.success('Stock purchase recorded')}>Record Purchase</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger render={
              <Button className="bg-medical-blue gap-2">
                <Plus className="w-4 h-4" />
                Add New Stock
              </Button>
            } />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Medicine/Item</DialogTitle>
                <DialogDescription>Add a new item to the pharmacy inventory.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Item Name</Label>
                  <Input 
                    placeholder="e.g. Ibuprofen 400mg" 
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={newItem.category}
                    onValueChange={(v) => setNewItem({...newItem, category: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Medicine">Medicine</SelectItem>
                      <SelectItem value="Surgical">Surgical</SelectItem>
                      <SelectItem value="Consumable">Consumable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Initial Stock</Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={newItem.stock}
                      onChange={(e) => setNewItem({...newItem, stock: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input 
                      placeholder="e.g. Tablets, Bottles" 
                      value={newItem.unit}
                      onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Min Stock Level</Label>
                  <Input 
                    type="number" 
                    placeholder="10" 
                    value={newItem.minStockLevel}
                    onChange={(e) => setNewItem({...newItem, minStockLevel: Number(e.target.value)})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button className="bg-medical-blue" onClick={handleAddItem}>Add Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="inventory" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="billing">Pharmacy Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Inventory Items</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <h3 className="text-3xl font-bold">{inventory.length}</h3>
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                  <Package className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Low Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <h3 className="text-3xl font-bold text-amber-600">
                  {inventory.filter(i => i.stock <= i.minStockLevel).length}
                </h3>
                <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Expiring Soon (30 Days)</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <h3 className="text-3xl font-bold text-rose-600">5</h3>
                <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
                  <Calendar className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg">Medicine Inventory</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search medicine..." 
                    className="pl-10 bg-slate-50 border-none h-9" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Link to="/pharmacy/pos">
                  <Button className="bg-teal-accent hover:bg-teal-600 h-9 gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    New Sale (POS)
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead className="whitespace-nowrap">Medicine Name</TableHead>
                      <TableHead className="whitespace-nowrap">Category</TableHead>
                      <TableHead className="whitespace-nowrap">Stock</TableHead>
                      <TableHead className="whitespace-nowrap">Expiry Date</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item.id} className="border-slate-50">
                        <TableCell className="font-medium whitespace-nowrap">{item.name}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="outline" className="text-[10px] font-bold uppercase">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold">{item.stock} {item.unit}</span>
                            <span className="text-[10px] text-muted-foreground">Min Level: {item.minStockLevel}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {item.expiryDate ? formatDate(item.expiryDate) : 'N/A'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="secondary" className={`border-none ${
                            item.stock > item.minStockLevel ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {item.stock > item.minStockLevel ? 'In Stock' : 'Low Stock'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Dialog>
                            <DialogTrigger render={
                              <Button variant="ghost" size="sm" className="text-medical-blue gap-1 h-8">
                                Manage
                                <ArrowRight className="w-3 h-3" />
                              </Button>
                            } />
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Manage Stock: {item.name}</DialogTitle>
                                <DialogDescription>Update stock levels or edit item details.</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Current Stock</Label>
                                    <Input type="number" defaultValue={item.stock} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Min Stock Level</Label>
                                    <Input type="number" defaultValue={item.minStockLevel} />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Expiry Date</Label>
                                  <Input type="date" defaultValue={item.expiryDate} />
                                </div>
                              </div>
                              <DialogFooter className="flex justify-between sm:justify-between">
                                <Button 
                                  variant="ghost" 
                                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Item
                                </Button>
                                <div className="flex gap-2">
                                  <Button variant="outline">Cancel</Button>
                                  <Button className="bg-medical-blue" onClick={() => toast.success('Stock updated successfully')}>Update Stock</Button>
                                </div>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg">Pharmacy Billing History</CardTitle>
                <CardDescription>View and manage pharmacy-specific invoices.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search invoice or MRN..." className="pl-10 bg-slate-50 border-none h-9" />
                </div>
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
                              <p className="font-medium">{patient?.name || 'Walk-in Customer'}</p>
                              <p className="text-xs text-muted-foreground">{patient?.mrn || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(bill.date)}</TableCell>
                          <TableCell className="font-bold whitespace-nowrap">{formatCurrency(bill.totalAmount)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none">
                              Paid
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success('Printing invoice...')}>
                                <Printer className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success('Downloading invoice...')}>
                                <Download className="w-4 h-4" />
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
