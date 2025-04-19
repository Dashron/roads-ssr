import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';

export function hydrate(Component: React.FunctionComponent & { ScriptName: string; URLPath: string }) {
	const scriptKey = Component.ScriptName;
	const fn = () => {
		const scripts = document?.querySelectorAll<HTMLScriptElement>(`script[data-dd-component="${scriptKey}"]`);

		if (!scripts.length) {
			console.debug('No hydration scripts found for component', scriptKey);
			return;
		}

		scripts.forEach((script) => {
			let props: Record<string, unknown> = {};
			const containerID = script.dataset.ddHydration;
			if (!containerID) {
				console.debug('Hydration script did not have a container ID');
				return;
			}

			if (script.dataset.ddProcessed === 'true') {
				console.debug('Hydration script already processed');
				return;
			}

			const container = document?.getElementById(containerID);

			if (!container) {
				console.error(`container ${containerID} not found`);
				return;
			}

			if (!container.dataset || !container.dataset.ssrProps) {
				console.error(`No SSR props found for container ${container}`);
				return;
			}

			try {
				props = JSON.parse(container.dataset.ssrProps);
			} catch (e) {
				console.error(`Could not parse hydrated JSON props for container ${container}`);
			}

			// eslint-disable-next-line no-param-reassign
			script.dataset.ddProcessed = 'true';
			hydrateRoot(
				container,
				<ErrorBoundary
					fallback={<span>Sorry, this part of the page encountered an error! It's been logged and will be investigated as soon as possible.</span>}
				>
					<Component {...props} />
				</ErrorBoundary>
			);
		});
	};

	if (typeof window !== 'undefined') {
		fn();
	}
}
