type Heart = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	rot: number;
	vr: number;
	color: string;
	alpha: number;
};

export function burstHearts(): void {
	if (typeof window === "undefined") return;
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	const style = getComputedStyle(document.documentElement);
	const colors = [
		style.getPropertyValue("--color-brand").trim(),
		style.getPropertyValue("--color-accent").trim(),
		style.getPropertyValue("--color-text-strong").trim(),
		style.getPropertyValue("--color-text-brand").trim(),
	].filter(Boolean);

	const canvas = document.createElement("canvas");
	canvas.setAttribute("aria-hidden", "true");
	Object.assign(canvas.style, {
		position: "fixed",
		inset: "0",
		width: "100%",
		height: "100%",
		pointerEvents: "none",
		zIndex: "100",
	});
	document.body.appendChild(canvas);

	const ctx = canvas.getContext("2d");
	if (!ctx) {
		canvas.remove();
		return;
	}

	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	canvas.width = Math.round(innerWidth * dpr);
	canvas.height = Math.round(innerHeight * dpr);
	ctx.scale(dpr, dpr);

	const count = 40;
	const hearts: Heart[] = Array.from({ length: count }, (_, i) => ({
		x: innerWidth * 0.3 + Math.random() * innerWidth * 0.4,
		y: innerHeight * 0.5 + Math.random() * innerHeight * 0.3,
		vx: (Math.random() - 0.5) * 1.4,
		vy: -1.2 - Math.random() * 1.6,
		size: 7 + Math.random() * 9,
		rot: Math.random() * Math.PI * 2,
		vr: (Math.random() - 0.5) * 0.18,
		color: colors.length > 0 ? colors[i % colors.length] : "#A95353",
		alpha: 1,
	}));

	const frames = 60;
	let frame = 0;
	let raf = 0;

	function drawHeart(x: number, y: number, size: number): void {
		ctx!.beginPath();
		ctx!.moveTo(x, y + size * 0.3);
		ctx!.bezierCurveTo(x, y, x - size * 0.5, y, x - size * 0.5, y + size * 0.3);
		ctx!.bezierCurveTo(x - size * 0.5, y + size * 0.65, x, y + size * 0.8, x, y + size);
		ctx!.bezierCurveTo(x, y + size * 0.8, x + size * 0.5, y + size * 0.65, x + size * 0.5, y + size * 0.3);
		ctx!.bezierCurveTo(x + size * 0.5, y, x, y, x, y + size * 0.3);
		ctx!.fill();
	}

	function tick(): void {
		frame++;
		ctx!.clearRect(0, 0, innerWidth, innerHeight);
		for (const h of hearts) {
			h.x += h.vx;
			h.y += h.vy;
			h.vy += 0.06;
			h.rot += h.vr;
			h.alpha = 1 - frame / frames;
			ctx!.globalAlpha = Math.max(0, h.alpha);
			ctx!.fillStyle = h.color;
			ctx!.save();
			ctx!.translate(h.x, h.y);
			ctx!.rotate(h.rot);
			drawHeart(0, 0, h.size);
			ctx!.restore();
		}
		ctx!.globalAlpha = 1;
		if (frame >= frames) {
			cancelAnimationFrame(raf);
			canvas.remove();
			return;
		}
		raf = requestAnimationFrame(tick);
	}

	raf = requestAnimationFrame(tick);
}