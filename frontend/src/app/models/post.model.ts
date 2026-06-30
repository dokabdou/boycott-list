export interface Post {
  id?: string;
  companyName: string;
  category?: string;
  description: string;
  sourceLinks: string[];
  tags: string[];
  highlights?: string[][]; // new: up to 3 arrays, each up to 4 strings
  submittedBy?: string;
  anonymous?: boolean;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
}
