import { useState } from 'react';
import { 
  Baby, 
  Heart, 
  Activity, 
  Calendar, 
  Plus, 
  Search, 
  MoreVertical,
  History,
  ClipboardList,
  Stethoscope,
  Download,
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function Maternity() {
  const [mothers, setMothers] = useState([
    { id: 1, name: 'Sunita Devi', edd: '2024-05-12', status: 'Prenatal' },
    { id: 2, name: 'Priya Singh', edd: '2024-04-25', status: 'Admitted' },
    { id: 3, name: 'Kavita Reddy', edd: '2024-06-02', status: 'Prenatal' },
  ]);
  const [newDelivery, setNewDelivery] = useState({ motherId: '', date: '', time: '', gender: 'male', weight: 3.0, type: 'normal' });

  const handleAddDelivery = () => {
    if (!newDelivery.motherId || !newDelivery.date) {
      toast.error('Please fill in required fields');
      return;
    }
    // In a real app, this would add to a deliveries collection
    toast.success('Delivery record added successfully');
  };

  const handleDeleteMother = (id: number) => {
    setMothers(mothers.filter(m => m.id !== id));
    toast.success('Maternity record removed');
  };

  const handleExportMaternity = () => {
    const headers = ['Mother Name', 'EDD', 'Status'];
    const rows = mothers.map(m => [m.name, m.edd, m.status]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'maternity_records.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Maternity records exported');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maternity Module</h1>
          <p className="text-muted-foreground">Specialized care for mothers and newborns.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportMaternity}>
            <Download className="w-4 h-4" />
            Export Records
          </Button>
          <Dialog>
            <DialogTrigger render={
              <Button className="bg-pink-500 hover:bg-pink-600 gap-2">
                <Plus className="w-4 h-4" />
                New Delivery Record
              </Button>
            } />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Delivery Record</DialogTitle>
                <DialogDescription>Record a new birth or delivery details.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Mother Name</Label>
                  <Select 
                    value={newDelivery.motherId}
                    onValueChange={(v) => setNewDelivery({...newDelivery, motherId: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mother" />
                    </SelectTrigger>
                    <SelectContent>
                      {mothers.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Delivery</Label>
                    <Input 
                      type="date" 
                      value={newDelivery.date}
                      onChange={(e) => setNewDelivery({...newDelivery, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input 
                      type="time" 
                      value={newDelivery.time}
                      onChange={(e) => setNewDelivery({...newDelivery, time: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Baby Gender</Label>
                    <Select 
                      value={newDelivery.gender}
                      onValueChange={(v) => setNewDelivery({...newDelivery, gender: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      placeholder="3.0" 
                      value={newDelivery.weight}
                      onChange={(e) => setNewDelivery({...newDelivery, weight: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Delivery Type</Label>
                  <Select 
                    value={newDelivery.type}
                    onValueChange={(v) => setNewDelivery({...newDelivery, type: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal Delivery</SelectItem>
                      <SelectItem value="cesarean">C-Section (LSCS)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={handleAddDelivery}>Save Record</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-pink-50/30">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-pink-600 font-bold uppercase tracking-wider mb-1">Active Mother Cases</p>
              <h3 className="text-3xl font-bold text-pink-700">14</h3>
            </div>
            <div className="p-3 rounded-xl bg-pink-100 text-pink-600">
              <Heart className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-blue-50/30">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Newborns (This Month)</p>
              <h3 className="text-3xl font-bold text-blue-700">28</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <Baby className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-purple-50/30">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">Scheduled Deliveries</p>
              <h3 className="text-3xl font-bold text-purple-700">6</h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
              <Calendar className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-pink-500" />
              Recent Mother Profiles
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="whitespace-nowrap">Mother Name</TableHead>
                    <TableHead className="whitespace-nowrap">EDD (Expected Date)</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mothers.map((mother) => (
                    <TableRow key={mother.id} className="border-slate-50">
                      <TableCell className="font-medium whitespace-nowrap">{mother.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{mother.edd}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="secondary" className={`border-none ${
                          mother.status === 'Admitted' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {mother.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-medical-blue" onClick={() => toast.info('Editing record...')}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDeleteMother(mother.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Newborn Health Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Baby of Priya', weight: '3.2kg', time: '2 hours ago', status: 'Stable' },
                { name: 'Baby of Sunita', weight: '2.8kg', time: '5 hours ago', status: 'Observation' },
              ].map((baby, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Baby className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{baby.name}</p>
                      <p className="text-xs text-muted-foreground">Weight: {baby.weight} • {baby.time}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={baby.status === 'Stable' ? 'text-emerald-600 border-emerald-200' : 'text-amber-600 border-amber-200'}>
                    {baby.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-xs text-medical-blue">View All Baby Records</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
