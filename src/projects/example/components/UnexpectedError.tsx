import * as React from 'react';

export function UnexpectedError({ message }: { message?: string }) {
	return (
		<div className="text-center">
			<h1 className="text-9xl font-bold text-gray-200">500</h1>
			<h2 className="text-4xl font-bold text-gray-200">Internal Server Error</h2>
			<p className="text-gray-300">{message ? message : 'Something went wrong on our end. Please try again later'}.</p>
		</div>
	);
}