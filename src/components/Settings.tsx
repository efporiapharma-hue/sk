import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Upload,
  ShieldCheck,
  Users,
  Stethoscope,
  Printer,
  UserPlus,
  Lock,
  Receipt,
  Scissors
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { MOCK_USERS, MOCK_PATIENTS, MOCK_BED_RATES, MOCK_OT_RATES } from '@/mockData';

export default function Settings() {
  // Hospital Info State
  const [hospitalInfo, setHospitalInfo] = useState({
    name: 'GLOBAL HOSPITAL',
    address: '123, Medical Square, City Center',
    gst: '27AAAAA0000A1Z5',
    phone: '+91 98765 43210',
    email: 'contact@globalhospital.com',
    logo: null as string | null
  });

  // Departments & Specialties
  const [departments, setDepartments] = useState(['General Medicine', 'Orthopedics', 'Pediatrics', 'Gynaecology', 'Cardiology', 'Pathology', 'Radiology', 'Accounts']);
  const [specialties, setSpecialties] = useState(['Surgery', 'Consultation', 'Emergency', 'Diagnostics']);
  const [newDept, setNewDept] = useState('');
  const [newSpec, setNewSpec] = useState('');

  // User Management
  const [users, setUsers] = useState(MOCK_USERS);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'DOCTOR', department: '', password: '' });

  // Rates State
  const [bedRates, setBedRates] = useState(MOCK_BED_RATES);
  const [otRates, setOtRates] = useState(MOCK_OT_RATES);
  const [newBedRate, setNewBedRate] = useState({ type: '', rate: '' });
  const [newOtRate, setNewOtRate] = useState({ type: '', rate: '' });

  // Prescription State
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [newPrescription, setNewPrescription] = useState({
    patientId: '',
    doctorId: '',
    diagnosis: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
    notes: ''
  });

  const handleSaveHospitalInfo = () => {
    toast.success('Hospital information updated successfully');
  };

  const handleAddDept = () => {
    if (newDept && !departments.includes(newDept)) {
      setDepartments([...departments, newDept]);
      setNewDept('');
      toast.success('Department added');
    }
  };

  const handleAddSpec = () => {
    if (newSpec && !specialties.includes(newSpec)) {
      setSpecialties([...specialties, newSpec]);
      setNewSpec('');
      toast.success('Specialty added');
    }
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Please fill in all user details');
      return;
    }
    const userToAdd = {
      id: `u-${Date.now()}`,
      ...newUser,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.name}`
    };
    setUsers([...users, userToAdd as any]);
    setNewUser({ name: '', email: '', role: 'DOCTOR', department: '', password: '' });
    toast.success(`${newUser.role} account created successfully`);
  };

  const handleAddMedicine = () => {
    setNewPrescription({
      ...newPrescription,
      medicines: [...newPrescription.medicines, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const handleSavePrescription = () => {
    if (!newPrescription.patientId || !newPrescription.doctorId) {
      toast.error('Please select patient and doctor');
      return;
    }
    setPrescriptions([...prescriptions, { ...newPrescription, id: `pr-${Date.now()}`, date: new Date().toLocaleDateString() }]);
    toast.success('Prescription saved successfully');
  };

  const handleAddBedRate = () => {
    if (!newBedRate.type || !newBedRate.rate) return;
    setBedRates([...bedRates, { type: newBedRate.type, rate: parseInt(newBedRate.rate) }]);
    setNewBedRate({ type: '', rate: '' });
    toast.success('Bed rate added');
  };

  const handleAddOtRate = () => {
    if (!newOtRate.type || !newOtRate.rate) return;
    setOtRates([...otRates, { type: newOtRate.type, rate: parseInt(newOtRate.rate) }]);
    setNewOtRate({ type: '', rate: '' });
    toast.success('OT rate added');
  };

  const printPrescription = (pres: any) => {
    const patient = MOCK_PATIENTS.find(p => p.id === pres.patientId);
    const doctor = users.find(u => u.id === pres.doctorId);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription - ${patient?.name}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #1E6FA8; padding-bottom: 20px; margin-bottom: 30px; }
            .hospital-name { font-size: 24px; font-weight: bold; color: #1E6FA8; margin: 0; }
            .hospital-info { font-size: 12px; color: #666; margin-top: 5px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; }
            .patient-info { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
            .rx-symbol { font-size: 32px; font-weight: bold; color: #1E6FA8; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; border-bottom: 1px solid #eee; padding: 10px; font-size: 14px; color: #666; }
            td { padding: 12px 10px; border-bottom: 1px solid #f5f5f5; font-size: 14px; }
            .footer { margin-top: 100px; display: flex; justify-content: space-between; border-top: 1px solid #eee; padding-top: 20px; }
            .signature { text-align: center; width: 200px; }
            .sig-line { border-top: 1px solid #333; margin-top: 50px; padding-top: 5px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="hospital-name">${hospitalInfo.name}</h1>
            <p class="hospital-info">${hospitalInfo.address} | GST: ${hospitalInfo.gst}</p>
            <p class="hospital-info">Phone: ${hospitalInfo.phone} | Email: ${hospitalInfo.email}</p>
          </div>
          
          <div class="meta">
            <div><strong>Date:</strong> ${pres.date || new Date().toLocaleDateString()}</div>
            <div><strong>Prescription ID:</strong> ${pres.id || 'NEW'}</div>
          </div>

          <div class="patient-info">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div><strong>Patient:</strong> ${patient?.name}</div>
              <div><strong>MRN:</strong> ${patient?.mrn}</div>
              <div><strong>Age/Gender:</strong> ${patient?.age} / ${patient?.gender}</div>
              <div><strong>Doctor:</strong> ${doctor?.name}</div>
            </div>
          </div>

          <div class="rx-symbol">Rx</div>
          
          <table>
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${pres.medicines.map((m: any) => `
                <tr>
                  <td><strong>${m.name}</strong></td>
                  <td>${m.dosage}</td>
                  <td>${m.frequency}</td>
                  <td>${m.duration}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 20px;">
            <strong>Diagnosis:</strong> ${pres.diagnosis}
          </div>
          
          <div style="margin-top: 20px;">
            <strong>Notes/Instructions:</strong><br/>
            ${pres.notes}
          </div>

          <div class="footer">
            <div class="signature">
              <div class="sig-line">Patient Signature</div>
            </div>
            <div class="signature">
              <div class="sig-line">Doctor Signature & Stamp<br/>${doctor?.name}</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Hospital Settings & Configuration</h1>
          <p className="text-muted-foreground">Manage hospital identity, departments, users, and prescriptions.</p>
        </div>
      </div>

      <Tabs defaultValue="hospital" className="space-y-6">
        <TabsList className="bg-white border shadow-sm p-1 h-auto flex-wrap justify-start">
          <TabsTrigger value="hospital" className="gap-2"><Building2 className="w-4 h-4" /> Hospital Info</TabsTrigger>
          <TabsTrigger value="departments" className="gap-2"><Stethoscope className="w-4 h-4" /> Departments</TabsTrigger>
          <TabsTrigger value="rates" className="gap-2"><Receipt className="w-4 h-4" /> Rates & Billing</TabsTrigger>
          <TabsTrigger value="users" className="gap-2"><Users className="w-4 h-4" /> User Panel</TabsTrigger>
          <TabsTrigger value="prescriptions" className="gap-2"><FileText className="w-4 h-4" /> Prescriptions</TabsTrigger>
        </TabsList>

        {/* Hospital Info Tab */}
        <TabsContent value="hospital">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Hospital Information</CardTitle>
              <CardDescription>Configure your hospital's public identity and contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 overflow-hidden">
                    {hospitalInfo.logo ? (
                      <img src={hospitalInfo.logo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-[10px] font-bold uppercase">Upload Logo</span>
                      </>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="w-full h-8 text-xs">Change Logo</Button>
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hospital Name</Label>
                    <Input value={hospitalInfo.name} onChange={(e) => setHospitalInfo({...hospitalInfo, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>GST Number</Label>
                    <Input value={hospitalInfo.gst} onChange={(e) => setHospitalInfo({...hospitalInfo, gst: e.target.value})} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Address</Label>
                    <Input value={hospitalInfo.address} onChange={(e) => setHospitalInfo({...hospitalInfo, address: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={hospitalInfo.phone} onChange={(e) => setHospitalInfo({...hospitalInfo, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input value={hospitalInfo.email} onChange={(e) => setHospitalInfo({...hospitalInfo, email: e.target.value})} />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button className="bg-medical-blue gap-2" onClick={handleSaveHospitalInfo}>
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Departments</CardTitle>
                <CardDescription>Manage hospital departments and wards.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Add new department..." value={newDept} onChange={(e) => setNewDept(e.target.value)} />
                  <Button className="bg-medical-blue" onClick={handleAddDept}><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="space-y-2">
                  {departments.map((dept) => (
                    <div key={dept} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-sm font-medium">{dept}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => setDepartments(departments.filter(d => d !== dept))}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Specialties</CardTitle>
                <CardDescription>Define medical specialties and services.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Add new specialty..." value={newSpec} onChange={(e) => setNewSpec(e.target.value)} />
                  <Button className="bg-medical-blue" onClick={handleAddSpec}><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="space-y-2">
                  {specialties.map((spec) => (
                    <div key={spec} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-sm font-medium">{spec}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => setSpecialties(specialties.filter(s => s !== spec))}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rates & Billing Tab */}
        <TabsContent value="rates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-medical-blue" />
                  <CardTitle>IPD Bed Rates</CardTitle>
                </div>
                <CardDescription>Set daily charges for different bed categories.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    placeholder="Bed Type (e.g. Deluxe)" 
                    value={newBedRate.type} 
                    onChange={(e) => setNewBedRate({...newBedRate, type: e.target.value})} 
                  />
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="Rate / Day" 
                      value={newBedRate.rate} 
                      onChange={(e) => setNewBedRate({...newBedRate, rate: e.target.value})} 
                    />
                    <Button className="bg-medical-blue" onClick={handleAddBedRate}><Plus className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {bedRates.map((rate) => (
                    <div key={rate.type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-sm font-bold">{rate.type}</span>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Bed Category</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-medical-blue">₹{rate.rate} / Day</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => setBedRates(bedRates.filter(r => r.type !== rate.type))}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-medical-blue" />
                  <CardTitle>OT Charges</CardTitle>
                </div>
                <CardDescription>Fixed charges for different types of surgeries.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    placeholder="OT Type (e.g. Major)" 
                    value={newOtRate.type} 
                    onChange={(e) => setNewOtRate({...newOtRate, type: e.target.value})} 
                  />
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="Fixed Charge" 
                      value={newOtRate.rate} 
                      onChange={(e) => setNewOtRate({...newOtRate, rate: e.target.value})} 
                    />
                    <Button className="bg-medical-blue" onClick={handleAddOtRate}><Plus className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {otRates.map((rate) => (
                    <div key={rate.type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-sm font-bold">{rate.type}</span>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Surgery Type</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-medical-blue">₹{rate.rate}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => setOtRates(otRates.filter(r => r.type !== rate.type))}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Panel Tab */}
        <TabsContent value="users">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management Panel</CardTitle>
                <CardDescription>Assign IDs, passwords, and roles to hospital staff.</CardDescription>
              </div>
              <Button className="bg-medical-blue gap-2" onClick={() => toast.info('Registration form opened')}>
                <UserPlus className="w-4 h-4" />
                Add New User
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="e.g. Dr. Rajesh Sharma" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email / Username</Label>
                  <Input placeholder="rajesh@hospital.com" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input type="password" placeholder="••••••••" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
                    <Lock className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={newUser.role} onValueChange={(v) => setNewUser({...newUser, role: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DOCTOR">Doctor</SelectItem>
                      <SelectItem value="NURSE">Nurse</SelectItem>
                      <SelectItem value="RECEPTION">Receptionist</SelectItem>
                      <SelectItem value="PATHOLOGY">Pathology Head</SelectItem>
                      <SelectItem value="RADIOLOGY">Radiology Head</SelectItem>
                      <SelectItem value="ACCOUNTS">Accounts Officer</SelectItem>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={newUser.department} onValueChange={(v) => setNewUser({...newUser, department: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="bg-medical-blue w-full gap-2" onClick={handleAddUser}>
                    <ShieldCheck className="w-4 h-4" />
                    Create Account
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Active User Accounts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user) => (
                    <div key={user.id} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                        <img src={user.avatar} alt={user.name} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold truncate">{user.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[9px] font-bold uppercase">{user.role}</Badge>
                          <span className="text-[10px] text-slate-400 font-medium truncate">{user.department}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-none shadow-sm">
              <CardHeader>
                <CardTitle>New Prescription</CardTitle>
                <CardDescription>Create and print a medical prescription.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Patient</Label>
                    <Select value={newPrescription.patientId} onValueChange={(v) => setNewPrescription({...newPrescription, patientId: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_PATIENTS.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.mrn})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Select Doctor</Label>
                    <Select value={newPrescription.doctorId} onValueChange={(v) => setNewPrescription({...newPrescription, doctorId: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.filter(u => u.role === 'DOCTOR' || u.role === 'SUPER_ADMIN').map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Diagnosis</Label>
                    <Input placeholder="e.g. Acute Viral Fever" value={newPrescription.diagnosis} onChange={(e) => setNewPrescription({...newPrescription, diagnosis: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold">Medicines</Label>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={handleAddMedicine}>
                      <Plus className="w-3 h-3" />
                      Add Medicine
                    </Button>
                  </div>
                  
                  {newPrescription.medicines.map((med, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <Input placeholder="Medicine Name" value={med.name} onChange={(e) => {
                        const meds = [...newPrescription.medicines];
                        meds[idx].name = e.target.value;
                        setNewPrescription({...newPrescription, medicines: meds});
                      }} />
                      <Input placeholder="Dosage (e.g. 500mg)" value={med.dosage} onChange={(e) => {
                        const meds = [...newPrescription.medicines];
                        meds[idx].dosage = e.target.value;
                        setNewPrescription({...newPrescription, medicines: meds});
                      }} />
                      <Input placeholder="Freq (e.g. 1-0-1)" value={med.frequency} onChange={(e) => {
                        const meds = [...newPrescription.medicines];
                        meds[idx].frequency = e.target.value;
                        setNewPrescription({...newPrescription, medicines: meds});
                      }} />
                      <div className="flex gap-2">
                        <Input placeholder="Duration" value={med.duration} onChange={(e) => {
                          const meds = [...newPrescription.medicines];
                          meds[idx].duration = e.target.value;
                          setNewPrescription({...newPrescription, medicines: meds});
                        }} />
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-rose-500" onClick={() => {
                          const meds = newPrescription.medicines.filter((_, i) => i !== idx);
                          setNewPrescription({...newPrescription, medicines: meds});
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Additional Notes / Instructions</Label>
                  <Input placeholder="e.g. Take after meals, plenty of fluids..." value={newPrescription.notes} onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})} />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" className="gap-2" onClick={() => setNewPrescription({
                    patientId: '', doctorId: '', diagnosis: '', medicines: [{ name: '', dosage: '', frequency: '', duration: '' }], notes: ''
                  })}>Reset</Button>
                  <Button className="bg-medical-blue gap-2" onClick={handleSavePrescription}>
                    <Save className="w-4 h-4" />
                    Save Prescription
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Recent Prescriptions</CardTitle>
                <CardDescription>View and print saved prescriptions.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px] overflow-y-auto custom-scrollbar">
                  <div className="p-4 space-y-3">
                    {prescriptions.length === 0 ? (
                      <div className="py-12 text-center text-slate-400">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-xs font-medium uppercase tracking-widest">No Prescriptions Yet</p>
                      </div>
                    ) : (
                      prescriptions.map((pres) => {
                        const patient = MOCK_PATIENTS.find(p => p.id === pres.patientId);
                        return (
                          <div key={pres.id} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-bold text-slate-800">{patient?.name}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{pres.date}</p>
                              </div>
                              <Button variant="outline" size="icon" className="h-8 w-8 text-medical-blue" onClick={() => printPrescription(pres)}>
                                <Printer className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {pres.medicines.slice(0, 2).map((m: any, i: number) => (
                                <Badge key={i} variant="secondary" className="text-[9px] font-medium">{m.name}</Badge>
                              ))}
                              {pres.medicines.length > 2 && <Badge variant="secondary" className="text-[9px] font-medium">+{pres.medicines.length - 2} more</Badge>}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
