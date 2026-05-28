export type AcademicSessionOption = {
  id: string;
  sessionName: string;
  isCurrent: boolean;
  terms: Array<{ id: string; termName: string; isCurrent: boolean }>;
};
