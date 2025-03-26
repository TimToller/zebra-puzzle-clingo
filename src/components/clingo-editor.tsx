import { useState } from "react";
import AceEditor from "react-ace";
import { Button } from "./ui/button";

import "ace-builds/src-noconflict/mode-prolog";
import "ace-builds/src-noconflict/theme-tomorrow";

interface ClingoEditorProps {
	code: string;
	setCode: (code: string) => void;
}
export default function ClingoEditor({ code, setCode }: ClingoEditorProps) {
	const [copied, setCopied] = useState<boolean>(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy code:", err);
		}
	};

	return (
		<div className="relative">
			{/* Copy Button */}
			<div className="absolute top-2 right-2 z-10">
				<Button onClick={handleCopy} size="sm">
					{copied ? "Copied!" : "Copy"}
				</Button>
			</div>
			{/* Ace Editor Component */}
			<AceEditor
				mode="prolog"
				theme="tomorrow"
				name="clingoEditor"
				value={code}
				onChange={(newCode) => setCode(newCode)}
				width="100%"
				height="500px"
				fontSize={14}
				showPrintMargin={false}
				setOptions={{
					useWorker: false,
					tabSize: 2,
				}}
			/>
		</div>
	);
}
