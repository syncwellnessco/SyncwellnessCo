export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  author: string;
  published: boolean;
  featured?: boolean;
  tags?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateBlogInput = Omit<BlogPost, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};

export type UpdateBlogInput = Partial<Omit<BlogPost, "id" | "createdAt">> & {
  id: string;
};
