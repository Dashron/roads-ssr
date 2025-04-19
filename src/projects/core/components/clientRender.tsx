import * as React from 'react';

export function ClientRender({ children, elseChildren }: React.PropsWithChildren<{ elseChildren?: NonNullable<React.ReactNode> }>) {
	const [isMounted, setIsMounted] = React.useState(false);

	React.useEffect(() => {
		setIsMounted(true);
	}, []);

	return <>{isMounted ? children : elseChildren}</>;
}

export function RerenderOnClient({ children }: React.PropsWithChildren) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [isMounted, setIsMounted] = React.useState(false);

	React.useEffect(() => {
		setIsMounted(true);
	}, []);

	return children;
}
