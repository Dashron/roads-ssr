import * as React from 'react';

export const LayoutComponent = ({ host, content, csrfElement }: { host: string, content: React.ReactElement, csrfElement: string }) => {
	return (
		<html>
			<head>
				<title>TODO</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="stylesheet" href="/static/css/main.css" />
				{/* material design icons https://fonts.google.com/icons?selected=Material+Symbols+Outlined:road:FILL@0;wght@400;GRAD@0;opsz@24&icon.query=road&icon.size=24&icon.color=%23e3e3e3 */ }
				<link rel="icon" href="/static/images/favicon.svg" />
			</head>
			<body>
				<div id="root">{content}</div>
			</body>
		</html>
	);
}