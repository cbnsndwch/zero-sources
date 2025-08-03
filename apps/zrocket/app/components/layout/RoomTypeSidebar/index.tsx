import { roomTypes, type RoomTypeSidebarProps } from './contracts';
import RoomTypeButton from './RoomTypeButton';

export default function RoomTypeSidebar({
    activeRoomType,
    setActiveRoomType
}: RoomTypeSidebarProps) {
    return (
        <div className="w-16 bg-muted/30 border-r border-border flex flex-col items-center py-3 space-y-1">
            {roomTypes.map(item => (
                <RoomTypeButton
                    key={item.id}
                    activeRoomType={activeRoomType}
                    setActiveRoomType={setActiveRoomType}
                    {...item}
                />
            ))}
        </div>
    );
}
