export type Attendance = "yes" | "no" | "maybe";

export type RsvpBody = {
	name: string;
	attendance: Attendance;
	guests: number;
	phone?: string;
};

export type GuestMessage = {
	id: string;
	name: string;
	message: string;
	hearts: number;
	created_at: string;
};

type ApiResult<T> =
	| { ok: true; data: T }
	| { ok: false; status: number; errors: string[] };

async function send<T>(
	path: string,
	init?: RequestInit,
): Promise<ApiResult<T>> {
	try {
		const res = await fetch(path, init);
		if (!res.ok) {
			let errors: string[] = [];
			try {
				const body = (await res.json()) as { error?: string; errors?: string[] };
				errors = body.errors ?? (body.error ? [body.error] : []);
			} catch {
				errors = [];
			}
			return { ok: false, status: res.status, errors };
		}
		const data = (await res.json()) as T;
		return { ok: true, data };
	} catch {
		return { ok: false, status: 0, errors: ["Tidak dapat terhubung ke server. Coba lagi."] };
	}
}

function jsonInit(body: unknown): RequestInit {
	return {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
	};
}

export function postRsvp(body: RsvpBody): Promise<ApiResult<{ ok: true }>> {
	return send("/api/rsvp", jsonInit(body));
}

export function getMessages(): Promise<ApiResult<GuestMessage[]>> {
	return send("/api/messages");
}

export function postMessage(body: {
	name: string;
	message: string;
}): Promise<ApiResult<{ ok: true }>> {
	return send("/api/messages", jsonInit(body));
}

export function heartMessage(id: string): Promise<ApiResult<{ ok: true }>> {
	return send(`/api/messages/${id}/heart`, jsonInit({}));
}

export function postAdminLogin(password: string): Promise<ApiResult<{ ok: true }>> {
	return send("/api/admin/login", jsonInit({ password }));
}

export function postAdminLogout(): Promise<ApiResult<{ ok: true }>> {
	return send("/api/admin/logout", jsonInit({}));
}

export function getAdminMessages(): Promise<ApiResult<GuestMessage[]>> {
	return send("/api/admin/messages");
}

export type AdminRsvp = {
	id: string;
	name: string;
	attendance: Attendance;
	guests: number;
	phone: string | null;
	created_at: string;
};

export function getAdminRsvp(): Promise<ApiResult<AdminRsvp[]>> {
	return send("/api/admin/rsvp");
}

export function deleteAdminMessage(id: string): Promise<ApiResult<{ ok: true }>> {
	return send(`/api/admin/messages/${id}`, { method: "DELETE" });
}