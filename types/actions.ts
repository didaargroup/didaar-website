
export type FormResults<T> = {
	errors?: {
		formErrors?: string[];
		fieldErrors?: {
			[K in keyof T]?: string[];
		};
	};
	success?: string;
};

export type InvitationStatus = {
	authenticated: boolean;
	needsInvitation: boolean;
	invitationAcceptedAt?: Date | null;
};
