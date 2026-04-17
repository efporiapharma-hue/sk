import { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Shield, 
  Mail, 
  Phone,
  Briefcase,
  MapPin,
  Calendar
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { MOCK_USERS } from '@/mockData';
import { toast } from 'sonner';
import { Edit, Trash2, Download } from 'lucide-react';

export default function Staff() {
  const [staff, setStaff] = useState(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [newStaff, setNewStaff] = useState({ name: '', role: 'doctor', department: '', email: '', phone: '', joiningDate: '' });

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.email) {
      toast.error('Please fill in required fields');
      return;
    }
    const staffToAdd = {
      ...newStaff,
      id: `staff-${Date.now()}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newStaff.name}`,
      role: newStaff.role.toUpperCase()
    };
    setStaff([...staff, staffToAdd as any]);
    setNewStaff({ name: '', role: 'doctor', department: '', email: '', phone: '', joiningDate: '' });
    toast.success('New staff member added');
  };

  const handleDeleteStaff = (id: string) => {
    setStaff(staff.filter(s => s.id !== id));
    toast.success('Staff member removed');
  };

  const handleExportStaff = () => {
    const headers = ['Name', 'Role', 'Department', 'Email'];
    const rows = staff.map(s => [
      s.name,
      s.role,
      s.department || 'N/A',
      s.email
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'staff_directory.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Staff directory exported');
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.department && s.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">Manage hospital employees, roles, and access permissions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportStaff}>
            <Download className="w-4 h-4" />
            Export Directory
          </Button>
          <Dialog>
            <DialogTrigger render={
              <Button className="bg-medical-blue gap-2">
                <Plus className="w-4 h-4" />
                Add New Staff
              </Button>
            } />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>Register a new staff member in the system.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Enter name" 
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select 
                    value={newStaff.role}
                    onValueChange={(v) => setNewStaff({...newStaff, role: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="support">Support Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input 
                    placeholder="e.g. Cardiology" 
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({...newStaff, department: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    placeholder="email@hospital.com" 
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    placeholder="+91 00000 00000" 
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Joining Date</Label>
                  <Input 
                    type="date" 
                    value={newStaff.joiningDate}
                    onChange={(e) => setNewStaff({...newStaff, joiningDate: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button className="bg-medical-blue" onClick={handleAddStaff}>Add Staff</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Total Staff</p>
            <h3 className="text-xl font-bold">124</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Doctors</p>
            <h3 className="text-xl font-bold text-blue-600">18</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Nurses</p>
            <h3 className="text-xl font-bold text-teal-600">42</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Admin/Support</p>
            <h3 className="text-xl font-bold text-slate-600">64</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Employee Directory</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search employee..." 
                className="pl-10 bg-slate-50 border-none h-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="whitespace-nowrap">Employee</TableHead>
                  <TableHead className="whitespace-nowrap">Role & Dept</TableHead>
                  <TableHead className="whitespace-nowrap">Contact</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((user) => (
                  <TableRow key={user.id} className="border-slate-50">
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground">ID: EMP-{user.id.toUpperCase()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <Badge variant="outline" className="w-fit text-[10px] font-bold uppercase tracking-tight mb-1">
                          {user.role.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{user.department || 'Administration'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          +91 98765 43210
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info('Editing staff member...')}>
                          <Edit className="w-4 h-4 text-medical-blue" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDeleteStaff(user.id)}>
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
    </div>
  );
}
