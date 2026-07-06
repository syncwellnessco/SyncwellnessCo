export interface ContactEnquiry {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

export interface EbookRequest {
  id: string;
  email: string;
  ebookName?: string;
  phone_number?: string;
  country_code?: string;
  status: 'pending' | 'sent';
  createdAt: string;
}
