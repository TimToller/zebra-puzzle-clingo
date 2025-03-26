export type Rule = {
	leftCategory: string;
	leftValue: string;
	operator: string;
	rightCategory: string;
	rightValue: string;
};

export function generateClingoCode(houseCount: number, rules: Rule[]): string {
	let code = "";

	// Base definitions.
	code += `% Define houses numbered 1 through ${houseCount}.\n`;
	code += `house(1..${houseCount}).\n\n`;

	// Domain definitions.
	code += `% Define the domains for each attribute.\n`;
	code += `nationality(englishman; spaniard; ukrainian; norwegian; japanese).\n`;
	code += `color(red; green; ivory; yellow; blue).\n`;
	code += `beverage(coffee; tea; milk; orange_juice; water).\n`;
	code += `smoke(old_gold; kools; chesterfields; lucky_strike; parliaments).\n`;
	code += `pet(dog; snails; fox; horse; zebra).\n\n`;

	// Each attribute is assigned to exactly one house.
	code += `% Each attribute is assigned to exactly one house.\n`;
	code += `1 { assign(N, H) : house(H) } 1 :- nationality(N).\n`;
	code += `1 { assign(C, H) : house(H) } 1 :- color(C).\n`;
	code += `1 { assign(B, H) : house(H) } 1 :- beverage(B).\n`;
	code += `1 { assign(S, H) : house(H) } 1 :- smoke(S).\n`;
	code += `1 { assign(P, H) : house(H) } 1 :- pet(P).\n\n`;

	// Each house gets exactly one attribute from each category.
	code += `% Each house gets exactly one attribute from each category.\n`;
	code += `:- house(H), #count { N : assign(N, H), nationality(N) } != 1.\n`;
	code += `:- house(H), #count { C : assign(C, H), color(C) } != 1.\n`;
	code += `:- house(H), #count { B : assign(B, H), beverage(B) } != 1.\n`;
	code += `:- house(H), #count { S : assign(S, H), smoke(S) } != 1.\n`;
	code += `:- house(H), #count { P : assign(P, H), pet(P) } != 1.\n\n`;

	// Process each user-added rule.
	// Map "drink" to "beverage" to match our domain.
	const mapCategory = (cat: string): string => (cat === "drink" ? "beverage" : cat);

	// Helper predicate for neighbor relation.
	code += `% Define the next_to predicate for adjacency.\n`;
	code += `\nnext_to(X, Y) :- house(X), house(Y), X = Y + 1.\n`;
	code += `next_to(X, Y) :- house(X), house(Y), X = Y - 1.\n\n`;

	code += `% Process each user-added rule.\n`;
	for (const rule of rules) {
		const Lcat = mapCategory(rule.leftCategory);
		const Rcat = mapCategory(rule.rightCategory);
		const Lval = rule.leftValue;
		const Rval = rule.rightValue;
		const op = rule.operator;

		if (op === "same") {
			// If one side is a fixed position, output a constraint to force that house.
			if (rule.leftCategory === "position" && rule.rightCategory === "position") {
				// Both sides are positions; nothing to enforce.
			} else if (rule.leftCategory === "position") {
				// Left side fixes the house number.
				code += `:- assign(${Rcat}, H), H != ${Lval}.\n`;
			} else if (rule.rightCategory === "position") {
				// Right side fixes the house number.
				code += `:- assign(${Lcat}, H), H != ${Rval}.\n`;
			} else {
				// Neither side is position: enforce both attributes are in the same house.
				code += `:- assign(${Lcat}, H1), assign(${Rcat}, H2), H1 != H2.\n`;
			}
		} else if (op === "next") {
			// "next to": the two attributes must be in adjacent houses.
			code += `:- assign(${Lcat}, H1), assign(${Rcat}, H2), not next_to(H1, H2).\n`;
		} else if (op === "right") {
			// "right of": the left attribute is immediately to the right of the right attribute.
			code += `:- assign(${Lcat}, H1), assign(${Rcat}, H2), H1 != H2 + 1.\n`;
		} else if (op === "left") {
			// "left of": the left attribute is immediately to the left of the right attribute.
			code += `:- assign(${Lcat}, H1), assign(${Rcat}, H2), H1 != H2 - 1.\n`;
		}
	}

	// Display assignments.
	code += `#show assign/2.\n`;

	return code;
}
