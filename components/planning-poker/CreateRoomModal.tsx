import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Users } from "lucide-react";

interface CreateRoomModalProps {
	onCreateRoom: (roomData: { name: string; hasPassword: boolean; password?: string }) => void;
}

export const CreateRoomModal = ({ onCreateRoom }: CreateRoomModalProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [roomName, setRoomName] = useState("");
	const [hasPassword, setHasPassword] = useState(false);
	const [password, setPassword] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!roomName.trim()) return;

		onCreateRoom({
			name: roomName.trim(),
			hasPassword,
			password: hasPassword ? password : undefined,
		});

		// Reset form
		setRoomName("");
		setPassword("");
		setHasPassword(false);
		setIsOpen(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="hero" size="lg" className="flex items-center gap-2">
					<Plus className="w-5 h-5" />
					Criar Nova Sala
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-[425px] bg-gradient-card border-border">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-foreground">
						<Users className="w-5 h-5" />
						Criar Sala de Planning Poker
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Configure sua sala para estimativas de sprint. Você será o administrador.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6 pt-4">
					<div className="space-y-2">
						<Label htmlFor="roomName" className="text-foreground">
							Nome da Sala
						</Label>
						<Input
							id="roomName"
							placeholder="Ex: Sprint 24 - Planning"
							value={roomName}
							onChange={(e) => setRoomName(e.target.value)}
							className="bg-background border-border"
							required
						/>
					</div>

					<div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
						<div className="space-y-1">
							<Label htmlFor="hasPassword" className="text-foreground font-medium">
								Proteger com senha
							</Label>
							<p className="text-sm text-muted-foreground">
								Apenas usuários com a senha poderão entrar
							</p>
						</div>
						<Switch id="hasPassword" checked={hasPassword} onCheckedChange={setHasPassword} />
					</div>

					{hasPassword && (
						<div className="space-y-2">
							<Label htmlFor="password" className="text-foreground">
								Senha da Sala
							</Label>
							<Input
								id="password"
								type="password"
								placeholder="Digite uma senha"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="bg-background border-border"
								required={hasPassword}
							/>
						</div>
					)}

					<div className="flex gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsOpen(false)}
							className="flex-1"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							variant="secondary"
							className="flex-1"
							disabled={!roomName.trim()}
						>
							Criar Sala
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
