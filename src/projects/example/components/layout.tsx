import * as React from 'react';

export const LayoutComponent = ({ host, content, csrfElement }: { host: string, content: React.ReactElement, csrfElement: string }) => {
	return (
		<html>
			<head>
				<title>TODO</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="stylesheet" href="/static/css/main.css" />
			</head>
			<body>
				<div id="root">{content}</div>
			</body>
		</html>
	);
}