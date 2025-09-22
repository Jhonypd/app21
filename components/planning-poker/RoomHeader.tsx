import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Copy, Settings, Crown } from "lucide-react";

interface RoomHeaderProps {
	roomId: string;
	roomName: string;
	isAdmin: boolean;
	participantCount: number;
	onCopyRoomId: () => void;
	onSettings?: () => void;
}

export const RoomHeader = ({
	roomId,
	roomName,
	isAdmin,
	participantCount,
	onCopyRoomId,
	onSettings,
}: RoomHeaderProps) => {
	return (
		<Card className="bg-gradient-card border-border p-6 shadow-card">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<h1 className="text-2xl font-bold text-foreground">{roomName}</h1>
						{isAdmin && (
							<Badge variant="secondary" className="bg-gradient-accent text-accent-foreground">
								<Crown className="w-3 h-3 mr-1" />
								Admin
							</Badge>
						)}
					</div>

					<div className="flex items-center gap-4 text-muted-foreground">
						<div className="flex items-center gap-1">
							<Users className="w-4 h-4" />
							<span className="text-sm">{participantCount} participantes</span>
						</div>

						<div className="flex items-center gap-2">
							<span className="text-sm">Sala:</span>
							<Badge variant="outline" className="font-mono">
								{roomId}
							</Badge>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={onCopyRoomId}
						className="flex items-center gap-2"
					>
						<Copy className="w-4 h-4" />
						Copiar ID
					</Button>

					{isAdmin && onSettings && (
						<Button
							variant="admin"
							size="sm"
							onClick={onSettings}
							className="flex items-center gap-2"
						>
							<Settings className="w-4 h-4" />
							Configurações
						</Button>
					)}
				</div>
			</div>
		</Card>
	);
};
