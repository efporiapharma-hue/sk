import { useState } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  FileCheck,
  UserCheck
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
import { MOCK_PATIENTS } from '@/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
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

const MOCK_INSURANCE = [
  { 
    id: 'INS-001', 
    patientId: 'p1', 
    policyNo: 'POL-88273', 
    insuranceCompany: 'Star Health Insurance', 
    tpaName: 'MediAssist TPA', 
    insuranceLimit: 500000, 
    approvedAmount: 45000, 
    status: 'Approved', 
    date: '2024-04-10' 
  },
  { 
    id: 'INS-002', 
    patientId: 'p2', 
    policyNo: 'POL-11290', 
    insuranceCompany: 'HDFC ERGO', 
    tpaName: 'Raksha TPA', 
    insuranceLimit: 300000, 
    approvedAmount: 0, 
    status: 'Pending', 
    date: '2024-04-11' 
  },
];

const MOCK_DISCHARGE_INITIATES = [
  { id: 1, patientId: 'p1', name: 'Amit Patel', nurseVerification: 'Verified', accountantVerification: 'Pending' },
  { id: 2, patientId: 'p2', name: 'Priya Singh', nurseVerification: 'Verified', accountantVerification: 'Verified' },
];

export default function Insurance() {
  const [insuranceRecords, setInsuranceRecords] = useState(MOCK_INSURANCE);
  const [dischargeRecords, setDischargeRecords] = useState(MOCK_DISCHARGE_INITIATES);
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-600';
      case 'Pending': return 'bg-amber-50 text-amber-600';
      case 'Rejected': return 'bg-rose-50 text-rose-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Insurance & TPA Management</h1>
          <p className="text-muted-foreground">Manage insurance claims, TPA approvals, and discharge clearances.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export List
          </Button>
          <Dialog>
            <DialogTrigger render={
              <Button className="bg-medical-blue gap-2">
                <Plus className="w-4 h-4" />
                New Insurance Claim
              </Button>
            } />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>New Insurance Claim</DialogTitle>
                <DialogDescription>Initiate a new TPA/Insurance claim for a patient.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
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
                    <Label>Policy Number</Label>
                    <Input placeholder="Enter policy no." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Insurance Company</Label>
                    <Input placeholder="e.g. Star Health" />
                  </div>
                  <div className="space-y-2">
                    <Label>TPA Name</Label>
                    <Input placeholder="e.g. MediAssist" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Insurance Limit (₹)</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Claim Date</Label>
                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button className="bg-medical-blue" onClick={() => toast.success('Insurance claim initiated')}>Submit Claim</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-medical-blue/5 border-b border-medical-blue/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-medical-blue" />
              <CardTitle className="text-lg text-medical-blue">Insurance List</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by Patient ID or Policy..." 
                  className="pl-10 bg-white border-slate-200 h-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-slate-900">
                  <TableHead className="text-white font-bold whitespace-nowrap">ID</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Patient ID</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Policy No</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Insurance Company</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">TPA Name</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Insurance Limit</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Approved Amount</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Date</TableHead>
                  <TableHead className="text-white font-bold text-right whitespace-nowrap">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insuranceRecords.map((record) => {
                  const patient = MOCK_PATIENTS.find(p => p.id === record.patientId);
                  return (
                    <TableRow key={record.id} className="border-slate-50">
                      <TableCell className="font-medium text-xs whitespace-nowrap">{record.id}</TableCell>
                      <TableCell className="font-bold text-medical-blue text-xs whitespace-nowrap">{patient?.mrn}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{record.policyNo}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{record.insuranceCompany}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{record.tpaName}</TableCell>
                      <TableCell className="text-xs font-semibold whitespace-nowrap">{formatCurrency(record.insuranceLimit)}</TableCell>
                      <TableCell className="text-xs font-bold text-emerald-600 whitespace-nowrap">{formatCurrency(record.approvedAmount)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="secondary" className={`text-[10px] border-none ${getStatusColor(record.status)}`}>
                          {record.status === 'Approved' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : 
                           record.status === 'Pending' ? <Clock className="w-3 h-3 mr-1" /> : 
                           <AlertCircle className="w-3 h-3 mr-1" />}
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(record.date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-medical-blue" title="Patient 360 Overview" onClick={() => window.location.href = `/patient-overview?id=${record.patientId}`}>
                            <UserCheck className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-medical-blue">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500">
                            <Trash2 className="w-3.5 h-3.5" />
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

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Initiates Discharge List</CardTitle>
          <CardDescription>Patients waiting for final clearance from nursing and accounts.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="w-[60px] whitespace-nowrap">#</TableHead>
                  <TableHead className="whitespace-nowrap">Patient ID</TableHead>
                  <TableHead className="whitespace-nowrap">Name</TableHead>
                  <TableHead className="whitespace-nowrap">Nurse Verification</TableHead>
                  <TableHead className="whitespace-nowrap">Accountant Verification</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dischargeRecords.map((record) => (
                  <TableRow key={record.id} className="border-slate-50">
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{record.id}</TableCell>
                    <TableCell className="font-bold text-medical-blue text-xs whitespace-nowrap">{record.patientId.toUpperCase()}</TableCell>
                    <TableCell className="font-medium text-sm whitespace-nowrap">{record.name}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="outline" className={`gap-1.5 ${record.nurseVerification === 'Verified' ? 'text-emerald-600 border-emerald-100 bg-emerald-50' : 'text-amber-600 border-amber-100 bg-amber-50'}`}>
                        <UserCheck className="w-3 h-3" />
                        {record.nurseVerification}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="outline" className={`gap-1.5 ${record.accountantVerification === 'Verified' ? 'text-emerald-600 border-emerald-100 bg-emerald-50' : 'text-amber-600 border-amber-100 bg-amber-50'}`}>
                        <FileCheck className="w-3 h-3" />
                        {record.accountantVerification}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="sm" className="text-medical-blue h-8">
                        View Clearance
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
