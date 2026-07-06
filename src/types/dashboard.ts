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
  status: string;
  error_message?: string;
  createdAt: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image_url?: string;
  author: string;
  category?: string;
  tags?: string;
  published: boolean;
  created_at: string;
}
