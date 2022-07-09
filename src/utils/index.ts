export function clamp(num: number, min: number, max: number) {
	if (num < min) return min;
	if (num > max) return max;
	return num;
}

export function sleep(ms: number): Promise<void> {
	return new Promise((res) => setTimeout(res, ms));
}
