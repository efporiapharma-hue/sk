export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'HOSPITAL_ADMIN' 
  | 'RECEPTION' 
  | 'DOCTOR' 
  | 'NURSE' 
  | 'LAB_STAFF' 
  | 'PHARMACIST' 
  | 'ACCOUNTANT'
  | 'SURGEON';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  address: string;
  bloodGroup?: string;
  lastVisit?: string;
  status: string;
  husbandName?: string;
  fatherName?: string;
  dob?: string;
  tpaId?: string;
  tpaValidity?: string;
  guardianName?: string;
  attendingDoctorId?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  type: 'OPD' | 'Follow-up' | 'Emergency';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'In-Progress';
  reason?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  diagnosis?: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
  }[];
  tests?: string[];
  notes?: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface BillingRecord {
  id: string;
  patientId: string;
  date: string;
  items: {
    description: string;
    amount: number;
    category: 'OPD' | 'IPD' | 'Lab' | 'Radiology' | 'Pharmacy' | 'Other';
  }[];
  totalAmount: number;
  paidAmount: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
  paymentMode?: 'Cash' | 'UPI' | 'Card';
}

export interface Bed {
  id: string;
  number: string;
  ward: string;
  type: 'General' | 'Semi-Private' | 'Private' | 'ICU' | 'Maternity';
  status: 'Available' | 'Occupied' | 'Maintenance';
  patientId?: string;
}

export interface LabTest {
  id: string;
  patientId: string;
  testName: string;
  category: 'Pathology' | 'Radiology';
  orderedBy: string;
  date: string;
  status: 'Ordered' | 'Sample Collected' | 'Processing' | 'Completed';
  result?: string;
  reportUrl?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Medicine' | 'Surgical' | 'General';
  stock: number;
  unit: string;
  expiryDate?: string;
  batchNumber?: string;
  minStockLevel: number;
}

export interface OperationTheatre {
  id: string;
  name: string;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Cleaning';
  type: 'Major' | 'Minor' | 'Cardiac' | 'Orthopedic' | 'Emergency';
}

export interface OperationRecord {
  id: string;
  patientId: string;
  theatreId: string;
  surgeonId: string;
  assistantSurgeons?: string[];
  anesthetistId?: string;
  nurses?: string[];
  operationName: string;
  date: string;
  startTime: string;
  endTime?: string;
  status: 'Scheduled' | 'In-Progress' | 'Completed' | 'Cancelled';
  notes?: string;
  documents: {
    id: string;
    name: string;
    url: string;
    type: 'Document' | 'Photo' | 'Video';
    uploadedAt: string;
    uploadedBy: string;
  }[];
}

export interface NursingTask {
  id: string;
  patientId: string;
  description: string;
  dueTime: string;
  status: 'Pending' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
}

export interface NurseShift {
  id: string;
  nurseId: string;
  shiftType: 'Morning' | 'Evening' | 'Night';
  ward: string;
  status: 'Active' | 'Completed';
}

export interface PatientVitals {
  patientId: string;
  bp: string;
  pulse: number;
  temp: string;
  spo2: number;
  lastUpdated: string;
}
