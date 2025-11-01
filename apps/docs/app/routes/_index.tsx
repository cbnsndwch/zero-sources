import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '../layout.config';

export { meta } from './home';

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <HomeLayout {...baseOptions}>{children}</HomeLayout>;
}
