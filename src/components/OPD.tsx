import { useState, ChangeEvent } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  Calendar as CalendarIcon,
  Clock,
  Printer,
  Share2,
  CheckCircle2,
  Download,
  Edit,
  Trash2,
  FileText,
  History,
  Eye,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_PRESCRIPTIONS } from '@/mockData';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Prescription } from '@/types';

export default function OPD() {
  const [activeTab, setActiveTab] = useState<'queue' | 'appointments' | 'patients'>('queue');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [isTokenSuccessOpen, setIsTokenSuccessOpen] = useState(false);
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all');
  const [appointmentFee, setAppointmentFee] = useState<number>(500); // Admin decided fee
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [newPatient, setNewPatient] = useState({ 
    name: '', 
    phone: '', 
    email: '',
    age: '', 
    gender: 'male',
    address: '',
    husbandName: '',
    fatherName: '',
    bloodGroup: '',
    dob: '',
    tpaId: '',
    tpaValidity: '',
    guardianName: ''
  });
  const [newAppointment, setNewAppointment] = useState({ patientId: '', doctor: '', date: '', time: '' });
  const [lastToken, setLastToken] = useState<{
    tokenNumber: string;
    patientName: string;
    mrn: string;
    doctor: string;
    date: string;
    fee?: number;
  } | null>(null);

  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{url: string, name: string} | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [prescription, setPrescription] = useState({
    doctor: 'Dr. Rajesh Sharma',
    date: new Date().toISOString().split('T')[0],
    medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
    advice: '',
    attachmentUrl: '',
    attachmentName: ''
  });
  const [savedPrescriptions, setSavedPrescriptions] = useState<any[]>(MOCK_PRESCRIPTIONS);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescription({
          ...prescription,
          attachmentUrl: reader.result as string,
          attachmentName: file.name
        });
        toast.success('Prescription PDF uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const addMedicine = () => {
    setPrescription({
      ...prescription,
      medicines: [...prescription.medicines, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const removeMedicine = (index: number) => {
    const newMedicines = prescription.medicines.filter((_, i) => i !== index);
    setPrescription({ ...prescription, medicines: newMedicines });
  };

  const updateMedicine = (index: number, field: string, value: string) => {
    const newMedicines = prescription.medicines.map((m, i) => 
      i === index ? { ...m, [field]: value } : m
    );
    setPrescription({ ...prescription, medicines: newMedicines });
  };

  const handleSavePrescription = () => {
    if (!selectedPatient) return;
    
    const newPrescription = {
      id: `rx-${Date.now()}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      ...prescription
    };

    setSavedPrescriptions([newPrescription, ...savedPrescriptions]);
    toast.success(`Prescription saved for ${selectedPatient.name}`);
    setIsPrescriptionOpen(false);
    // Reset form
    setPrescription({
      doctor: 'Dr. Rajesh Sharma',
      date: new Date().toISOString().split('T')[0],
      medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
      advice: '',
      attachmentUrl: '',
      attachmentName: ''
    });
  };

  const printPrescription = () => {
    if (!selectedPatient) return;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast.error('Please allow popups to print prescription');
      return;
    }

    const prescriptionHtml = `
      <html>
        <head>
          <title>Prescription - ${selectedPatient.name}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .hospital-name { font-size: 24px; font-weight: bold; color: #2563eb; }
            .rx-symbol { font-size: 40px; font-weight: bold; margin: 20px 0; color: #2563eb; }
            .patient-info { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .medicine-table { width: 100%; border-collapse: collapse; margin-bottom: 50px; }
            .medicine-table th { text-align: left; border-bottom: 1px solid #e2e8f0; padding: 10px; color: #64748b; font-size: 12px; text-transform: uppercase; }
            .medicine-table td { padding: 15px 10px; border-bottom: 1px solid #f1f5f9; }
            .footer { margin-top: 100px; border-top: 1px solid #e2e8f0; pt: 20px; display: flex; justify-content: space-between; }
            .signature { text-align: center; }
            .sig-line { border-top: 1px solid #000; width: 200px; margin-top: 50px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="hospital-name">DC GLOBAL HOSPITAL</div>
              <div>123 Healthcare Way, Medical City</div>
              <div>Contact: +91 98765 43210</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: bold;">${prescription.doctor}</div>
              <div>Reg No: MC12345</div>
            </div>
          </div>

          <div class="patient-info">
            <div><strong>Patient:</strong> ${selectedPatient.name}</div>
            <div><strong>Date:</strong> ${prescription.date}</div>
            <div><strong>Age/Gender:</strong> ${selectedPatient.age}Y / ${selectedPatient.gender}</div>
            <div><strong>MRN:</strong> ${selectedPatient.mrn}</div>
          </div>

          <div class="rx-symbol">Rx</div>

          <table class="medicine-table">
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${prescription.medicines.map(m => `
                <tr>
                  <td style="font-weight: bold;">${m.name}</td>
                  <td>${m.dosage}</td>
                  <td>${m.frequency}</td>
                  <td>${m.duration}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 30px;">
            <strong>Advice / Notes:</strong>
            <p style="color: #64748b;">Take rest and drink plenty of water. Follow up after 5 days.</p>
          </div>

          <div class="footer">
            <div>
              <p style="font-size: 10px; color: #94a3b8;">Generated by Global Hospital Management System</p>
            </div>
            <div class="signature">
              <div class="sig-line"></div>
              <p>Doctor's Signature</p>
            </div>
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

    printWindow.document.write(prescriptionHtml);
    printWindow.document.close();
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  const handleRegistration = () => {
    if (!newPatient.name || !newPatient.phone) {
      toast.error('Please fill in required fields');
      return;
    }
    const tokenNumber = `#${Math.floor(Math.random() * 900) + 100}`;
    const mrn = `MRN${Math.floor(Math.random() * 90000) + 10000}`;
    
    const patientToAdd = {
      id: `p-${Date.now()}`,
      name: newPatient.name,
      mrn,
      age: Number(newPatient.age),
      gender: newPatient.gender as any,
      phone: newPatient.phone,
      email: newPatient.email,
      address: newPatient.address,
      bloodGroup: newPatient.bloodGroup,
      husbandName: newPatient.husbandName,
      fatherName: newPatient.fatherName,
      dob: newPatient.dob,
      tpaId: newPatient.tpaId,
      tpaValidity: newPatient.tpaValidity,
      guardianName: newPatient.guardianName,
      lastVisit: new Date().toISOString().split('T')[0],
      status: 'Stable'
    };

    setPatients([patientToAdd as any, ...patients]);
    setLastToken({
      tokenNumber,
      patientName: newPatient.name,
      mrn,
      doctor: "Dr. Rajesh Sharma", // Default for registration
      date: new Date().toLocaleString(),
      fee: 200 // Registration fee
    });
    setIsRegisterOpen(false);
    setIsTokenSuccessOpen(true);
    // Reset form
    setNewPatient({ 
      name: '', 
      phone: '', 
      email: '',
      age: '', 
      gender: 'male',
      address: '',
      husbandName: '',
      fatherName: '',
      bloodGroup: '',
      dob: '',
      tpaId: '',
      tpaValidity: '',
      guardianName: ''
    });
    toast.success('Patient registered and token generated');
  };

  const handleBookAppointment = () => {
    if (!newAppointment.patientId || !newAppointment.doctor) {
      toast.error('Please select patient and doctor');
      return;
    }
    const patient = patients.find(p => p.id === newAppointment.patientId);
    const tokenNumber = `APT-${Math.floor(Math.random() * 900) + 100}`;
    
    const appointmentToAdd = {
      id: `apt-${Date.now()}`,
      patientId: newAppointment.patientId,
      doctor: newAppointment.doctor,
      date: newAppointment.date || new Date().toISOString().split('T')[0],
      time: newAppointment.time || '10:00 AM',
      status: 'Confirmed',
      type: 'Follow-up'
    };

    setAppointments([appointmentToAdd as any, ...appointments]);
    setLastToken({
      tokenNumber,
      patientName: patient?.name || "Unknown",
      mrn: patient?.mrn || "N/A",
      doctor: newAppointment.doctor,
      date: new Date().toLocaleString(),
      fee: appointmentFee
    });
    setIsAppointmentOpen(false);
    setIsTokenSuccessOpen(true);
    setNewAppointment({ patientId: '', doctor: '', date: '', time: '' });
    toast.success('Appointment booked and token generated');
  };

  const printToken = () => {
    if (!lastToken) return;

    const printWindow = window.open('', '_blank', 'width=300,height=400');
    if (!printWindow) {
      toast.error('Please allow popups to print token');
      return;
    }

    const tokenHtml = `
      <html>
        <head>
          <title>Token - ${lastToken.tokenNumber}</title>
          <style>
            @page { margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 58mm; 
              padding: 5mm; 
              margin: 0;
              font-size: 12px;
              line-height: 1.2;
              text-align: center;
            }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 5px 0; }
            .token-num { font-size: 32px; font-weight: bold; margin: 10px 0; }
            .header { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="bold" style="font-size: 16px;">GLOBAL HOSPITAL</div>
            <div>OPD TOKEN</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="token-num">${lastToken.tokenNumber}</div>
          
          <div class="divider"></div>
          
          <div style="text-align: left;">
            <div>Patient: ${lastToken.patientName}</div>
            <div>MRN: ${lastToken.mrn}</div>
            <div>Doctor: ${lastToken.doctor}</div>
            <div>Date: ${lastToken.date}</div>
            ${lastToken.fee ? `<div>Fee Paid: ₹${lastToken.fee}</div>` : ''}
          </div>
          
          <div class="divider"></div>
          
          <div style="font-size: 10px; margin-top: 10px;">
            Please wait for your turn.<br>
            Thank you for your patience.
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

    printWindow.document.close();
  };

  const handleDeletePatient = (id: string) => {
    setPatients(patients.filter(p => p.id !== id));
    toast.success('Patient record removed');
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(appointments.filter(a => a.id !== id));
    toast.success('Appointment cancelled');
  };

  const handleExportData = () => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = '';

    if (activeTab === 'patients') {
      headers = ['MRN', 'Name', 'Age', 'Gender', 'Phone'];
      rows = patients.map(p => [p.mrn, p.name, p.age, p.gender, p.phone]);
      filename = 'patient_records.csv';
    } else {
      headers = ['Token', 'Patient', 'Doctor', 'Time', 'Status'];
      rows = appointments.map((a, i) => [
        `#${100 + i + 1}`,
        patients.find(p => p.id === a.patientId)?.name,
        'Dr. Rajesh Sharma',
        a.time,
        a.status
      ]);
      filename = activeTab === 'queue' ? 'live_queue.csv' : 'appointments.csv';
    }
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} exported`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">OPD Management</h1>
          <p className="text-muted-foreground">Manage outpatient registrations, tokens, and consultations.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportData}>
            <Download className="w-4 h-4" />
            Export {activeTab === 'patients' ? 'Records' : 'Queue'}
          </Button>
          <Dialog open={isAppointmentOpen} onOpenChange={setIsAppointmentOpen}>
            <DialogTrigger render={
              <Button variant="outline" className="gap-2 border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white">
                <CalendarIcon className="w-4 h-4" />
                Book Appointment
              </Button>
            } />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Book New Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select 
                    value={newAppointment.patientId}
                    onValueChange={(v) => setNewAppointment({...newAppointment, patientId: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Doctor</Label>
                  <Select 
                    value={newAppointment.doctor}
                    onValueChange={(v) => setNewAppointment({...newAppointment, doctor: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dr. Rajesh Sharma">Dr. Rajesh Sharma</SelectItem>
                      <SelectItem value="Dr. Anjali Gupta">Dr. Anjali Gupta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input 
                      type="date" 
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time Slot</Label>
                    <Input 
                      type="time" 
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Consultation Fee (₹)</Label>
                  <Input 
                    type="number" 
                    value={appointmentFee} 
                    onChange={(e) => setAppointmentFee(Number(e.target.value))}
                    placeholder="Enter fee"
                  />
                  <p className="text-[10px] text-muted-foreground">Fee decided by Admin for this consultation.</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAppointmentOpen(false)}>Cancel</Button>
                <Button className="bg-medical-blue" onClick={handleBookAppointment}>Confirm Booking & Token</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
            <DialogTrigger render={
              <Button className="bg-medical-blue gap-2">
                <UserPlus className="w-4 h-4" />
                New Registration
              </Button>
            } />
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Patient Registration</DialogTitle>
              </DialogHeader>
              <div className="max-h-[80vh] overflow-y-auto custom-scrollbar pr-4">
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input 
                      id="name" 
                      placeholder="Enter patient name" 
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      placeholder="Enter phone number" 
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="patient@example.com" 
                      value={newPatient.email}
                      onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input 
                      id="dob" 
                      type="date" 
                      value={newPatient.dob}
                      onChange={(e) => {
                        const dob = e.target.value;
                        const age = calculateAge(dob);
                        setNewPatient({...newPatient, dob, age});
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age (Auto-calculated)</Label>
                    <Input 
                      id="age" 
                      type="number" 
                      placeholder="Age" 
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={newPatient.gender}
                      onValueChange={(v) => setNewPatient({...newPatient, gender: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Select 
                      value={newPatient.bloodGroup}
                      onValueChange={(v) => setNewPatient({...newPatient, bloodGroup: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianName">Guardian Name</Label>
                    <Input 
                      id="guardianName" 
                      placeholder="Guardian Name" 
                      value={newPatient.guardianName}
                      onChange={(e) => setNewPatient({...newPatient, guardianName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatherName">Father's Name</Label>
                    <Input 
                      id="fatherName" 
                      placeholder="Father's Name" 
                      value={newPatient.fatherName}
                      onChange={(e) => setNewPatient({...newPatient, fatherName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="husbandName">Husband's Name</Label>
                    <Input 
                      id="husbandName" 
                      placeholder="Husband's Name" 
                      value={newPatient.husbandName}
                      onChange={(e) => setNewPatient({...newPatient, husbandName: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      placeholder="Full residential address" 
                      value={newPatient.address}
                      onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tpaId">TPA (Number) ID</Label>
                    <Input 
                      id="tpaId" 
                      placeholder="TPA ID" 
                      value={newPatient.tpaId}
                      onChange={(e) => setNewPatient({...newPatient, tpaId: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tpaValidity">TPA Validity</Label>
                    <Input 
                      id="tpaValidity" 
                      type="date"
                      value={newPatient.tpaValidity}
                      onChange={(e) => setNewPatient({...newPatient, tpaValidity: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRegisterOpen(false)}>Cancel</Button>
                <Button className="bg-medical-blue" onClick={handleRegistration}>Register & Generate Token</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        <Button 
          variant={activeTab === 'queue' ? 'secondary' : 'ghost'} 
          size="sm" 
          onClick={() => setActiveTab('queue')}
          className={activeTab === 'queue' ? 'bg-white shadow-sm' : ''}
        >
          Live Queue
        </Button>
        <Button 
          variant={activeTab === 'appointments' ? 'secondary' : 'ghost'} 
          size="sm" 
          onClick={() => setActiveTab('appointments')}
          className={activeTab === 'appointments' ? 'bg-white shadow-sm' : ''}
        >
          Appointments
        </Button>
        <Button 
          variant={activeTab === 'patients' ? 'secondary' : 'ghost'} 
          size="sm" 
          onClick={() => setActiveTab('patients')}
          className={activeTab === 'patients' ? 'bg-white shadow-sm' : ''}
        >
          Patient Records
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10 bg-slate-50 border-none" />
            </div>
            {activeTab === 'queue' && (
              <div className="flex items-center gap-2">
                <Label className="text-xs shrink-0">Doctor:</Label>
                <Select value={selectedDoctorFilter} onValueChange={setSelectedDoctorFilter}>
                  <SelectTrigger className="w-[180px] h-9 bg-slate-50 border-none">
                    <SelectValue placeholder="All Doctors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    <SelectItem value="d1">Dr. Rajesh Sharma</SelectItem>
                    <SelectItem value="d2">Dr. Anjali Gupta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            {activeTab === 'patients' ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="whitespace-nowrap">MRN</TableHead>
                    <TableHead className="whitespace-nowrap">Patient Name</TableHead>
                    <TableHead className="whitespace-nowrap">Age/Gender</TableHead>
                    <TableHead className="whitespace-nowrap">Contact</TableHead>
                    <TableHead className="whitespace-nowrap">Last Visit</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id} className="border-slate-50">
                      <TableCell className="font-bold text-medical-blue whitespace-nowrap">{patient.mrn}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{patient.name}</TableCell>
                      <TableCell className="whitespace-nowrap">{patient.age}Y / {patient.gender}</TableCell>
                      <TableCell className="whitespace-nowrap">{patient.phone}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">10-Apr-2024</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-medical-blue" 
                            title="Patient 360 Overview"
                            onClick={() => window.location.href = `/patient-overview?id=${patient.id}`}
                          >
                            <User className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-medical-blue" 
                            title="View Details"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-emerald-600 h-8 gap-1.5 whitespace-nowrap" 
                            onClick={() => {
                              setSelectedPatient(patient);
                              setIsPrescriptionOpen(true);
                            }}
                          >
                            <FileText className="w-4 h-4" />
                            Prescription
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-amber-600 h-8 gap-1.5 whitespace-nowrap" 
                            onClick={() => {
                              setSelectedPatient(patient);
                              setIsHistoryOpen(true);
                            }}
                          >
                            <History className="w-4 h-4" />
                            History
                          </Button>
                          <Button variant="ghost" size="sm" className="text-medical-blue h-8 whitespace-nowrap" onClick={() => toast.success('Transferring to IPD Admission...')}>
                            Transfer to IPD
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-medical-blue" onClick={() => toast.info('Editing patient...')}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDeletePatient(patient.id)}>
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
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="whitespace-nowrap">Token</TableHead>
                    <TableHead className="whitespace-nowrap">Patient</TableHead>
                    <TableHead className="whitespace-nowrap">Doctor</TableHead>
                    <TableHead className="whitespace-nowrap">Time</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((apt, i) => (
                    <TableRow key={apt.id} className="border-slate-50">
                      <TableCell className="font-bold text-medical-blue whitespace-nowrap">#{100 + i + 1}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div>
                          <p className="font-medium">{patients.find(p => p.id === apt.patientId)?.name}</p>
                          <p className="text-xs text-muted-foreground">MRN: {patients.find(p => p.id === apt.patientId)?.mrn}</p>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">Dr. Rajesh Sharma</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1 text-xs">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {apt.time}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none">
                          {apt.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-emerald-600" 
                            title="Write Prescription"
                            onClick={() => {
                              const patient = patients.find(p => p.id === apt.patientId);
                              setSelectedPatient(patient);
                              setIsPrescriptionOpen(true);
                            }}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success('Printing token...')}>
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-medical-blue" onClick={() => toast.info('Editing appointment...')}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDeleteAppointment(apt.id)}>
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
            )}
          </div>
        </CardContent>
      </Card>
      {/* Token Success Dialog */}
      <Dialog open={isTokenSuccessOpen} onOpenChange={setIsTokenSuccessOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold">Success!</h3>
              <p className="text-sm text-muted-foreground">Token {lastToken?.tokenNumber} has been generated.</p>
              {lastToken?.fee && <p className="text-sm font-bold text-medical-blue mt-1">Fee: ₹{lastToken.fee}</p>}
            </div>
            <div className="w-full flex gap-2 pt-4">
              <Button variant="outline" className="flex-1 gap-2" onClick={printToken}>
                <Printer className="w-4 h-4" />
                Print Token
              </Button>
              <Button className="flex-1 bg-medical-blue" onClick={() => setIsTokenSuccessOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prescription Dialog */}
      <Dialog open={isPrescriptionOpen} onOpenChange={setIsPrescriptionOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Write Prescription - {selectedPatient?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Doctor</Label>
                <Select value={prescription.doctor} onValueChange={(v) => setPrescription({...prescription, doctor: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Rajesh Sharma">Dr. Rajesh Sharma</SelectItem>
                    <SelectItem value="Dr. Anjali Gupta">Dr. Anjali Gupta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={prescription.date} onChange={(e) => setPrescription({...prescription, date: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-bold">Medicines</Label>
                <Button variant="outline" size="sm" onClick={addMedicine} className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                  <Plus className="w-4 h-4" />
                  Add Medicine
                </Button>
              </div>
              
              <div className="space-y-3">
                {prescription.medicines.map((med, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="col-span-4 space-y-1.5">
                      <Label className="text-[10px] uppercase text-slate-500">Medicine Name</Label>
                      <Input 
                        placeholder="e.g. Paracetamol" 
                        value={med.name} 
                        onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label className="text-[10px] uppercase text-slate-500">Dosage</Label>
                      <Input 
                        placeholder="500mg" 
                        value={med.dosage} 
                        onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-3 space-y-1.5">
                      <Label className="text-[10px] uppercase text-slate-500">Frequency</Label>
                      <Input 
                        placeholder="1-0-1" 
                        value={med.frequency} 
                        onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label className="text-[10px] uppercase text-slate-500">Duration</Label>
                      <Input 
                        placeholder="5 days" 
                        value={med.duration} 
                        onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-500" onClick={() => removeMedicine(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Advice / Notes</Label>
              <Input 
                placeholder="Any specific instructions..." 
                value={prescription.advice}
                onChange={(e) => setPrescription({...prescription, advice: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Upload Written Prescription (PDF)</Label>
              <div className="flex items-center gap-4">
                <Input 
                  type="file" 
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                {prescription.attachmentName && (
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                    {prescription.attachmentName}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsPrescriptionOpen(false)}>Cancel</Button>
            <Button variant="outline" className="gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50" onClick={printPrescription}>
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={handleSavePrescription}>
              <CheckCircle2 className="w-4 h-4" />
              Save Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prescription History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-600" />
              Prescription History - {selectedPatient?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="h-[400px] overflow-y-auto custom-scrollbar pr-4">
            <div className="space-y-4 py-4">
              {savedPrescriptions.filter(rx => rx.patientId === selectedPatient?.id).length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No prescriptions found for this patient.</p>
                </div>
              ) : (
                savedPrescriptions
                  .filter(rx => rx.patientId === selectedPatient?.id)
                  .map((rx) => (
                    <Card key={rx.id} className="border-slate-100 shadow-none">
                      <CardHeader className="p-4 bg-slate-50 flex flex-row items-center justify-between space-y-0">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{rx.date}</p>
                          <p className="text-sm font-bold text-slate-800">{rx.doctor}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 text-medical-blue gap-1.5" onClick={() => {
                          // Set prescription state to this one and print
                          setPrescription(rx);
                          printPrescription();
                        }}>
                          <Printer className="w-3.5 h-3.5" />
                          Print
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          {rx.medicines.map((m: any, i: number) => (
                            <div key={i} className="flex justify-between text-xs border-b border-slate-50 pb-1 last:border-0">
                              <span className="font-bold text-slate-700">{m.name} ({m.dosage})</span>
                              <span className="text-slate-500">{m.frequency} | {m.duration}</span>
                            </div>
                          ))}
                        </div>
                        {rx.advice && (
                          <div className="mt-3 pt-2 border-top border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Advice</p>
                            <p className="text-xs text-slate-600 italic">{rx.advice}</p>
                          </div>
                        )}
                        {rx.attachmentUrl && (
                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-600">
                              <FileText className="w-4 h-4" />
                              <span className="text-xs font-medium truncate max-w-[150px]">{rx.attachmentName || 'Prescription PDF'}</span>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-medical-blue hover:text-medical-blue hover:bg-blue-50"
                                onClick={() => {
                                  setPreviewData({ url: rx.attachmentUrl, name: rx.attachmentName || 'Prescription' });
                                  setIsPreviewOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = rx.attachmentUrl;
                                  link.download = rx.attachmentName || 'prescription.pdf';
                                  link.click();
                                }}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-medical-blue" onClick={() => setIsHistoryOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Patient Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-medical-blue" />
              Patient Details - {selectedPatient?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar pr-4">
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MRN / Patient ID</p>
                  <p className="text-sm font-bold text-medical-blue">{selectedPatient?.mrn}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                  <p className="text-sm font-medium">{selectedPatient?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-medium">{selectedPatient?.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium">{selectedPatient?.email || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Age / Gender</p>
                  <p className="text-sm font-medium">{selectedPatient?.age}Y / {selectedPatient?.gender}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date of Birth</p>
                  <p className="text-sm font-medium">{selectedPatient?.dob || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blood Group</p>
                  <p className="text-sm font-medium">{selectedPatient?.bloodGroup || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guardian Name</p>
                  <p className="text-sm font-medium">{selectedPatient?.guardianName || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Father's Name</p>
                  <p className="text-sm font-medium">{selectedPatient?.fatherName || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Husband's Name</p>
                  <p className="text-sm font-medium">{selectedPatient?.husbandName || 'N/A'}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address</p>
                  <p className="text-sm font-medium">{selectedPatient?.address}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TPA ID</p>
                  <p className="text-sm font-medium">{selectedPatient?.tpaId || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TPA Validity</p>
                  <p className="text-sm font-medium">{selectedPatient?.tpaValidity || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-medical-blue" onClick={() => setIsDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* File Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-medical-blue" />
              {previewData?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-slate-100 relative overflow-hidden">
            {previewData?.url.startsWith('data:application/pdf') ? (
              <iframe 
                src={previewData.url} 
                className="w-full h-full border-none"
                title="PDF Preview"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img 
                  src={previewData?.url} 
                  alt="Prescription Preview" 
                  className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
          <DialogFooter className="p-4 border-t bg-white">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close Preview</Button>
            <Button className="bg-medical-blue" onClick={() => {
              if (previewData) {
                const link = document.createElement('a');
                link.href = previewData.url;
                link.download = previewData.name;
                link.click();
              }
            }}>
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
