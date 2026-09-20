export type RsvpInput = {
	name: string;
	attendance: "yes" | "no" | "maybe";
	guests: number;
	phone?: string;
};

export type MessageInput = {
	name: string;
	message: string;
};

export type ValidationOk<T> = { ok: true; data: T };
export type ValidationFail = { ok: false; errors: string[] };

function str(value: unknown, max: number): string | null {
	if (typeof value !== "string") {
		return null;
	}
	const trimmed = value.trim();
	if (trimmed.length === 0 || trimmed.length > max) {
		return null;
	}
	return trimmed;
}

function isIntInRange(value: unknown, min: number, max: number): boolean {
	return (
		typeof value === "number" &&
		Number.isInteger(value) &&
		value >= min &&
		value <= max
	);
}

export function validateRsvp(
	input: unknown,
): ValidationOk<RsvpInput> | ValidationFail {
	if (typeof input !== "object" || input === null || Array.isArray(input)) {
		return { ok: false, errors: ["invalid body"] };
	}
	const body = input as Record<string, unknown>;
	const errors: string[] = [];

	const name = str(body.name, 120);
	if (name === null) {
		errors.push("name must be present and at most 120 characters");
	}

	const attendance = body.attendance;
	if (
		attendance !== "yes" &&
		attendance !== "no" &&
		attendance !== "maybe"
	) {
		errors.push("attendance must be one of yes, no, maybe");
	}

	if (!isIntInRange(body.guests, 1, 5)) {
		errors.push("guests must be an integer between 1 and 5");
	}

	if (body.phone !== undefined && body.phone !== null) {
		if (typeof body.phone !== "string" || body.phone.length > 20) {
			errors.push("phone must be a string of at most 20 characters");
		}
	}

	if (errors.length > 0) {
		return { ok: false, errors };
	}
	return {
		ok: true,
		data: {
			name: name as string,
			attendance: attendance as "yes" | "no" | "maybe",
			guests: body.guests as number,
			phone: body.phone as string | undefined,
		},
	};
}

export function validateMessage(
	input: unknown,
): ValidationOk<MessageInput> | ValidationFail {
	if (typeof input !== "object" || input === null || Array.isArray(input)) {
		return { ok: false, errors: ["invalid body"] };
	}
	const body = input as Record<string, unknown>;
	const errors: string[] = [];

	const name = str(body.name, 60);
	if (name === null) {
		errors.push("name must be present and at most 60 characters");
	}

	const message = str(body.message, 500);
	if (message === null) {
		errors.push("message must be present and at most 500 characters");
	}

	if (errors.length > 0) {
		return { ok: false, errors };
	}
	return { ok: true, data: { name: name as string, message: message as string } };
}