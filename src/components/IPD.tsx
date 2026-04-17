import { useState } from 'react';
import { 
  Bed as BedIcon, 
  UserPlus, 
  Plus,
  Search, 
  Filter, 
  MoreVertical, 
  Activity,
  History,
  FileText,
  LogOut,
  Download,
  Edit,
  Trash2,
  Stethoscope,
  ClipboardList,
  Pill,
  FlaskConical,
  CheckCircle2,
  Printer,
  ArrowLeftRight,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MOCK_BEDS, MOCK_PATIENTS, MOCK_BED_RATES } from '@/mockData';
import { formatCurrency } from '@/lib/utils';

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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function IPD() {
  const [view, setView] = useState<'beds' | 'admissions'>('beds');
  const [beds, setBeds] = useState(MOCK_BEDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddBedOpen, setIsAddBedOpen] = useState(false);
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferData, setTransferData] = useState({ patientId: '', fromBedId: '', toBedId: '' });
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [newBed, setNewBed] = useState({ number: '', ward: '', type: 'General' });

  const handleAddBed = () => {
    if (!newBed.number || !newBed.ward) {
      toast.error('Please fill in all fields');
      return;
    }
    const bedToAdd = {
      id: `b-${Date.now()}`,
      ...newBed,
      status: 'Available'
    };
    setBeds([...beds, bedToAdd as any]);
    setNewBed({ number: '', ward: '', type: 'General' });
    setIsAddBedOpen(false);
    toast.success('New bed added successfully');
  };

  const handleDeleteBed = (id: string) => {
    setBeds(beds.filter(b => b.id !== id));
    toast.success('Bed removed');
  };

  const handleExportIPD = () => {
    const headers = ['Bed Number', 'Ward', 'Status', 'Patient MRN'];
    const rows = beds.map(b => [
      b.number,
      b.ward,
      b.status,
      b.patientId ? MOCK_PATIENTS.find(p => p.id === b.patientId)?.mrn : 'N/A'
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'ipd_bed_status.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('IPD data exported');
  };

  const handleDischarge = (bedId: string) => {
    setBeds(beds.map(b => b.id === bedId ? { ...b, status: 'Available', patientId: undefined } : b));
    toast.success('Patient discharged and bed freed');
  };

  const handleTransfer = () => {
    if (!transferData.toBedId) {
      toast.error('Please select a target bed');
      return;
    }

    setBeds(beds.map(b => {
      if (b.id === transferData.fromBedId) {
        return { ...b, status: 'Available', patientId: undefined };
      }
      if (b.id === transferData.toBedId) {
        return { ...b, status: 'Occupied', patientId: transferData.patientId };
      }
      return b;
    }));

    setIsTransferOpen(false);
    toast.success('Patient transferred successfully');
  };

  const calculateBedCharges = (patientId: string) => {
    const bed = beds.find(b => b.patientId === patientId);
    if (!bed) return 0;
    const rate = MOCK_BED_RATES.find(r => r.type === bed.type)?.rate || 0;
    // Mocking 3 days of stay for demonstration
    return rate * 3;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">IPD Management</h1>
          <p className="text-muted-foreground">Manage admissions, bed allocation, and inpatient care.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportIPD}>
            <Download className="w-4 h-4" />
            Export Status
          </Button>
          <Dialog open={isAddBedOpen} onOpenChange={setIsAddBedOpen}>
            <DialogTrigger render={<Button variant="outline" className="gap-2" />}>
              <Plus className="w-4 h-4" />
              Add Bed
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Add New Bed</DialogTitle>
                <DialogDescription>Add a new bed to a ward or department.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Bed Number</Label>
                  <Input placeholder="e.g. 105" value={newBed.number} onChange={(e) => setNewBed({...newBed, number: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Ward / Department</Label>
                  <Select value={newBed.ward} onValueChange={(v) => setNewBed({...newBed, ward: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ward" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Ward A">General Ward A</SelectItem>
                      <SelectItem value="ICU">ICU</SelectItem>
                      <SelectItem value="Maternity">Maternity Ward</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bed Type</Label>
                  <Select value={newBed.type} onValueChange={(v) => setNewBed({...newBed, type: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="ICU">ICU</SelectItem>
                      <SelectItem value="Maternity">Maternity</SelectItem>
                      <SelectItem value="Semi-Private">Semi-Private</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button className="bg-medical-blue w-full" onClick={handleAddBed}>Add Bed</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger render={<Button className="bg-medical-blue gap-2" />}>
              <UserPlus className="w-4 h-4" />
              New Admission
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>New IPD Admission</DialogTitle>
                <DialogDescription>Allocate a bed and register a new inpatient.</DialogDescription>
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
                  <Label>Ward / Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ward" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Ward A</SelectItem>
                      <SelectItem value="icu">ICU</SelectItem>
                      <SelectItem value="maternity">Maternity Ward</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bed Number</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bed" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_BEDS.filter(b => b.status === 'Available').map(b => <SelectItem key={b.id} value={b.id}>Bed {b.number}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button className="bg-medical-blue" onClick={() => toast.success('Patient admitted successfully')}>Confirm Admission</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-blue-50/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <BedIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">24 / 40</p>
              <p className="text-xs text-muted-foreground font-medium uppercase">Beds Occupied</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-teal-50/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-teal-100 text-teal-600">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-muted-foreground font-medium uppercase">Today's Admissions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-amber-50/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-muted-foreground font-medium uppercase">Pending Discharges</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        <Button 
          variant={view === 'beds' ? 'secondary' : 'ghost'} 
          size="sm" 
          onClick={() => setView('beds')}
          className={view === 'beds' ? 'bg-white shadow-sm' : ''}
        >
          Bed Status
        </Button>
        <Button 
          variant={view === 'admissions' ? 'secondary' : 'ghost'} 
          size="sm" 
          onClick={() => setView('admissions')}
          className={view === 'admissions' ? 'bg-white shadow-sm' : ''}
        >
          Active Admissions
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {beds.map((bed) => {
          const patient = bed.patientId ? MOCK_PATIENTS.find(p => p.id === bed.patientId) : null;
          return (
            <Card key={bed.id} className={`border-none shadow-sm transition-all hover:ring-2 hover:ring-medical-blue/10 ${bed.status === 'Occupied' ? 'bg-white' : 'bg-slate-50/50'}`}>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-tight ${
                    bed.status === 'Available' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                    bed.status === 'Occupied' ? 'text-blue-600 bg-blue-50 border-blue-100' :
                    'text-amber-600 bg-amber-50 border-amber-100'
                  }`}>
                    {bed.status}
                  </Badge>
                  <div className="flex gap-1">
                    {bed.status === 'Occupied' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-medical-blue" 
                          title="Patient 360 Overview"
                          onClick={() => window.location.href = `/patient-overview?id=${patient.id}`}
                        >
                          <Activity className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-amber-500" 
                          title="Transfer Bed"
                          onClick={() => {
                            setTransferData({ patientId: bed.patientId!, fromBedId: bed.id, toBedId: '' });
                            setIsTransferOpen(true);
                          }}
                        >
                          <ArrowLeftRight className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-500" onClick={() => handleDischarge(bed.id)}>
                          <LogOut className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-500" onClick={() => handleDeleteBed(bed.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg mt-2">Bed {bed.number}</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold tracking-wider">{bed.ward}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                {patient ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {patient.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold truncate">{patient.name}</p>
                        <p className="text-[10px] text-muted-foreground">{patient.mrn}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Dialog>
                        <DialogTrigger render={<Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" />}>
                          <Activity className="w-3 h-3" />
                          Vitals
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Patient Vitals - {patient.name}</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">Blood Pressure</p>
                              <p className="text-lg font-bold">120/80 mmHg</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">Pulse Rate</p>
                              <p className="text-lg font-bold">78 bpm</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">Temperature</p>
                              <p className="text-lg font-bold">98.6 °F</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">SpO2</p>
                              <p className="text-lg font-bold">98 %</p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button className="bg-medical-blue w-full" onClick={() => toast.success('Vitals updated')}>Update Vitals</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-[10px] gap-1"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setIsChartOpen(true);
                        }}
                      >
                        <FileText className="w-3 h-3" />
                        Patient Chart
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center justify-center text-slate-300">
                    <BedIcon className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Ready for Admission</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* Patient Chart Dialog */}
      <Dialog open={isChartOpen} onOpenChange={setIsChartOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">Patient Clinical Chart</DialogTitle>
                <DialogDescription>
                  {selectedPatient?.name} ({selectedPatient?.mrn}) • Bed {beds.find(b => b.patientId === selectedPatient?.id)?.number}
                </DialogDescription>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100">
                IPD Admission
              </Badge>
            </div>
          </DialogHeader>
          
          <Tabs defaultValue="doctor" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-5 bg-slate-100/50 p-1">
                <TabsTrigger value="doctor" className="text-xs gap-2">
                  <Stethoscope className="w-3.5 h-3.5" />
                  Doctor
                </TabsTrigger>
                <TabsTrigger value="nurse" className="text-xs gap-2">
                  <ClipboardList className="w-3.5 h-3.5" />
                  Nurse
                </TabsTrigger>
                <TabsTrigger value="prescription" className="text-xs gap-2">
                  <Pill className="w-3.5 h-3.5" />
                  Prescription
                </TabsTrigger>
                <TabsTrigger value="tests" className="text-xs gap-2">
                  <FlaskConical className="w-3.5 h-3.5" />
                  Tests
                </TabsTrigger>
                <TabsTrigger value="billing" className="text-xs gap-2">
                  <Receipt className="w-3.5 h-3.5" />
                  Charges
                </TabsTrigger>
              </TabsList>
            </div>

          <div className="flex-1 px-6 py-4 overflow-y-auto custom-scrollbar">
            <TabsContent value="doctor" className="mt-0 space-y-4">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-medical-blue"></div>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-bold text-medical-blue uppercase">Dr. Rajesh Sharma</p>
                      <p className="text-[10px] text-slate-400">12-Apr-2024 09:30 AM</p>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Patient showing improvement in respiratory symptoms. Lung sounds are clearer. 
                      Continue nebulization therapy. Monitor oxygen saturation every 2 hours.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-medical-blue/30"></div>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-bold text-slate-500 uppercase">Dr. Rajesh Sharma</p>
                      <p className="text-[10px] text-slate-400">11-Apr-2024 06:15 PM</p>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Initial assessment completed. Patient admitted with acute bronchitis. 
                      Started on IV antibiotics and hydration.
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Add Doctor's Note</Label>
                    <textarea 
                      className="w-full min-h-[100px] p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20 transition-all"
                      placeholder="Enter clinical observations, diagnosis updates, or instructions..."
                    />
                    <div className="flex justify-end mt-2">
                      <Button size="sm" className="bg-medical-blue" onClick={() => toast.success('Doctor note saved')}>
                        Save Doctor Note
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="nurse" className="mt-0 space-y-4">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-bold text-emerald-600 uppercase">Nurse Meena</p>
                      <p className="text-[10px] text-slate-400">12-Apr-2024 11:00 AM</p>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Patient's temperature recorded at 99.1°F. Administered prescribed oral medications. 
                      Patient complained of mild headache. Encouraged fluid intake.
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Add Nurse's Note</Label>
                    <textarea 
                      className="w-full min-h-[100px] p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20 transition-all"
                      placeholder="Enter nursing observations, care provided, or patient complaints..."
                    />
                    <div className="flex justify-end mt-2">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => toast.success('Nurse note saved')}>
                        Save Nurse Note
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="prescription" className="mt-0 space-y-4">
                <Card className="border-slate-100 shadow-none">
                  <CardHeader className="p-4 bg-slate-50 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Active Prescription</p>
                      <p className="text-sm font-bold text-slate-800">Dr. Rajesh Sharma</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-medical-blue gap-1.5">
                      <Printer className="w-3.5 h-3.5" />
                      Print
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 rounded-lg bg-white border border-slate-100">
                        <div>
                          <p className="text-sm font-bold text-slate-800">Tab. Augmentin 625mg</p>
                          <p className="text-[10px] text-slate-500">Antibiotic • Twice a day (1-0-1)</p>
                        </div>
                        <Badge className="bg-blue-50 text-blue-600 border-none">5 Days</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-white border border-slate-100">
                        <div>
                          <p className="text-sm font-bold text-slate-800">Syp. Ascoril LS</p>
                          <p className="text-[10px] text-slate-500">Cough Syrup • 5ml Thrice a day</p>
                        </div>
                        <Badge className="bg-blue-50 text-blue-600 border-none">3 Days</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-white border border-slate-100">
                        <div>
                          <p className="text-sm font-bold text-slate-800">Tab. Pan 40mg</p>
                          <p className="text-[10px] text-slate-500">Antacid • Once a day (Empty stomach)</p>
                        </div>
                        <Badge className="bg-blue-50 text-blue-600 border-none">7 Days</Badge>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">General Advice</p>
                      <p className="text-xs text-slate-600 italic">Complete bed rest. Avoid cold drinks. Steam inhalation twice daily.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tests" className="mt-0 space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold uppercase text-slate-500 mb-3 block">Recommended Tests</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                            <FlaskConical className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Complete Blood Count (CBC)</p>
                            <p className="text-[10px] text-slate-500">Recommended by Dr. Rajesh Sharma</p>
                          </div>
                        </div>
                        <Badge className="bg-amber-50 text-amber-600 border-none">Pending</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Chest X-Ray (PA View)</p>
                            <p className="text-[10px] text-slate-500">Completed on 11-Apr-2024</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-none">Result Ready</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Recommend New Test</Label>
                    <div className="flex gap-2">
                      <Select>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select test type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cbc">CBC (Blood Test)</SelectItem>
                          <SelectItem value="lft">Liver Function Test</SelectItem>
                          <SelectItem value="kft">Kidney Function Test</SelectItem>
                          <SelectItem value="xray">X-Ray Chest</SelectItem>
                          <SelectItem value="mri">MRI Brain</SelectItem>
                          <SelectItem value="ct">CT Scan Abdomen</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="bg-medical-blue" onClick={() => toast.success('Test recommended successfully')}>
                        Recommend
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="billing" className="mt-0 space-y-4">
                <Card className="border-slate-100 shadow-none">
                  <CardHeader className="p-4 bg-slate-50">
                    <CardTitle className="text-sm">Estimated Bed Charges</CardTitle>
                    <CardDescription className="text-xs">Based on current ward occupancy</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <div>
                        <p className="text-sm font-medium">Bed Type</p>
                        <p className="text-xs text-muted-foreground">{beds.find(b => b.patientId === selectedPatient?.id)?.type} Bed</p>
                      </div>
                      <p className="text-sm font-bold">
                        {formatCurrency(MOCK_BED_RATES.find(r => r.type === beds.find(b => b.patientId === selectedPatient?.id)?.type)?.rate || 0)} / Day
                      </p>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <div>
                        <p className="text-sm font-medium">Occupancy</p>
                        <p className="text-xs text-muted-foreground">Admitted on 10-Apr-2024</p>
                      </div>
                      <p className="text-sm font-bold">3 Days</p>
                    </div>
                    <div className="flex justify-between items-center py-4 bg-medical-blue/5 px-3 rounded-lg">
                      <p className="font-bold text-medical-blue">Total Bed Charges</p>
                      <p className="text-lg font-bold text-medical-blue">{formatCurrency(calculateBedCharges(selectedPatient?.id))}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">
                      * Final charges will be calculated at the time of discharge based on actual hours.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
          
          <div className="p-4 border-t bg-slate-50 flex justify-end">
            <Button variant="outline" onClick={() => setIsChartOpen(false)}>Close Chart</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bed Transfer Dialog */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Transfer Patient</DialogTitle>
            <DialogDescription>
              Transfer {MOCK_PATIENTS.find(p => p.id === transferData.patientId)?.name} to another bed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Bed</Label>
              <Input disabled value={`Bed ${beds.find(b => b.id === transferData.fromBedId)?.number} (${beds.find(b => b.id === transferData.fromBedId)?.ward})`} />
            </div>
            <div className="space-y-2">
              <Label>Target Bed</Label>
              <Select value={transferData.toBedId} onValueChange={(v) => setTransferData({...transferData, toBedId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target bed" />
                </SelectTrigger>
                <SelectContent>
                  {beds.filter(b => b.status === 'Available').map(b => (
                    <SelectItem key={b.id} value={b.id}>Bed {b.number} - {b.ward} ({b.type})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferOpen(false)}>Cancel</Button>
            <Button className="bg-medical-blue" onClick={handleTransfer}>Confirm Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
