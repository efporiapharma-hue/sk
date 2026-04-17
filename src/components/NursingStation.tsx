import React, { useState } from 'react';
import { 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Plus, 
  MoreVertical,
  Thermometer,
  Heart,
  Wind,
  Droplets,
  ClipboardList,
  Calendar,
  Download,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MOCK_PATIENTS, MOCK_PATIENT_VITALS, MOCK_NURSING_TASKS, MOCK_NURSE_SHIFTS, MOCK_USERS } from '@/mockData';
import { toast } from 'sonner';

export default function NursingStation() {
  const [tasks, setTasks] = useState(MOCK_NURSING_TASKS);
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [vitals, setVitals] = useState(MOCK_PATIENT_VITALS);
  const [isVitalsDialogOpen, setIsVitalsDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [newVitals, setNewVitals] = useState({ bp: '', pulse: '', temp: '', spo2: '' });

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: task.status === 'Pending' ? 'Completed' : 'Pending' } : task
    ));
    toast.success('Task status updated');
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    toast.success('Task removed');
  };

  const handleUpdateVitals = () => {
    if (!selectedPatientId) return;
    const updatedVitals = vitals.map(v => 
      v.patientId === selectedPatientId 
        ? { ...v, ...newVitals, lastUpdated: new Date().toISOString() } 
        : v
    );
    setVitals(updatedVitals);
    setIsVitalsDialogOpen(false);
    toast.success('Vitals updated successfully');
  };

  const handleUpdateCondition = (patientId: string, status: string) => {
    setPatients(patients.map(p => p.id === patientId ? { ...p, status } : p));
    toast.success(`Patient status updated to ${status}`);
  };

  const getStatusAnimation = (status: string) => {
    switch (status) {
      case 'High Risk': return 'animate-blink-red';
      case 'Moderate Risk': return 'animate-blink-amber';
      case 'Stable': return 'animate-glow-green';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'High Risk': return 'bg-rose-500';
      case 'Moderate Risk': return 'bg-amber-500';
      case 'Stable': return 'bg-emerald-500';
      default: return 'bg-slate-300';
    }
  };

  const handleExportNursing = () => {
    const headers = ['Task', 'Due Time', 'Priority', 'Status'];
    const rows = tasks.map(t => [t.description, t.dueTime, t.priority, t.status]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'nursing_tasks.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Nursing tasks exported');
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Smart Nursing Station</h1>
          <p className="text-muted-foreground">Real-time Ward Monitoring & Workflow</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportNursing}>
            <Download className="w-4 h-4" />
            Export Tasks
          </Button>
          <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
            <span className="text-xs font-semibold text-slate-600">Stable</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
            <span className="text-xs font-semibold text-slate-600">Moderate Risk</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
            <div className="w-2.5 h-2.5 bg-rose-500 rounded-full"></div>
            <span className="text-xs font-semibold text-slate-600">High Risk</span>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ward Patient Overview */}
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Ward Patient Overview</CardTitle>
              <CardDescription>Real-time monitoring of admitted patients</CardDescription>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>Stable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span>Moderate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                <span>High Risk</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patients.filter(p => p.status !== 'Active').map((patient, idx) => {
                const patientVitals = vitals.find(v => v.patientId === patient.id);
                const riskStatus = patient.status || 'Stable';
                
                return (
                  <Card key={patient.id} className={`border-2 transition-all duration-500 ${
                    riskStatus === 'High Risk' ? 'border-rose-200 bg-rose-50/30' : 
                    riskStatus === 'Moderate Risk' ? 'border-amber-200 bg-amber-50/30' : 
                    'border-emerald-200 bg-emerald-50/30'
                  } shadow-none`}>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="outline" className="text-[10px] font-bold uppercase mb-2 bg-white">
                            BED G{idx + 1}
                          </Badge>
                          <h4 className="font-bold text-slate-800">{patient.name}</h4>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
                            {patient.age}, {patient.gender.charAt(0)} | {patient.mrn}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className={`w-4 h-4 rounded-full ${getStatusColor(riskStatus)} ${getStatusAnimation(riskStatus)}`}></div>
                          <Select value={riskStatus} onValueChange={(v: string) => handleUpdateCondition(patient.id, v)}>
                            <SelectTrigger className="h-7 text-[10px] w-24">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Stable">Stable</SelectItem>
                              <SelectItem value="Moderate Risk">Moderate</SelectItem>
                              <SelectItem value="High Risk">High Risk</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-slate-400" />
                          <div className="text-xs">
                            <span className="text-slate-500 font-medium">BP: </span>
                            <span className="font-bold text-slate-700">{patientVitals?.bp || '--/--'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="w-3.5 h-3.5 text-slate-400" />
                          <div className="text-xs">
                            <span className="text-slate-500 font-medium">Pulse: </span>
                            <span className="font-bold text-slate-700">{patientVitals?.pulse || '--'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                          <div className="text-xs">
                            <span className="text-slate-500 font-medium">Temp: </span>
                            <span className="font-bold text-slate-700">{patientVitals?.temp || '--'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wind className="w-3.5 h-3.5 text-slate-400" />
                          <div className="text-xs">
                            <span className="text-slate-500 font-medium">SpO2: </span>
                            <span className="font-bold text-slate-700">{patientVitals?.spo2 || '--'}%</span>
                          </div>
                        </div>
                      </div>

                      <Separator className="opacity-50" />
                      
                      <div className="flex justify-between items-center">
                        <p className="text-[9px] text-slate-400 font-medium italic">
                          Last Updated: {patientVitals?.lastUpdated ? new Date(patientVitals.lastUpdated).toLocaleTimeString() : 'Never'}
                        </p>
                        <Dialog>
                          <DialogTrigger render={<Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1.5 text-medical-blue hover:text-medical-blue hover:bg-blue-50" />}>
                            <Plus className="w-3 h-3" />
                            Update Vitals
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                              <DialogTitle>Update Patient Vitals</DialogTitle>
                              <DialogDescription>Enter current vital signs for {patient.name}.</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                              <div className="space-y-2">
                                <Label>Blood Pressure</Label>
                                <Input placeholder="120/80" onChange={(e) => {
                                  setSelectedPatientId(patient.id);
                                  setNewVitals({...newVitals, bp: e.target.value});
                                }} />
                              </div>
                              <div className="space-y-2">
                                <Label>Pulse Rate</Label>
                                <Input placeholder="72" type="number" onChange={(e) => {
                                  setSelectedPatientId(patient.id);
                                  setNewVitals({...newVitals, pulse: e.target.value});
                                }} />
                              </div>
                              <div className="space-y-2">
                                <Label>Temperature (°F)</Label>
                                <Input placeholder="98.6" onChange={(e) => {
                                  setSelectedPatientId(patient.id);
                                  setNewVitals({...newVitals, temp: e.target.value});
                                }} />
                              </div>
                              <div className="space-y-2">
                                <Label>SpO2 (%)</Label>
                                <Input placeholder="98" type="number" onChange={(e) => {
                                  setSelectedPatientId(patient.id);
                                  setNewVitals({...newVitals, spo2: e.target.value});
                                }} />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button className="bg-medical-blue w-full" onClick={handleUpdateVitals}>Save Vitals</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {/* Placeholder for more beds */}
              {[3, 4, 5].map(i => (
                <Card key={i} className="border-2 border-slate-100 bg-slate-50/30 shadow-none opacity-60">
                  <CardContent className="p-4 flex flex-col items-center justify-center min-h-[140px] text-slate-300">
                    <Plus className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Available Bed G{i}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar: Roster & Monitoring */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Shift Roster</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_NURSE_SHIFTS.map((shift) => {
                const nurse = MOCK_USERS.find(u => u.id === shift.nurseId);
                return (
                  <div key={shift.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 font-bold">
                        {nurse?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-0.5">{shift.shiftType} Shift</p>
                        <p className="text-sm font-bold text-slate-800">{nurse?.name}</p>
                        <p className="text-[10px] text-slate-500">{shift.ward}</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-50 text-blue-600 border-none text-[10px]">Active</Badge>
                  </div>
                );
              })}
              <Button variant="outline" className="w-full text-xs h-9 border-slate-200 text-slate-600">View Full Roster</Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-slate-900 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">ICU Smart Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 flex flex-col items-center justify-center text-slate-500">
                <Activity className="w-12 h-12 mb-4 opacity-20 animate-pulse" />
                <p className="text-xs font-medium uppercase tracking-widest">No Critical Alerts</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medication Due List */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-white">
            <CardTitle className="text-lg">Medication Due List</CardTitle>
            <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-none">0 Pending</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[300px] overflow-y-auto custom-scrollbar">
              <div className="p-4 space-y-3">
                {tasks.filter(t => t.description.includes('Administer')).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        <Droplets className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {task.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{task.dueTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant={task.status === 'Completed' ? 'ghost' : 'outline'} 
                        size="sm"
                        onClick={() => toggleTaskStatus(task.id)}
                        className={task.status === 'Completed' ? 'text-emerald-600' : 'border-slate-200'}
                      >
                        {task.status === 'Completed' ? <CheckCircle2 className="w-4 h-4" /> : 'Mark Done'}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nursing Tasks */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-white">
            <CardTitle className="text-lg">Nursing Tasks</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-medical-blue h-8 gap-1">
              <Plus className="w-3 h-3" />
              Add Task
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[300px] overflow-y-auto custom-scrollbar">
              <div className="p-4 space-y-3">
                {tasks.filter(t => !t.description.includes('Administer')).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {task.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={`text-[8px] font-bold uppercase ${
                            task.priority === 'High' ? 'text-rose-600 border-rose-100 bg-rose-50' :
                            task.priority === 'Medium' ? 'text-amber-600 border-amber-100 bg-amber-50' :
                            'text-slate-600 border-slate-100 bg-slate-50'
                          }`}>
                            {task.priority} Priority
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant={task.status === 'Completed' ? 'ghost' : 'outline'} 
                        size="sm"
                        onClick={() => toggleTaskStatus(task.id)}
                        className={task.status === 'Completed' ? 'text-emerald-600' : 'border-slate-200'}
                      >
                        {task.status === 'Completed' ? <CheckCircle2 className="w-4 h-4" /> : 'Complete'}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
