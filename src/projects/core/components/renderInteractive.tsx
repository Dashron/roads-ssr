import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export interface RenderInteractiveProps<P> {
	containerID: string;
	component: React.FunctionComponent<P> & { ScriptName: string; URLPath: string };
	props: P;
	className?: string;
	includeErrorBoundary?: boolean;
}

export type InteractiveComponent<ComponentProps> = React.FC<ComponentProps> & { URLPath: string; ScriptName: string };

export function RenderInteractive<P>({ containerID, component, props, className, includeErrorBoundary = true }: RenderInteractiveProps<P>) {
	// we need the window to make sure we're running in the browser
	// but the extra check for process makes sure we're not in a test environment
	if (typeof window !== 'undefined' && typeof process === 'undefined') {
		throw new Error('THIS ELEMENT MUST ONLY BE RENDERED ON THE SERRVER!!');
	}

	const Component: React.ElementType = component;

	let contents;

	if (includeErrorBoundary) {
		contents = (
			<ErrorBoundary
				fallback={
					<div id={containerID} className={className}>
						Sorry, this part of the page encountered an error! It's been logged and will be investigated as soon as possible.
					</div>
				}
			>
				<Component {...props} />
			</ErrorBoundary>
		);
	} else {
		contents = <Component {...props} />;
	}

	return (
		<>
			<div id={containerID} className={className} data-ssr-props={JSON.stringify(props)}>
				{contents}
			</div>
			<span
				className="hidden"
				dangerouslySetInnerHTML={{
					__html: `<script type="module" data-dd-hydration="${containerID}" data-dd-component="${component.ScriptName}" data-dd-processed="false" src="/static/js/${component.URLPath}.client.js"></script>`
				}}
			></span>
		</>
	);
}
