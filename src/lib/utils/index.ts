export function get_color(i: number, saturation: number, lightness: number) {
	let hue = 0;
	if (i > 0) {
		const exp = Math.floor(Math.log(i) / Math.log(2));
		const off = (i - Math.pow(2, exp)) * 2 + 1;
		const base = Math.pow(2, exp + 1);
		hue = Math.round(360 * (off / base));
	}
	return `hsl(${hue}, ${100 * saturation}%, ${100 * lightness}%)`;
}
