export interface Comment {
	id: string;
	postId: string;
	parentId?: string | null;
	author: string;
	content: string;
	createdAt?: string;
}
