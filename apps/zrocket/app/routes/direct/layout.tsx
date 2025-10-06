import { Outlet, useOutletContext } from 'react-router';

interface MainLayoutContext {
    isRoomDetailsOpen: boolean;
    setIsRoomDetailsOpen: (open: boolean) => void;
}

interface OutletContext extends MainLayoutContext {
    roomType: 'dm';
}

export default function DirectMessagesLayout() {
    const mainContext = useOutletContext<MainLayoutContext>();

    const context: OutletContext = {
        ...mainContext,
        roomType: 'dm'
    };

    return <Outlet context={context} />;
}
