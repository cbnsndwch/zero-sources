import { Outlet } from 'react-router';
import { useState } from 'react';

interface OutletContext {
    isRoomDetailsOpen: boolean;
    setIsRoomDetailsOpen: (open: boolean) => void;
    roomType: 'dm';
}

export default function DLayout() {
    const [isRoomDetailsOpen, setIsRoomDetailsOpen] = useState(false);

    const context: OutletContext = {
        isRoomDetailsOpen,
        setIsRoomDetailsOpen,
        roomType: 'dm'
    };

    return <Outlet context={context} />;
}
