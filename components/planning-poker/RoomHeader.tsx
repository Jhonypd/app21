import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Users, Copy, Settings, Crown, Sparkles, Timer } from "lucide-react";

interface RoomHeaderProps {
	roomId: string;
	roomName: string;
	isAdmin: boolean;
	participantCount: number;
	isAnimatedMode: boolean;
	onCopyRoomId: () => void;
	onSettings?: () => void;
	onToggleAnimatedMode: (enabled: boolean) => void;
}

export const RoomHeader = ({
	roomId,
	roomName,
	isAdmin,
	participantCount,
	isAnimatedMode,
	onCopyRoomId,
	onSettings,
	onToggleAnimatedMode,
}: RoomHeaderProps) => {
	return (
		<Card className="bg-gradient-card border-border p-6 shadow-card">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<h1 className="text-2xl font-bold text-foreground">{roomName}</h1>
						{isAdmin && (
							<Badge
								variant="secondary"
								className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-accent-foreground"
							>
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

				<div className="flex flex-col sm:flex-row items-center gap-3">
					{/* Mode Toggle */}
					<div className="flex items-center gap-2 bg-muted/30 px-3 py-2 rounded-lg">
						<Timer className="w-4 h-4 text-muted-foreground" />
						<Label htmlFor="animated-mode" className="text-sm cursor-pointer">
							Modo Animado
						</Label>
						<Switch
							id="animated-mode"
							checked={isAnimatedMode}
							onCheckedChange={onToggleAnimatedMode}
						/>
						<Sparkles
							className={`w-4 h-4 transition-colors ${
								isAnimatedMode ? "text-primary animate-pulse" : "text-muted-foreground"
							}`}
						/>
					</div>

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
