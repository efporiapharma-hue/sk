import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  User,
  Calendar, 
  FileText, 
  CreditCard, 
  FlaskConical, 
  Stethoscope, 
  Pill, 
  Baby, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Plus,
  Scissors,
  ClipboardList,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/sonner';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

import Dashboard from './components/Dashboard';
import OPD from './components/OPD';
import IPD from './components/IPD';
import Billing from './components/Billing';
import Pharmacy from './components/Pharmacy';
import Maternity from './components/Maternity';
import Lab from './components/Lab';
import Staff from './components/Staff';
import Expenses from './components/Expenses';
import OTManagement from './components/OTManagement';
import NursingStation from './components/NursingStation';
import PharmacyPOS from './components/PharmacyPOS';
import Insurance from './components/Insurance';
import PatientOverview from './components/PatientOverview';
import SettingsComponent from './components/Settings';
import Login from './components/Login';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'OPD Management', icon: Stethoscope, path: '/opd' },
  { name: 'IPD Management', icon: Calendar, path: '/ipd' },
  { name: 'Nursing Station', icon: ClipboardList, path: '/nursing' },
  { name: 'OT Management', icon: Scissors, path: '/ot' },
  { name: 'Insurance & TPA', icon: Shield, path: '/insurance' },
  { name: 'Patient 360', icon: User, path: '/patient-overview' },
  { name: 'Billing & Accounts', icon: CreditCard, path: '/billing' },
  { name: 'Lab & Radiology', icon: FlaskConical, path: '/lab' },
  { name: 'Pharmacy', icon: Pill, path: '/pharmacy' },
  { name: 'Maternity', icon: Baby, path: '/maternity' },
  { name: 'Staff Management', icon: Users, path: '/staff' },
  { name: 'Expenses', icon: FileText, path: '/expenses' },
];

function SidebarContent({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  
  return (
    <div className="flex flex-col h-full bg-white border-r overflow-hidden">
      <div className="p-6 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 bg-medical-blue rounded-lg flex items-center justify-center text-white font-bold text-xl">
          G
        </div>
        <div>
          <h1 className="text-sm font-bold leading-none text-medical-blue">GLOBAL HOSPITAL</h1>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">Maternity Center</p>
        </div>
      </div>
      
      <Separator className="flex-shrink-0" />
      
      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-medical-blue text-white' 
                    : 'text-secondary-text hover:bg-slate-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 mt-auto flex-shrink-0 border-t bg-white">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali" />
              <AvatarFallback>AG</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">Dr. Anjali Gupta</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Super Admin</p>
            </div>
          </div>
          <Link to="/settings">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8">
              <Settings className="w-3 h-3" />
              Settings
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start gap-2 text-xs h-8 mt-1 text-soft-red hover:text-soft-red hover:bg-red-50"
            onClick={onLogout}
          >
            <LogOut className="w-3 h-3" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('hospital_auth') === 'true';
  });

  const handleLogin = (username: string) => {
    localStorage.setItem('hospital_auth', 'true');
    localStorage.setItem('hospital_user', username);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('hospital_auth');
    localStorage.removeItem('hospital_user');
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
  };

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <Router>
      <div className="flex h-[100dvh] bg-soft-white overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 h-full">
          <SidebarContent onLogout={handleLogout} />
        </aside>
 
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-10">
            <div className="flex items-center gap-4">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger render={
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                } />
                <SheetContent side="left" className="p-0 w-64 h-full">
                  <SidebarContent onLogout={handleLogout} />
                </SheetContent>
              </Sheet>
              
              <div className="relative hidden md:block w-64 lg:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search patients, MRN, or appointments..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20 transition-all"
                />
              </div>
            </div>
 
            <div className="flex items-center gap-2 lg:gap-4">
              <Dialog>
                <DialogTrigger render={
                  <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 rounded-full px-4 border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white transition-all">
                    <Plus className="w-4 h-4" />
                    New Registration
                  </Button>
                } />
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Quick Patient Registration</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="header-name">Full Name</Label>
                      <Input id="header-name" placeholder="Enter patient name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="header-phone">Phone Number</Label>
                      <Input id="header-phone" placeholder="Enter phone number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="header-age">Age</Label>
                      <Input id="header-age" type="number" placeholder="Age" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="header-gender">Gender</Label>
                      <Select>
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
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button className="bg-medical-blue" onClick={() => toast.success('Patient registered successfully')}>Register Patient</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Separator orientation="vertical" className="h-6 mx-2 hidden sm:block" />
              
              <Button variant="ghost" size="icon" className="relative text-secondary-text">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-soft-red rounded-full border-2 border-white"></span>
              </Button>
              
              <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-medical-blue/20 transition-all">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali" />
                <AvatarFallback>AG</AvatarFallback>
              </Avatar>
            </div>
          </header>
 
          {/* Viewport */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/opd" element={<OPD />} />
              <Route path="/ipd" element={<IPD />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/lab" element={<Lab />} />
              <Route path="/pharmacy" element={<Pharmacy />} />
              <Route path="/pharmacy/pos" element={<PharmacyPOS />} />
              <Route path="/maternity" element={<Maternity />} />
              <Route path="/ot" element={<OTManagement />} />
              <Route path="/insurance" element={<Insurance />} />
              <Route path="/patient-overview" element={<PatientOverview />} />
              <Route path="/nursing" element={<NursingStation />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/settings" element={<SettingsComponent />} />
            </Routes>
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </Router>
  );
}
