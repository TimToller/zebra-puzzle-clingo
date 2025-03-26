import { DomainMap } from "@/lib/clingoGenerator";
import { useState } from "react";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
type DomainEditorProps = {
	domains: DomainMap;
	onDomainsChange: (domains: DomainMap) => void;
	houseCount: number;
};

export default function DomainEditor({ domains, onDomainsChange, houseCount }: DomainEditorProps) {
	const [category, setCategory] = useState<string>("");
	const [values, setValues] = useState<string>("");

	const [parseError, setParseError] = useState("");

	const inputSchema = z
		.object({
			category: z
				.string()
				.trim()
				.min(1, "Category is required")
				.refine((val) => !Object.keys(domains).includes(val), {
					message: "Category already exists",
				})
				.refine((val) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(val), {
					message: "Category must be a valid identifier (alphanumeric and underscores)",
				}),
			values: z
				.string()
				.trim()
				.min(1, "Values are required")
				.transform((val) => val.split(",").map((v) => v.trim()))
				.refine((valArray) => new Set(valArray).size === valArray.length, {
					message: "Values must be unique",
				})
				.refine((valArray) => valArray.length >= houseCount, {
					message: "Not enough values for the number of houses",
				})
				.refine((valArray) => (valArray || []).every((v) => /^[a-zA-Z0-9_]+$/.test(v)), {
					message: "Values must be alphanumeric and can include underscores",
				}),
		})
		.refine((data) => !data.values.includes(data.category), {
			message: "Category and values cannot be the same",
		});

	const handleAddDomain = () => {
		// Validate input
		const validationResult = inputSchema.safeParse({ category, values });
		if (!validationResult.success) {
			setParseError(validationResult.error.errors[0].message);
			return;
		}

		const newValues = values
			.split(",")
			.map((val) => val.trim())
			.filter((val) => val !== "");
		// Merge with existing if category already exists.
		if (domains[category]) {
			onDomainsChange({
				...domains,
				[category]: Array.from(new Set([...domains[category], ...newValues])),
			});
		} else {
			onDomainsChange({
				...domains,
				[category]: newValues,
			});
		}
		setCategory("");
		setValues("");
		setParseError("");
	};

	const handleDeleteDomain = (cat: string) => {
		const newDomains = { ...domains };
		delete newDomains[cat];
		onDomainsChange(newDomains);
	};

	return (
		<div className="border p-4 rounded mb-4">
			<h2 className="text-xl font-semibold mb-2">Domain Editor</h2>
			<form
				className="flex flex-col gap-2"
				onSubmit={(e) => {
					e.stopPropagation();
					e.preventDefault();
					handleAddDomain();
				}}>
				<div className="flex gap-2 items-center">
					<Label htmlFor="domainCategory" className="w-32">
						Category:
					</Label>
					<Input
						id="domainCategory"
						type="text"
						value={category}
						onChange={(e) => setCategory(e.target.value)}
						placeholder="e.g. nationality"
						className="w-40"
					/>
				</div>
				<div className="flex gap-2 items-center">
					<Label htmlFor="domainValues" className="w-32">
						Values:
					</Label>
					<Input
						id="domainValues"
						type="text"
						value={values}
						onChange={(e) => setValues(e.target.value)}
						placeholder="comma-separated, e.g. red, green, blue"
						className="w-80"
					/>
				</div>
				<div>{parseError && <p className="text-red-500">{parseError}</p>}</div>
				<div>
					<Button type="submit">Add Domain</Button>
				</div>
			</form>
			<div className="mt-4">
				<h3 className="font-medium">Current Domains:</h3>
				{Object.keys(domains).length === 0 && <p>No domains defined.</p>}
				<ul className="space-y-2">
					{Object.entries(domains).map(([cat, vals]) => (
						<li key={cat} className="flex items-center gap-2">
							<Button variant="destructive" size="sm" onClick={() => handleDeleteDomain(cat)}>
								Delete
							</Button>
							<span>
								<strong>{cat}</strong>: {vals.join(", ")}
							</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
