// A react component that shows an example landing page for a simple framework

import * as React from 'react';
import { RenderInteractive } from '../../core/components/renderInteractive.js';
import { ExampleInteraction } from './ExampleInteraction.client.js';

export const Home = () => {

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<h1 className="text-4xl font-bold mb-4">Welcome to the Example Project!</h1>
			<RenderInteractive
				containerID="example-interaction"
				component={ExampleInteraction}
				props={{}}
			/>
		</div>
	);
}