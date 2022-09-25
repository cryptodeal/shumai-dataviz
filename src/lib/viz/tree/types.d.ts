export type TreeMapLastChild = {
	name: string;
	value: number;
	other_data?: Record<string, string | number>;
};

export type TreeMapDatum = {
	name: string;
	children: TreeMapDatum[] | TreeMapLastChild[];
};
