import { 
  Users, 
  Calendar, 
  Activity, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Baby,
  FlaskConical,
  Pill,
  CreditCard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

import { Link } from 'react-router-dom';
import { MOCK_PRESCRIPTIONS, MOCK_PATIENTS, MOCK_USERS } from '@/mockData';
import { FileText, Download, Eye } from 'lucide-react';
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';

const data = [
  { name: 'Mon', opd: 45, ipd: 12 },
  { name: 'Tue', opd: 52, ipd: 15 },
  { name: 'Wed', opd: 48, ipd: 10 },
  { name: 'Thu', opd: 61, ipd: 18 },
  { name: 'Fri', opd: 55, ipd: 14 },
  { name: 'Sat', opd: 40, ipd: 8 },
  { name: 'Sun', opd: 25, ipd: 5 },
];

const stats = [
  { name: 'Total Patients', value: '1,284', icon: Users, change: '+12%', trend: 'up', color: 'bg-blue-500' },
  { name: 'OPD Visits', value: '342', icon: Activity, change: '+5%', trend: 'up', color: 'bg-teal-500' },
  { name: 'IPD Admissions', value: '86', icon: Calendar, change: '-2%', trend: 'down', color: 'bg-indigo-500' },
  { name: 'Total Revenue', value: '₹1.42L', icon: TrendingUp, change: '+18%', trend: 'up', color: 'bg-emerald-500' },
];

const revenueData = [
  { name: 'Main Billing', value: 84250, color: '#1E6FA8' },
  { name: 'Pharmacy', value: 32500, color: '#2EC4B6' },
  { name: 'Lab & Rad', value: 25500, color: '#9333ea' },
];

export default function Dashboard() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{url: string, name: string} | null>(null);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hospital Overview</h1>
          <p className="text-muted-foreground">Real-time statistics and clinical insights.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/patient-overview">
            <Button variant="outline" size="sm" className="gap-2 border-medical-blue text-medical-blue hover:bg-blue-50">
              <Users className="w-4 h-4" />
              Patient 360 Overview
            </Button>
          </Link>
          <Link to="/billing">
            <Button variant="outline" size="sm" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Centralized Billing System
            </Button>
          </Link>
          <Button size="sm" className="bg-medical-blue">View All Stats</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="overflow-hidden border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color.split('-')[1]}-600`} />
                </div>
                <Badge variant="secondary" className={`flex items-center gap-1 ${stat.trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </Badge>
              </div>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">{stat.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Daily revenue collection across departments.</CardDescription>
            </div>
            <div className="flex gap-4">
              {revenueData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{d.name}</span>
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={100} />
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                  {revenueData.map((entry, index) => (
                    <Bar key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across departments.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { time: '10 mins ago', title: 'New Admission', desc: 'Priya Singh - Maternity Ward', icon: Baby, color: 'text-pink-500' },
                { time: '25 mins ago', title: 'Lab Report Ready', desc: 'MRN-002 - Blood Work', icon: FlaskConical, color: 'text-blue-500' },
                { time: '1 hour ago', title: 'Critical Alert', desc: 'Bed 201 - Oxygen Low', icon: AlertCircle, color: 'text-rose-500' },
                { time: '2 hours ago', title: 'Pharmacy Stock', desc: 'Amoxicillin below min level', icon: Pill, color: 'text-amber-500' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    {i !== 3 && <div className="absolute top-8 left-4 w-[1px] h-6 bg-slate-100"></div>}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-xs text-medical-blue hover:bg-blue-50">View All Activity</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Departmental Performance Overview</CardTitle>
          <CardDescription>Consolidated view of specialty working and patient load.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { dept: 'OPD', patients: 145, staff: 12, status: 'High Load', color: 'bg-blue-500' },
              { dept: 'IPD', patients: 32, staff: 18, status: 'Stable', color: 'bg-indigo-500' },
              { dept: 'Pharmacy', patients: 89, staff: 4, status: 'Efficient', color: 'bg-teal-500' },
              { dept: 'Lab/Rad', patients: 56, staff: 6, status: 'Pending Reports', color: 'bg-purple-500' },
              { dept: 'OT', patients: 4, staff: 10, status: 'In-Progress', color: 'bg-rose-500' },
            ].map((d) => (
              <div key={d.dept} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${d.color}`}></div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{d.dept}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-bold">{d.patients}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Active Patients</p>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400">{d.staff} Staff On Duty</span>
                  <Badge variant="outline" className="text-[8px] h-4 px-1">{d.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Prescription Uploads</CardTitle>
            <CardDescription>Prescriptions uploaded by doctors for review.</CardDescription>
          </div>
          <Badge variant="outline" className="text-medical-blue border-blue-200">Admin View</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_PRESCRIPTIONS.map((rx) => {
              const patient = MOCK_PATIENTS.find(p => p.id === rx.patientId);
              const doctor = MOCK_USERS.find(u => u.id === rx.doctorId);
              return (
                <div key={rx.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-medical-blue/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-medical-blue">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{patient?.name || 'Unknown Patient'}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-medium">By {doctor?.name || 'Doctor'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {rx.attachmentUrl ? (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-medical-blue hover:bg-blue-50"
                          onClick={() => {
                            setPreviewData({ url: rx.attachmentUrl!, name: rx.attachmentName || 'Prescription' });
                            setIsPreviewOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:bg-slate-50"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = rx.attachmentUrl!;
                            link.download = rx.attachmentName || 'prescription.pdf';
                            link.click();
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-slate-400">No PDF</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <Button variant="outline" className="w-full mt-6 text-xs text-medical-blue hover:bg-blue-50">View All Prescriptions</Button>
        </CardContent>
      </Card>

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
