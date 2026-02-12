export type Member = {
  id: string;
  name: string;
  color: string;
};

export type Event = {
  id: string;
  title: string; // customerName
  startISO: string;
  endISO: string;
  assigneeIds: string[];
  notes: string;
};

export type AvailabilityStatus = "available" | "busy" | "off";

export type AvailabilitySlot = {
  id: string;
  memberId: string;
  startISO: string;
  endISO: string;
  status: AvailabilityStatus;
};

export type CandidateStatus = "available" | "conflict";

export type MemberCandidate = {
  member: Member;
  status: CandidateStatus;
};
