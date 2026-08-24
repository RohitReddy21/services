import type { EquipmentOption, RequirementOption } from "@/types/booking";
import type { ServiceCategoryId } from "@/types/service";

export const equipmentOptions: Record<ServiceCategoryId, EquipmentOption[]> = {
  "air-conditioning": [
    { id: "wall-mounted", label: "Wall Mounted" },
    { id: "cassette", label: "Cassette" },
    { id: "vrv", label: "VRV" },
    { id: "vrf", label: "VRF" },
    { id: "multi-split", label: "Multi-Split" },
    { id: "commercial-ac", label: "Commercial AC" },
    { id: "residential-ac", label: "Residential AC" },
    { id: "other", label: "Other" },
  ],
  refrigeration: [
    { id: "fridge", label: "Fridge" },
    { id: "freezer", label: "Freezer" },
    { id: "cold-room", label: "Cold Room" },
    { id: "blast-chiller", label: "Blast Chiller" },
    { id: "ice-machine", label: "Ice Machine" },
    { id: "display-fridge", label: "Display Fridge" },
    { id: "walk-in-fridge", label: "Walk-In Fridge" },
    { id: "walk-in-freezer", label: "Walk-In Freezer" },
    { id: "commercial-refrigeration", label: "Commercial Refrigeration" },
    { id: "other", label: "Other" },
  ],
};

export const requirementOptions: RequirementOption[] = [
  { id: "installation", label: "Installation", description: "Fitting a new unit or system" },
  { id: "repair", label: "Repair", description: "Fixing a fault or breakdown" },
  { id: "servicing", label: "Servicing", description: "Routine service or clean" },
  { id: "maintenance", label: "Maintenance", description: "Planned preventative care" },
  { id: "replacement", label: "Replacement", description: "Replacing an old unit" },
  { id: "diagnostics", label: "Diagnostics", description: "Fault-finding & assessment" },
  { id: "emergency", label: "Emergency Service", description: "Urgent, out-of-hours issue" },
  { id: "other", label: "Other", description: "Something else" },
];

export const contactMethods: { id: "phone" | "email" | "sms"; label: string }[] = [
  { id: "phone", label: "Phone Call" },
  { id: "email", label: "Email" },
  { id: "sms", label: "Text Message" },
];
