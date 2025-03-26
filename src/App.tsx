import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import ClingoEditor from "./components/clingo-editor";
import DomainEditor from "./components/domain-editor";
import RuleEditor from "./components/rule-editor";
import { Label } from "./components/ui/label";
import { Separator } from "./components/ui/separator";
import { DomainMap, generateClingoCode, Operator, Rule } from "./lib/clingoGenerator";
import { runClingo } from "./lib/clingoRunner";

const defaultDomains: DomainMap = {
	nationality: ["englishman", "spaniard", "ukrainian", "norwegian", "japanese"],
	color: ["red", "green", "ivory", "yellow", "blue"],
	beverage: ["coffee", "tea", "milk", "orange_juice", "water"],
	smoke: ["old_gold", "kools", "chesterfields", "lucky_strike", "parliaments"],
	pet: ["dog", "snails", "fox", "horse", "zebra"],
};

const defaultRules: Rule[] = [
	// 1. The Englishman lives in the red house.
	{
		leftCategory: "nationality",
		leftValue: "englishman",
		operator: Operator.Same,
		rightCategory: "color",
		rightValue: "red",
	},
	// 2. The Spaniard owns the dog.
	{
		leftCategory: "nationality",
		leftValue: "spaniard",
		operator: Operator.Same,
		rightCategory: "pet",
		rightValue: "dog",
	},
	// 3. Coffee is drunk in the green house.
	{
		leftCategory: "beverage",
		leftValue: "coffee",
		operator: Operator.Same,
		rightCategory: "color",
		rightValue: "green",
	},
	// 4. The Ukrainian drinks tea.
	{
		leftCategory: "nationality",
		leftValue: "ukrainian",
		operator: Operator.Same,
		rightCategory: "beverage",
		rightValue: "tea",
	},
	// 5. The green house is immediately to the right of the ivory house.
	{
		leftCategory: "color",
		leftValue: "green",
		operator: Operator.Right,
		rightCategory: "color",
		rightValue: "ivory",
	},
	// 6. The Old Gold smoker owns snails.
	{
		leftCategory: "smoke",
		leftValue: "old_gold",
		operator: Operator.Same,
		rightCategory: "pet",
		rightValue: "snails",
	},
	// 7. Kools are smoked in the yellow house.
	{
		leftCategory: "smoke",
		leftValue: "kools",
		operator: Operator.Same,
		rightCategory: "color",
		rightValue: "yellow",
	},
	// 8. Milk is drunk in the middle house (house 3).
	{
		leftCategory: "beverage",
		leftValue: "milk",
		operator: Operator.Same,
		rightCategory: "position",
		rightValue: "3",
	},
	// 9. The Norwegian lives in the first house.
	{
		leftCategory: "nationality",
		leftValue: "norwegian",
		operator: Operator.Same,
		rightCategory: "position",
		rightValue: "1",
	},
	// 10. The man who smokes Chesterfields lives in the house next to the man with the fox.
	{
		leftCategory: "smoke",
		leftValue: "chesterfields",
		operator: Operator.Next,
		rightCategory: "pet",
		rightValue: "fox",
	},
	// 11. Kools are smoked in the house next to the house where the horse is kept.
	{
		leftCategory: "smoke",
		leftValue: "kools",
		operator: Operator.Next,
		rightCategory: "pet",
		rightValue: "horse",
	},
	// 12. The Lucky Strike smoker drinks orange juice.
	{
		leftCategory: "smoke",
		leftValue: "lucky_strike",
		operator: Operator.Same,
		rightCategory: "beverage",
		rightValue: "orange_juice",
	},
	// 13. The Japanese smokes Parliaments.
	{
		leftCategory: "nationality",
		leftValue: "japanese",
		operator: Operator.Same,
		rightCategory: "smoke",
		rightValue: "parliaments",
	},
	// 14. The Norwegian lives next to the blue house.
	{
		leftCategory: "nationality",
		leftValue: "norwegian",
		operator: Operator.Next,
		rightCategory: "color",
		rightValue: "blue",
	},
];

function App() {
	const [houseCount, setHouseCount] = useState<number>(5);
	const [rules, setRules] = useState<Rule[]>([]);
	const [clingoCode, setClingoCode] = useState<string>("");
	const [solution, setSolution] = useState<string>("");
	const [domainMap, setDomainMap] = useState<DomainMap>({});

	const domainWithPosition = {
		...domainMap,
		position: new Array(houseCount).fill(0).map((_, i) => (i + 1).toString()),
	};

	const handleGenerateCode = () => {
		try {
			const code = generateClingoCode(houseCount, rules, domainWithPosition);
			setClingoCode(code);
		} catch (error: any) {
			setClingoCode("Error: " + error.message);
		}
	};

	// Replace with Clingo integration if available.
	const handleSolve = async () => {
		runClingo(clingoCode)
			.then((res) => {
				if (res.result) {
					let text = `A solution was found, there are ${res.models.more ? "more" : "no other"} models.`;

					Object.entries(res.result).forEach(([house, values]) => {
						text += `\nHouse ${house}:\n`;
						Object.entries(domainMap).forEach(([category, domainElements]) => {
							const value = domainElements.find((v) => values.includes(v));
							text += `  ${category}: ${value || "none"}\n`;
						});
					});
					setSolution(text);
				}
			})
			.catch((error) => {
				setSolution("Error: " + error.message);
			});
	};

	const loadExampleProblem = () => {
		setDomainMap(defaultDomains);
		setHouseCount(5);
		setRules(defaultRules);
	};

	return (
		<div className="container mx-auto p-8">
			<Card className="mb-8">
				<CardHeader>
					<CardTitle className="text-2xl">Zebra Puzzle Solver</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						<div className="flex items-center gap-4">
							<Label htmlFor="houseCount" className="w-32">
								House Count:
							</Label>
							<Input
								type="number"
								id="houseCount"
								value={houseCount}
								onChange={(e) => setHouseCount(parseInt(e.target.value))}
								className="w-20"
							/>
						</div>
						{Math.min(...Object.values(domainMap).map((v) => v.length)) < houseCount && (
							<p className="text-red-500">Warning: The number of houses exceeds the number of values in at least one category.</p>
						)}
						<div>
							<Button onClick={loadExampleProblem} className="mb-4">
								Load Example Problem
							</Button>
						</div>
						<DomainEditor domains={domainMap} onDomainsChange={setDomainMap} houseCount={houseCount} />
						<RuleEditor domains={domainWithPosition} rules={rules} onRulesChange={setRules} />
						<Separator className="my-4" />
						<div className="flex flex-col gap-2">
							<Button onClick={handleGenerateCode}>Generate Clingo Code</Button>
							<ClingoEditor code={clingoCode} setCode={setClingoCode} />
							<Button onClick={handleSolve}>Solve Puzzle</Button>
							<pre className="p-4 bg-gray-100 rounded">{solution}</pre>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default App;
