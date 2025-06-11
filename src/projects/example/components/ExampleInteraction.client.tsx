import * as React from 'react';
import { hydrate } from '../../core/components/hydrate.js';


export function ExampleInteraction({  }: {}) {
	const [count, setCount] = React.useState(0);
	return (
		<div className="flex flex-col items-center justify-center border-2 border-gray-300 rounded-lg p-4">
			<span>
				Everything in this box was initially rendered on the server,<br /> 
				and then turned into an interactive component in the browser.
			</span>
			<div>{`Count: ${count}`}</div>
			<button
				onClick={() => {
					setCount(count + 1);
				}}
				className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
			>
				Increment
			</button>
			<button
				onClick={() => {
					setCount(count - 1);
				}}
				className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
			>
				Decrement
			</button>
			<button
				onClick={() => {
					setCount(0);
				}}
				className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
			>
				Reset
			</button>
			<button
				onClick={() => {
					alert(`Count is ${count}`);
				}}
				className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
			>
				Alert Count
			</button>
		</div>
	);
}

ExampleInteraction.ScriptName = 'ExampleInteraction';
ExampleInteraction.URLPath = 'example/components/ExampleInteraction';

hydrate(ExampleInteraction);
