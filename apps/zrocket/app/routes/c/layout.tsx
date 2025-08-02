import { Outlet } from 'react-router';
import { useState } from 'react';

interface OutletContext {
    isRoomDetailsOpen: boolean;
    setIsRoomDetailsOpen: (open: boolean) => void;
    roomType: 'channel';
}

export default function CLayout() {
    const [isRoomDetailsOpen, setIsRoomDetailsOpen] = useState(false);

    const context: OutletContext = {
        isRoomDetailsOpen,
        setIsRoomDetailsOpen,
        roomType: 'channel'
    };

    return <Outlet context={context} />;
}
