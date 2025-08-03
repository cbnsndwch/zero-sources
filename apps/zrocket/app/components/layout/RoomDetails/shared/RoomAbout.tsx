interface RoomAboutProps {
    description: string;
}

export function RoomAbout({ description }: RoomAboutProps) {
    return (
        <div className="space-y-2">
            <h3 className="font-medium text-sm">About</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}
