import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { Rule } from "./rule-builder";

type RuleListProps = {
	rules: Rule[];
};

const RuleList: React.FC<RuleListProps> = ({ rules }) => {
	return (
		<div className="mt-4">
			<Card>
				<CardHeader>
					<CardTitle>Added Rules</CardTitle>
				</CardHeader>
				<CardContent>
					<ul>
						{rules.map((rule, idx) => (
							<li key={idx} className="py-1 border-b">
								{rule.leftCategory}; {rule.leftValue} &lt;{rule.operator}&gt; {rule.rightCategory}; {rule.rightValue}
							</li>
						))}
					</ul>
				</CardContent>
			</Card>
		</div>
	);
};

export default RuleList;
