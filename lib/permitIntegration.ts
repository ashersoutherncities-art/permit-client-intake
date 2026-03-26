// Permit Manager Integration Bridge
// Creates permit entries in permit-manager's localStorage when intake form is submitted
// Both apps share the same GitHub Pages domain: ashersoutherncities-art.github.io

import { BudgetBreakdown } from './budgetEngine';

const PERMIT_MANAGER_KEY = 'permit-manager-data';

// Map intake form project types to permit-manager project types
const PROJECT_TYPE_MAP: Record<string, string> = {
  'New Build': 'New Construction',
  'Renovation': 'Renovation',
  'Site Improvements': 'Commercial Buildout',
};

// Map intake permit selections to permit-manager PermitType
type PermitType = 'Building' | 'Electrical' | 'Mechanical' | 'Plumbing';

const DEFAULT_CHECKLIST: Record<PermitType, string[]> = {
  'Building': ['Site plan submitted', 'Structural calculations', 'Foundation inspection', 'Framing inspection', 'Final inspection'],
  'Electrical': ['Panel schedule', 'Load calculations', 'Rough-in inspection', 'Final inspection'],
  'Mechanical': ['HVAC load calculations', 'Duct layout', 'Rough-in inspection', 'Final inspection'],
  'Plumbing': ['Riser diagram', 'Water/sewer connection', 'Rough-in inspection', 'Final inspection'],
};

const ALL_DOC_TYPES = [
  'Architectural Plans', 'Electrical Plans', 'Mechanical Plans',
  'Plumbing Plans', 'Survey/Perc Test', 'Lien Agent Document',
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function generateReferenceId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `SCE-INT-${ts}-${rand}`;
}

interface IntakeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  squareFootage: string;
  projectType: string;
  scopeOfWork: string;
  permitElectrical: boolean;
  permitMechanical: boolean;
  permitHVAC: boolean;
  numberOfUnits: string;
  occupancyType: string;
  financingType: string;
  startDate?: string;
  completionDate?: string;
  usingOwnContractor: boolean;
  contractorName?: string;
}

export function createPermitEntry(formData: IntakeFormData, budget: BudgetBreakdown | null): string {
  if (typeof window === 'undefined') return '';

  const referenceId = generateReferenceId();
  const now = new Date().toISOString();
  const mappedType = PROJECT_TYPE_MAP[formData.projectType] || 'Renovation';

  // Build permits array based on intake selections - always include Building
  const permitTypes: PermitType[] = ['Building'];
  if (formData.permitElectrical) permitTypes.push('Electrical');
  if (formData.permitMechanical || formData.permitHVAC) permitTypes.push('Mechanical');
  // Add plumbing for new construction
  if (formData.projectType === 'New Build') permitTypes.push('Plumbing');

  const permits = permitTypes.map(pt => ({
    id: generateId(),
    type: pt,
    status: 'Not Started' as const,
    permitNumber: '',
    issueDate: '',
    expirationDate: '',
    inspector: '',
    notes: '',
    checklist: (DEFAULT_CHECKLIST[pt] || []).map((item: string) => ({ item, done: false })),
  }));

  const documents = ALL_DOC_TYPES.map(dt => ({
    id: generateId(),
    type: dt,
    uploaded: false,
    fileData: '',
    fileName: '',
    notes: '',
  }));

  // Build scope description
  const permitsNeeded = [];
  if (formData.permitElectrical) permitsNeeded.push('Electrical');
  if (formData.permitMechanical) permitsNeeded.push('Mechanical');
  if (formData.permitHVAC) permitsNeeded.push('HVAC');

  const scopeNotes = [
    `Scope: ${formData.scopeOfWork}`,
    `SF: ${formData.squareFootage}`,
    `Units: ${formData.numberOfUnits}`,
    `Permits Requested: ${permitsNeeded.length > 0 ? permitsNeeded.join(', ') : 'Building only'}`,
    `Financing: ${formData.financingType}`,
    `Client Contact: ${formData.email} | ${formData.phone}`,
    formData.usingOwnContractor && formData.contractorName
      ? `Contractor: ${formData.contractorName}`
      : 'Contractor: TBD (client not using own)',
    formData.startDate ? `Target Start: ${formData.startDate}` : '',
    formData.completionDate ? `Target Completion: ${formData.completionDate}` : '',
    `Reference ID: ${referenceId}`,
  ].filter(Boolean).join('\n');

  const timeline = [
    {
      id: generateId(),
      date: now.split('T')[0],
      title: 'Submitted via Client Intake Form',
      description: `${formData.firstName} ${formData.lastName} submitted intake form. ${referenceId}`,
      type: 'milestone' as const,
      status: 'Not Started' as const,
    },
  ];

  const project = {
    id: generateId(),
    name: `${formData.firstName} ${formData.lastName} - ${formData.propertyAddress.split(',')[0]}`,
    address: formData.propertyAddress,
    type: mappedType,
    value: budget ? budget.total : 0,
    createdAt: now,
    projectStatus: 'potential',
    statusDate: now,
    statusReason: `Submitted via client intake form. ${referenceId}`,
    permits,
    subcontractors: [],
    documents,
    timeline,
    // Custom metadata for linking
    _intakeRef: referenceId,
    _intakeSource: 'permit-client-intake',
    _clientEmail: formData.email,
    _clientPhone: formData.phone,
    _scopeOfWork: formData.scopeOfWork,
    _budgetEstimate: budget ? budget.total : 0,
  };

  // Load existing permit-manager data and append
  const existing = JSON.parse(localStorage.getItem(PERMIT_MANAGER_KEY) || '[]');
  existing.push(project);
  localStorage.setItem(PERMIT_MANAGER_KEY, JSON.stringify(existing));

  return referenceId;
}
