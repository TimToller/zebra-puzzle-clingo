export enum Operator {
	Same = "same",
	Next = "next",
	Right = "right",
	Left = "left",
}

export type Rule = {
	leftCategory: string;
	leftValue: string;
	operator: Operator;
	rightCategory: string;
	rightValue: string;
};

export type DomainMap = {
	[category: string]: string[];
};

export function generateClingoCode(houseCount: number, rules: Rule[], domains: DomainMap): string {
	for (const rule of rules) {
		if (!domains[rule.leftCategory]) {
			throw new Error(`Left category "${rule.leftCategory}" is not defined in domains.`);
		}
		if (!domains[rule.rightCategory]) {
			throw new Error(`Right category "${rule.rightCategory}" is not defined in domains.`);
		}
		if (!domains[rule.leftCategory].includes(rule.leftValue)) {
			throw new Error(`Left value "${rule.leftValue}" is not in the domain of "${rule.leftCategory}".`);
		}
		if (!domains[rule.rightCategory].includes(rule.rightValue)) {
			throw new Error(`Right value "${rule.rightValue}" is not in the domain of "${rule.rightCategory}".`);
		}
	}

	let code = "";

	// Base definitions.
	code += `% Define houses numbered 1 through ${houseCount}.\n`;
	code += `house(1..${houseCount}).\n\n`;

	// Domain definitions.
	code += `% Define the domains for each attribute.\n`;
	for (const [category, values] of Object.entries(domains)) {
		if (category === "position") continue;
		code += `${category}(${values.join("; ")}).\n`;
	}
	code += "\n";

	// Each attribute is assigned to exactly one house.
	code += `% Each attribute is assigned to exactly one house.\n`;
	for (const category of Object.keys(domains)) {
		if (category === "position") continue;
		code += `1 { assign(A, H) : house(H) } 1 :- ${category}(A).\n`;
	}
	code += "\n";

	// Each house gets exactly one attribute from each category.
	code += `% Each house gets exactly one attribute from each category.\n`;
	for (const category of Object.keys(domains)) {
		if (category === "position") continue;
		code += `:- house(H), #count { X : assign(X, H), ${category}(X) } != 1.\n`;
	}
	code += "\n";

	// Helper predicate for neighbor relation.
	code += `% Define the next_to predicate for adjacency.\n`;
	code += `next_to(X, Y) :- house(X), house(Y), X = Y + 1.\n`;
	code += `next_to(X, Y) :- house(X), house(Y), X = Y - 1.\n\n`;

	code += `% Process each user-added rule.\n`;
	for (const rule of rules) {
		const Lcat = rule.leftCategory;
		const Rcat = rule.rightCategory;
		const Lval = rule.leftValue;
		const Rval = rule.rightValue;
		const op = rule.operator;

		if (op === Operator.Same) {
			if (Lcat === "position" && Rcat === "position") {
				// Both positions—nothing to enforce.
			} else if (Lcat === "position") {
				code += `:- assign(${Rval}, H), H != ${Lval}.\n`;
			} else if (Rcat === "position") {
				code += `:- assign(${Lval}, H), H != ${Rval}.\n`;
			} else {
				code += `:- assign(${Lval}, H1), assign(${Rval}, H2), H1 != H2.\n`;
			}
		} else if (op === Operator.Next) {
			code += `:- assign(${Lval}, H1), assign(${Rval}, H2), not next_to(H1, H2).\n`;
		} else if (op === Operator.Right) {
			code += `:- assign(${Lval}, H1), assign(${Rval}, H2), H1 != H2 + 1.\n`;
		} else if (op === Operator.Left) {
			code += `:- assign(${Lval}, H1), assign(${Rval}, H2), H1 != H2 - 1.\n`;
		}
	}

	// Display assignments.
	code += `#show assign/2.\n`;

	return code;
}
