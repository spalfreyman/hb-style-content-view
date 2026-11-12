import type { ReactNode } from 'react';
import StyleContent from './components/style-content';

type ApplicationRoutesProps = {
  children?: ReactNode;
};
/** A custom view has no routes of its own: it renders one panel inside the host page. The shell already requires the "view" permission. */
const ApplicationRoutes = (_props: ApplicationRoutesProps) => <StyleContent />;
ApplicationRoutes.displayName = 'ApplicationRoutes';

export default ApplicationRoutes;
