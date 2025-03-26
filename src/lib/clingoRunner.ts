export interface ClingoResult {
	Solver?: string;
	Calls: number;
	Call: {
		Witnesses: {
			Value: string[];
			Costs?: number[];
			Consequences?: any;
		}[];
	}[];
	Models: {
		More: "yes" | "no";
		Number: number;
		Brave?: "yes" | "no";
		Consequences?: any;
	};
	Result: "SATISFIABLE" | "UNSATISFIABLE" | "UNKNOWN" | "OPTIMUM FOUND";
	Time: {
		CPU: number;
		Model: number;
		Solve: number;
		Total: number;
		Unsat: number;
	};
	Warnings: string[];
}
export interface ClingoError {
	Result: "ERROR";
	Error: string;
}

interface ClingoWasm {
	init: (wasmUrl?: string) => Promise<void>;
	run: (program: string, options?: number) => Promise<ClingoResult>;
	restart: (wasmUrl?: string) => Promise<void>;
}

// Declare the global variable
declare const clingo: ClingoWasm;

export const runClingo = async (code: string) => {
	await clingo.init("https://cdn.jsdelivr.net/npm/clingo-wasm@0.2.1/dist/clingo.wasm");
	const {
		Call,
		Result,
		Models: { More, Number },
	} = await clingo.run(code, 2);

	if (Result === "SATISFIABLE") {
		const houseMap: Record<number, string[]> = {};
		Call[0].Witnesses[0].Value.forEach((assignment: string) => {
			if (assignment.startsWith("assign")) {
				const match = assignment.match(/assign\(([^,]+),([^,]+)\)/);
				if (match) {
					const value = match[1];
					const house = parseInt(match[2]);
					if (!houseMap[house]) {
						houseMap[house] = [];
					}
					houseMap[house].push(value);
				}
			}
		});
		return { result: houseMap, models: { number: Number, more: More === "yes" } };
	} else if (Result === "UNSATISFIABLE") {
		throw new Error("The problem is unsatisfiable.");
	} else if (Result === "UNKNOWN") {
		throw new Error("The result is unknown.");
	} else if (Result === "OPTIMUM FOUND") {
		throw new Error("An optimum solution was found.");
	} else {
		throw new Error("An error occurred while running Clingo.");
	}
};
