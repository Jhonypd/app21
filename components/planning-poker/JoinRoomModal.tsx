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
import { LogIn, Users } from "lucide-react";
import { CustomButton } from "../ui/custom-button";

interface JoinRoomModalProps {
	onJoinRoom: (roomData: { roomId: string; userName: string; password?: string }) => void;
}

export const JoinRoomModal = ({ onJoinRoom }: JoinRoomModalProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [roomId, setRoomId] = useState("");
	const [userName, setUserName] = useState("");
	const [password, setPassword] = useState("");
	const [needsPassword, setNeedsPassword] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!roomId.trim() || !userName.trim()) return;

		onJoinRoom({
			roomId: roomId.trim().toUpperCase(),
			userName: userName.trim(),
			password: password || undefined,
		});

		// Reset form
		setRoomId("");
		setUserName("");
		setPassword("");
		setNeedsPassword(false);
		setIsOpen(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<CustomButton
					icon={<LogIn className="w-5 h-5" />}
					text="Entrar na sala"
					variant="primary"
				/>
			</DialogTrigger>

			<DialogContent className="sm:max-w-[425px] bg-accent border-border">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-foreground">
						<Users className="w-5 h-5" />
						Entrar em Sala Existente
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Digite o ID da sala e seu nome para participar das estimativas.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6 pt-4">
					<div className="space-y-2">
						<Label htmlFor="roomId" className="text-foreground">
							ID da Sala
						</Label>
						<Input
							id="roomId"
							placeholder="Ex: ABC123"
							value={roomId}
							onChange={(e) => setRoomId(e.target.value.toUpperCase())}
							className="bg-background border-border font-mono"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="userName" className="text-foreground">
							Seu Nome
						</Label>
						<Input
							id="userName"
							placeholder="Ex: João Silva"
							value={userName}
							onChange={(e) => setUserName(e.target.value)}
							className="bg-background border-border"
							required
						/>
					</div>

					{needsPassword && (
						<div className="space-y-2">
							<Label htmlFor="password" className="text-foreground">
								Senha da Sala
							</Label>
							<Input
								id="password"
								type="password"
								placeholder="Digite a senha"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="bg-background border-border"
								required={needsPassword}
							/>
						</div>
					)}

					<div className="flex gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsOpen(false)}
							className="flex-1 uppercase"
						>
							Cancelar
						</Button>
						{/* <Button
							type="submit"
							variant="default"
							className="flex-1 uppercase"
							disabled={!roomId.trim() || !userName.trim()}
						>
							Entrar na Sala
						</Button> */}
						<CustomButton text="Entrar na Sala" variant="primary" />
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
