import React, { useState } from 'react';
import { 
  Scissors, 
  Plus, 
  Search, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Upload,
  MoreVertical,
  X,
  Eye,
  Download,
  Trash2,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MOCK_THEATRES, MOCK_OPERATION_RECORDS, MOCK_PATIENTS, MOCK_USERS } from '@/mockData';
import { OperationRecord, OperationTheatre } from '@/types';
import { toast } from 'sonner';

export default function OTManagement() {
  const [theatres, setTheatres] = useState<OperationTheatre[]>(MOCK_THEATRES);
  const [records, setRecords] = useState<OperationRecord[]>(MOCK_OPERATION_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<OperationRecord | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newOp, setNewOp] = useState({ patientId: '', surgeonId: '', theatreId: '', operationName: '', date: '', time: '' });

  const handleScheduleOp = () => {
    if (!newOp.patientId || !newOp.surgeonId || !newOp.operationName) {
      toast.error('Please fill in required fields');
      return;
    }
    const opToAdd = {
      ...newOp,
      id: `op-${Date.now()}`,
      status: 'Scheduled',
      theatreId: newOp.theatreId || 'OT-1'
    };
    setRecords([opToAdd as any, ...records]);
    setNewOp({ patientId: '', surgeonId: '', theatreId: '', operationName: '', date: '', time: '' });
    toast.success('Operation scheduled successfully');
  };

  const filteredRecords = records.filter(record => {
    const patient = MOCK_PATIENTS.find(p => p.id === record.patientId);
    return (
      record.operationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient?.mrn.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Occupied': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Maintenance': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Cleaning': return 'text-purple-600 bg-purple-50 border-purple-100';
      case 'Scheduled': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'In-Progress': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Completed': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Cancelled': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Document uploaded successfully');
    setIsUploadDialogOpen(false);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
    toast.success('Operation record removed');
  };

  const handleExportOT = () => {
    const headers = ['Operation Name', 'Patient', 'Surgeon', 'Date', 'Status'];
    const rows = records.map(r => [
      r.operationName,
      MOCK_PATIENTS.find(p => p.id === r.patientId)?.name || 'N/A',
      MOCK_USERS.find(u => u.id === r.surgeonId)?.name || 'N/A',
      r.date,
      r.status
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'ot_records.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('OT records exported');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Operation Theatre Management</h1>
          <p className="text-muted-foreground">Monitor OTs, maintain operation records, and manage clinical media.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportOT}>
            <Download className="w-4 h-4" />
            Export Records
          </Button>
          <Dialog>
            <DialogTrigger render={
              <Button className="bg-medical-blue gap-2">
                <Plus className="w-4 h-4" />
                Schedule Operation
              </Button>
            } />
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Schedule New Operation</DialogTitle>
                <DialogDescription>Enter details to book an OT for a procedure.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select 
                    value={newOp.patientId}
                    onValueChange={(v) => setNewOp({...newOp, patientId: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_PATIENTS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Surgeon</Label>
                  <Select 
                    value={newOp.surgeonId}
                    onValueChange={(v) => setNewOp({...newOp, surgeonId: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select surgeon" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_USERS.filter(u => u.role === 'DOCTOR').map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>OT Unit</Label>
                  <Select 
                    value={newOp.theatreId}
                    onValueChange={(v) => setNewOp({...newOp, theatreId: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select OT" />
                    </SelectTrigger>
                    <SelectContent>
                      {theatres.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Procedure Name</Label>
                  <Input 
                    placeholder="e.g. Appendectomy" 
                    value={newOp.operationName}
                    onChange={(e) => setNewOp({...newOp, operationName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input 
                    type="date" 
                    value={newOp.date}
                    onChange={(e) => setNewOp({...newOp, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input 
                    type="time" 
                    value={newOp.time}
                    onChange={(e) => setNewOp({...newOp, time: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button className="bg-medical-blue" onClick={handleScheduleOp}>Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="theatres" className="w-full">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="theatres">OT Status</TabsTrigger>
          <TabsTrigger value="records">Operation Records</TabsTrigger>
        </TabsList>

        <TabsContent value="theatres" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {theatres.map((ot) => (
              <Card key={ot.id} className="border-none shadow-sm hover:ring-2 hover:ring-medical-blue/10 transition-all">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-tight ${getStatusColor(ot.status)}`}>
                      {ot.status}
                    </Badge>
                    <div className="p-2 rounded-lg bg-slate-50">
                      <Scissors className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">{ot.name}</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold tracking-wider">{ot.type} Surgery Unit</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  {ot.status === 'Occupied' ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Current Procedure</p>
                        <p className="text-sm font-semibold">Cardiac Bypass Surgery</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3 text-blue-400" />
                          <p className="text-xs text-blue-600">Started at 08:30 AM</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-xs h-8">View Details</Button>
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center justify-center text-slate-300">
                      <CheckCircle2 className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Ready for Procedure</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="records" className="mt-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by patient name, MRN or procedure..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Clock className="w-4 h-4" />
              Recent
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredRecords.map((record) => {
              const patient = MOCK_PATIENTS.find(p => p.id === record.patientId);
              const surgeon = MOCK_USERS.find(u => u.id === record.surgeonId);
              const theatre = MOCK_THEATRES.find(t => t.id === record.theatreId);

              return (
                <Card key={record.id} className="border-none shadow-sm overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                            {patient?.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{record.operationName}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="font-medium text-slate-900">{patient?.name}</span>
                              <span>•</span>
                              <span>{patient?.mrn}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className={`font-bold uppercase tracking-tight ${getStatusColor(record.status)}`}>
                          {record.status}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-medical-blue" onClick={() => toast.info('Editing record...')}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDeleteRecord(record.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Surgeon</p>
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-medical-blue" />
                            <p className="text-sm font-medium">{surgeon?.name}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Theatre</p>
                          <div className="flex items-center gap-2">
                            <Scissors className="w-3 h-3 text-medical-blue" />
                            <p className="text-sm font-medium">{theatre?.name}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Date & Time</p>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-medical-blue" />
                            <p className="text-sm font-medium">{record.date} | {record.startTime}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Media Files</p>
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-3 h-3 text-medical-blue" />
                            <p className="text-sm font-medium">{record.documents.length} Files Attached</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger render={
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => setSelectedRecord(record)}>
                              <Eye className="w-4 h-4" />
                              View Records & Media
                            </Button>
                          } />
                          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                            <DialogHeader className="p-6 pb-2 border-b">
                              <div className="flex items-center justify-between">
                                <div>
                                  <DialogTitle className="text-xl">{record.operationName} - {patient?.name}</DialogTitle>
                                  <p className="text-sm text-muted-foreground mt-1">Operation ID: {record.id} | MRN: {patient?.mrn}</p>
                                </div>
                                <Badge variant="outline" className={getStatusColor(record.status)}>{record.status}</Badge>
                              </div>
                            </DialogHeader>
                            
                            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                              <div className="space-y-8">
                                <section>
                                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Clinical Media & Documents</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    <div 
                                      className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all group"
                                      onClick={() => setIsUploadDialogOpen(true)}
                                    >
                                      <div className="p-3 rounded-full bg-slate-100 group-hover:bg-medical-blue group-hover:text-white transition-all">
                                        <Plus className="w-5 h-5" />
                                      </div>
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Add Media</span>
                                    </div>
                                    
                                    {record.documents.map((doc) => (
                                      <div key={doc.id} className="group relative aspect-square rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                                        {doc.type === 'Photo' ? (
                                          <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        ) : doc.type === 'Video' ? (
                                          <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                            <Video className="w-8 h-8 text-white opacity-50" />
                                          </div>
                                        ) : (
                                          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                            <FileText className="w-8 h-8 text-slate-400 mb-2" />
                                            <p className="text-[10px] font-bold truncate w-full">{doc.name}</p>
                                          </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                          <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                                            <Eye className="w-4 h-4" />
                                          </Button>
                                          <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                                            <MoreVertical className="w-4 h-4" />
                                          </Button>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                          <p className="text-[10px] text-white font-medium truncate">{doc.name}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </section>

                                <Separator />

                                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-4">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Procedure Details</h4>
                                    <div className="space-y-3">
                                      <div className="flex justify-between py-2 border-b border-slate-50">
                                        <span className="text-sm text-muted-foreground">Operation Name</span>
                                        <span className="text-sm font-semibold">{record.operationName}</span>
                                      </div>
                                      <div className="flex justify-between py-2 border-b border-slate-50">
                                        <span className="text-sm text-muted-foreground">Primary Surgeon</span>
                                        <span className="text-sm font-semibold">{surgeon?.name}</span>
                                      </div>
                                      <div className="flex justify-between py-2 border-b border-slate-50">
                                        <span className="text-sm text-muted-foreground">Theatre</span>
                                        <span className="text-sm font-semibold">{theatre?.name}</span>
                                      </div>
                                      <div className="flex justify-between py-2 border-b border-slate-50">
                                        <span className="text-sm text-muted-foreground">Date</span>
                                        <span className="text-sm font-semibold">{record.date}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Clinical Notes</h4>
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 min-h-[120px]">
                                      <p className="text-sm text-slate-600 italic">
                                        {record.notes || "No clinical notes recorded for this procedure yet."}
                                      </p>
                                    </div>
                                  </div>
                                </section>
                              </div>
                            </div>
                            
                            <DialogFooter className="p-6 border-t bg-slate-50/50">
                              <Button variant="outline" className="gap-2">
                                <FileText className="w-4 h-4" />
                                Generate OT Report
                              </Button>
                              <Button className="bg-medical-blue gap-2">
                                <Upload className="w-4 h-4" />
                                Upload More Files
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog>
                          <DialogTrigger render={
                            <Button variant="ghost" size="sm" className="gap-2 text-medical-blue hover:text-medical-blue hover:bg-blue-50">
                              <FileText className="w-4 h-4" />
                              OT Checklist
                            </Button>
                          } />
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Surgical Safety Checklist</DialogTitle>
                              <DialogDescription>Verify all safety protocols before procedure.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              {[
                                'Patient identity, site, and procedure confirmed',
                                'Surgical site marked',
                                'Anaesthesia safety check completed',
                                'Pulse oximeter on patient and functioning',
                                'Does patient have a known allergy?',
                                'Risk of >500ml blood loss?'
                              ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-medical-blue focus:ring-medical-blue" />
                                  <span className="text-sm font-medium text-slate-700">{item}</span>
                                </div>
                              ))}
                            </div>
                            <DialogFooter>
                              <Button className="bg-medical-blue w-full" onClick={() => toast.success('Checklist verified')}>Confirm Checklist</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Operation Media</DialogTitle>
            <DialogDescription>
              Attach photos, videos or documents to the operation record.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFileUpload} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file-name">File Name</Label>
              <Input id="file-name" placeholder="e.g. Pre-op X-ray" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-type">File Type</Label>
              <Select defaultValue="Photo">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Photo">Photo</SelectItem>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="Document">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select File</Label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400" />
                <p className="text-xs font-medium text-slate-500">Click to browse or drag & drop</p>
                <p className="text-[10px] text-slate-400">PNG, JPG, MP4 or PDF (max 50MB)</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-medical-blue">Upload File</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
