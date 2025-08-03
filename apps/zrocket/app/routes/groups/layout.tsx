import { Outlet, useOutletContext } from 'react-router';

interface MainLayoutContext {
    isRoomDetailsOpen: boolean;
    setIsRoomDetailsOpen: (open: boolean) => void;
}

interface OutletContext extends MainLayoutContext {
    roomType: 'group';
}

export default function PrivateGroupLayout() {
    const mainContext = useOutletContext<MainLayoutContext>();

    const context: OutletContext = {
        ...mainContext,
        roomType: 'group'
    };

    return <Outlet context={context} />;
}
