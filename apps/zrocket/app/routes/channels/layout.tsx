import { Outlet, useOutletContext } from 'react-router';

interface MainLayoutContext {
    isRoomDetailsOpen: boolean;
    setIsRoomDetailsOpen: (open: boolean) => void;
}

interface OutletContext extends MainLayoutContext {
    roomType: 'channel';
}

export default function CLayout() {
    const mainContext = useOutletContext<MainLayoutContext>();

    const context: OutletContext = {
        ...mainContext,
        roomType: 'channel'
    };

    return <Outlet context={context} />;
}
