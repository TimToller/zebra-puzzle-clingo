import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import React, { useEffect, useState } from "react";

export type Rule = {
	leftCategory: string;
	leftValue: string;
	operator: string;
	rightCategory: string;
	rightValue: string;
};

type RuleBuilderProps = {
	onAddRule: (rule: Rule) => void;
	houseCount: number;
};

// Domain definitions; note that "position" values are generated dynamically.
const domains: { [key: string]: string[] } = {
	nationality: ["english", "spain", "ukrain", "norway", "japan"],
	color: ["red", "green", "ivory", "yellow", "blue"],
	drink: ["coffee", "tea", "milk", "orange_juice", "water"],
	pet: ["dog", "snail", "fox", "horse", "zebra"],
	smoke: ["old_gold", "chesterfield", "kool", "lucky_strike", "parliaments"],
	position: [], // generated dynamically
};

const operators = [
	{ value: "same", label: "same as" },
	{ value: "next", label: "next to" },
	{ value: "right", label: "right of" },
	{ value: "left", label: "left of" },
];

const RuleBuilder: React.FC<RuleBuilderProps> = ({ onAddRule, houseCount }) => {
	const [leftCategory, setLeftCategory] = useState("nationality");
	const [leftValue, setLeftValue] = useState("");
	const [operator, setOperator] = useState("same");
	const [rightCategory, setRightCategory] = useState("color");
	const [rightValue, setRightValue] = useState("");

	// Helper to get values based on the category.
	const getValues = (cat: string) => {
		if (cat === "position") {
			const vals: string[] = [];
			for (let i = 1; i <= houseCount; i++) {
				vals.push(i.toString());
			}
			return vals;
		}
		return domains[cat];
	};

	// Update left/right value when category or houseCount changes.
	useEffect(() => {
		const values = getValues(leftCategory);
		setLeftValue(values[0] || "");
	}, [leftCategory, houseCount]);

	useEffect(() => {
		const values = getValues(rightCategory);
		setRightValue(values[0] || "");
	}, [rightCategory, houseCount]);

	const handleAdd = () => {
		onAddRule({ leftCategory, leftValue, operator, rightCategory, rightValue });
	};

	return (
		<div className="flex flex-col gap-4 border p-4 rounded">
			<div className="flex items-center gap-4">
				<Label className="w-32">Left Attribute:</Label>
				<Select value={leftCategory} onValueChange={setLeftCategory}>
					<SelectTrigger className="w-32">{leftCategory}</SelectTrigger>
					<SelectContent>
						{Object.keys(domains).map((cat) => (
							<SelectItem key={cat} value={cat}>
								{cat}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select value={leftValue} onValueChange={setLeftValue}>
					<SelectTrigger className="w-32">{leftValue}</SelectTrigger>
					<SelectContent>
						{getValues(leftCategory).map((val) => (
							<SelectItem key={val} value={val}>
								{val}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="flex items-center gap-4">
				<Label className="w-32">Operator:</Label>
				<Select value={operator} onValueChange={setOperator}>
					<SelectTrigger className="w-32">{operators.find((op) => op.value === operator)?.label}</SelectTrigger>
					<SelectContent>
						{operators.map((op) => (
							<SelectItem key={op.value} value={op.value}>
								{op.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="flex items-center gap-4">
				<Label className="w-32">Right Attribute:</Label>
				<Select value={rightCategory} onValueChange={setRightCategory}>
					<SelectTrigger className="w-32">{rightCategory}</SelectTrigger>
					<SelectContent>
						{Object.keys(domains).map((cat) => (
							<SelectItem key={cat} value={cat}>
								{cat}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select value={rightValue} onValueChange={setRightValue}>
					<SelectTrigger className="w-32">{rightValue}</SelectTrigger>
					<SelectContent>
						{getValues(rightCategory).map((val) => (
							<SelectItem key={val} value={val}>
								{val}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<Button onClick={handleAdd}>Add Rule</Button>
		</div>
	);
};

export default RuleBuilder;
