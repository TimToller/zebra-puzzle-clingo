import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Operator, Rule } from "@/lib/clingoGenerator";

type DomainMap = {
	[category: string]: string[];
};

type InlineRuleEditorProps = {
	domains: DomainMap;
	rules: Rule[];
	onRulesChange: (rules: Rule[]) => void;
};

const operators = [
	{ value: Operator.Same, label: "same as" },
	{ value: Operator.Next, label: "next to" },
	{ value: Operator.Right, label: "right of" },
	{ value: Operator.Left, label: "left of" },
];

export default function RuleEditor({ domains, onRulesChange, rules }: InlineRuleEditorProps) {
	// Update a rule field.
	const updateRule = (index: number, field: keyof Rule, value: string) => {
		const newRules = [...rules];
		newRules[index] = { ...newRules[index], [field]: value } as Rule;
		if (field === "leftCategory") {
			newRules[index].leftValue = domains[value][0];
		}
		if (field === "rightCategory") {
			newRules[index].rightValue = domains[value][0];
		}
		onRulesChange(newRules);
	};

	// Delete a rule.
	const deleteRule = (index: number) => {
		const newRules = [...rules];
		newRules.splice(index, 1);
		onRulesChange(newRules);
	};

	// Add a new rule row.
	const addNewRule = () => {
		const firstCategory = Object.keys(domains)[0] || "";
		const firstValue = domains[firstCategory] ? domains[firstCategory][0] : "";
		const newRule: Rule = {
			leftCategory: firstCategory,
			leftValue: firstValue,
			operator: Operator.Same,
			rightCategory: firstCategory,
			rightValue: firstValue,
		};
		onRulesChange([...rules, newRule]);
	};

	// Get allowed values for a given category.
	const getValues = (category: string) => {
		return domains[category] || [];
	};

	return (
		<div className="flex flex-col gap-2">
			{rules.map((rule, index) => (
				<div key={index} className="flex items-center gap-2 border p-2 rounded">
					{/* Left Category */}
					<Select value={rule.leftCategory} onValueChange={(val) => updateRule(index, "leftCategory", val)}>
						<SelectTrigger className="w-32">{rule.leftCategory}</SelectTrigger>
						<SelectContent>
							{Object.keys(domains).map((cat) => (
								<SelectItem key={cat} value={cat}>
									{cat}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{/* Left Value */}
					<Select value={rule.leftValue} onValueChange={(val) => updateRule(index, "leftValue", val)}>
						<SelectTrigger className="w-32">{rule.leftValue}</SelectTrigger>
						<SelectContent>
							{getValues(rule.leftCategory).map((val) => (
								<SelectItem key={val} value={val}>
									{val}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{/* Operator */}
					<Select value={rule.operator} onValueChange={(val) => updateRule(index, "operator", val)}>
						<SelectTrigger className="w-32">{operators.find((op) => op.value === rule.operator)?.label}</SelectTrigger>
						<SelectContent>
							{operators.map((op) => (
								<SelectItem key={op.value} value={op.value}>
									{op.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{/* Right Category */}
					<Select value={rule.rightCategory} onValueChange={(val) => updateRule(index, "rightCategory", val)}>
						<SelectTrigger className="w-32">{rule.rightCategory}</SelectTrigger>
						<SelectContent>
							{Object.keys(domains).map((cat) => (
								<SelectItem key={cat} value={cat}>
									{cat}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{/* Right Value */}
					<Select value={rule.rightValue} onValueChange={(val) => updateRule(index, "rightValue", val)}>
						<SelectTrigger className="w-32">{rule.rightValue}</SelectTrigger>
						<SelectContent>
							{getValues(rule.rightCategory).map((val) => (
								<SelectItem key={val} value={val}>
									{val}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button variant="destructive" onClick={() => deleteRule(index)}>
						Delete
					</Button>
				</div>
			))}
			<div className="flex justify-end">
				<Button onClick={addNewRule}>New Rule</Button>
			</div>
		</div>
	);
}
