import { Outlet } from 'react-router';
import { useState } from 'react';

interface OutletContext {
    isRoomDetailsOpen: boolean;
    setIsRoomDetailsOpen: (open: boolean) => void;
    roomType: 'group';
}

export default function PrivateGroupLayout() {
    const [isRoomDetailsOpen, setIsRoomDetailsOpen] = useState(false);

    const context: OutletContext = {
        isRoomDetailsOpen,
        setIsRoomDetailsOpen,
        roomType: 'group'
    };

    return <Outlet context={context} />;
}
