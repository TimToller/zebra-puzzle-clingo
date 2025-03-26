import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import RuleBuilder from "./components/rule-builder";
import RuleList from "./components/rule-list";
import { generateClingoCode, Rule } from "./lib/clingoGenerator";

function App() {
	const [houseCount, setHouseCount] = useState<number>(5);
	const [rules, setRules] = useState<Rule[]>([]);
	const [clingoCode, setClingoCode] = useState<string>("");
	const [solution, setSolution] = useState<string>("");

	const handleAddRule = (rule: Rule) => {
		setRules((prev) => [...prev, rule]);
	};

	const handleGenerateCode = () => {
		const code = generateClingoCode(houseCount, rules);
		setClingoCode(code);
	};

	// Replace this with an actual Clingo integration as needed.
	const handleSolve = () => {
		setSolution("Solution model goes here (integration with clingo.js required)");
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
						<RuleBuilder onAddRule={handleAddRule} houseCount={houseCount} />
						<RuleList rules={rules} />
						<div className="flex flex-col gap-2">
							<Button onClick={handleGenerateCode}>Generate Clingo Code</Button>
							<textarea readOnly value={clingoCode} className="w-full h-40 p-2 border rounded" />
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
