"use client";
import { useState } from "react";
import { CreateRoomModal } from "@/components/planning-poker/CreateRoomModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Users, Target, ArrowLeft } from "lucide-react";
import { RoomHeader } from "@/components/planning-poker/RoomHeader";
import { EstimationTable } from "@/components/planning-poker/EstimationTable";
import { VotingDeck } from "@/components/planning-poker/VotingDeck";
import { JoinRoomModal } from "@/components/planning-poker/JoinRoomModal";
import { toast } from "sonner";

// Mock data structure for demonstration
interface Room {
	id: string;
	name: string;
	hasPassword: boolean;
	admin: string;
	participants: Array<{
		id: string;
		name: string;
		vote?: string;
		hasVoted: boolean;
	}>;
	currentStory: string;
	areVotesRevealed: boolean;
}

const Index = () => {
	const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
	const [currentUser, setCurrentUser] = useState<{
		id: string;
		name: string;
		isAdmin: boolean;
	} | null>(null);
	const [selectedVote, setSelectedVote] = useState<string>();

	const handleCreateRoom = (roomData: {
		name: string;
		hasPassword: boolean;
		password?: string;
	}) => {
		const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
		const userId = Math.random().toString(36).substring(2, 10);

		const newRoom: Room = {
			id: roomId,
			name: roomData.name,
			hasPassword: roomData.hasPassword,
			admin: userId,
			participants: [
				{
					id: userId,
					name: "Admin",
					hasVoted: false,
				},
			],
			currentStory:
				"Como usuário, eu quero poder criar salas de estimativa para que minha equipe possa votar nos PBIs do sprint",
			areVotesRevealed: false,
		};

		setCurrentRoom(newRoom);
		setCurrentUser({ id: userId, name: "Admin", isAdmin: true });

		toast("Sala criada com sucesso!", {
			description: `ID da sala: ${roomId}`,
		});
	};

	const handleJoinRoom = (roomData: { roomId: string; userName: string; password?: string }) => {
		// Mock validation - in real app, this would be a backend call
		const userId = Math.random().toString(36).substring(2, 10);

		const mockRoom: Room = {
			id: roomData.roomId,
			name: "Sprint 24 - Planning",
			hasPassword: false,
			admin: "admin123",
			participants: [
				{ id: "admin123", name: "Scrum Master", hasVoted: true, vote: "8" },
				{ id: "user2", name: "Dev Frontend", hasVoted: true, vote: "5" },
				{ id: "user3", name: "Dev Backend", hasVoted: false },
				{ id: userId, name: roomData.userName, hasVoted: false },
			],
			currentStory:
				"Como usuário, eu quero poder entrar em salas existentes para participar das estimativas",
			areVotesRevealed: false,
		};

		setCurrentRoom(mockRoom);
		setCurrentUser({ id: userId, name: roomData.userName, isAdmin: false });

		toast("Entrou na sala!", {
			description: `Bem-vindo à sala ${roomData.roomId}`,
		});
	};

	const handleVoteSelect = (value: string) => {
		if (!currentRoom || !currentUser) return;

		setSelectedVote(value);

		// Update participant vote status
		const updatedParticipants = currentRoom.participants.map((p) =>
			p.id === currentUser.id ? { ...p, hasVoted: true, vote: value } : p
		);

		setCurrentRoom({ ...currentRoom, participants: updatedParticipants });

		toast("Voto registrado!", {
			description: `Você votou: ${value}`,
		});
	};

	const handleRevealVotes = () => {
		if (!currentRoom) return;
		setCurrentRoom({ ...currentRoom, areVotesRevealed: !currentRoom.areVotesRevealed });
	};

	const handleResetVotes = () => {
		if (!currentRoom) return;

		const resetParticipants = currentRoom.participants.map((p) => ({
			...p,
			hasVoted: false,
			vote: undefined,
		}));

		setCurrentRoom({
			...currentRoom,
			participants: resetParticipants,
			areVotesRevealed: false,
		});

		setSelectedVote(undefined);

		toast("Votos resetados!", {
			description: "Uma nova rodada de votação começou",
		});
	};

	const handleCopyRoomId = () => {
		if (currentRoom) {
			navigator.clipboard.writeText(currentRoom.id);
			toast("ID copiado!", {
				description: "ID da sala copiado para a área de transferência",
			});
		}
	};

	const handleLeaveRoom = () => {
		setCurrentRoom(null);
		setCurrentUser(null);
		setSelectedVote(undefined);
	};

	if (currentRoom && currentUser) {
		return (
			<div className="min-h-screen bg-background p-4 space-y-6">
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center gap-4 mb-6">
						<Button variant="outline" onClick={handleLeaveRoom} className="flex items-center gap-2">
							<ArrowLeft className="w-4 h-4" />
							Sair da Sala
						</Button>
					</div>

					<RoomHeader
						roomId={currentRoom.id}
						roomName={currentRoom.name}
						isAdmin={currentUser.isAdmin}
						participantCount={currentRoom.participants.length}
						onCopyRoomId={handleCopyRoomId}
					/>

					<EstimationTable
						currentStory={currentRoom.currentStory}
						participants={currentRoom.participants}
						areVotesRevealed={currentRoom.areVotesRevealed}
						isAdmin={currentUser.isAdmin}
						onRevealVotes={handleRevealVotes}
						onResetVotes={handleResetVotes}
					/>

					<VotingDeck
						selectedValue={selectedVote}
						onVoteSelect={handleVoteSelect}
						isDisabled={currentRoom.areVotesRevealed}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4 ">
			<div className="max-w-4xl mx-auto text-center space-y-8">
				{/* Hero Section */}
				<div className="space-y-6">
					<div className="flex items-center justify-center mb-8">
						<div className="p-4 bg-gradient-hero rounded-2xl shadow-glow">
							<Zap className="w-12 h-12 text-primary-foreground" />
						</div>
					</div>

					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
						Planning Poker
						<span className="bg-gradient-hero bg-clip-text text-transparent"> Ágil</span>
					</h1>

					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Estimativas colaborativas para suas sprints seguindo a metodologia Scrum. Crie salas,
						convide sua equipe e vote nos PBIs de forma eficiente.
					</p>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<CreateRoomModal onCreateRoom={handleCreateRoom} />
					<JoinRoomModal onJoinRoom={handleJoinRoom} />
				</div>

				{/* Features */}
				<div className="grid md:grid-cols-3 gap-6 mt-16">
					<Card className="bg-gradient-card border-border shadow-card p-6">
						<CardHeader className="pb-4">
							<div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
								<Users className="w-6 h-6 text-primary-foreground" />
							</div>
							<CardTitle className="text-lg text-foreground">Colaboração em Tempo Real</CardTitle>
						</CardHeader>
						<CardContent className="pt-0">
							<p className="text-muted-foreground">
								Trabalhe junto com sua equipe para estimar PBIs de forma síncrona e eficiente.
							</p>
						</CardContent>
					</Card>

					<Card className="bg-gradient-card border-border shadow-card p-6">
						<CardHeader className="pb-4">
							<div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-4">
								<Target className="w-6 h-6 text-secondary-foreground" />
							</div>
							<CardTitle className="text-lg text-foreground">Metodologia Scrum</CardTitle>
						</CardHeader>
						<CardContent className="pt-0">
							<p className="text-muted-foreground">
								Seguindo as melhores práticas ágeis com sequência Fibonacci para estimativas
								precisas.
							</p>
						</CardContent>
					</Card>

					<Card className="bg-gradient-card border-border shadow-card p-6">
						<CardHeader className="pb-4">
							<div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
								<Zap className="w-6 h-6 text-accent-foreground" />
							</div>
							<CardTitle className="text-lg text-foreground">Simples e Rápido</CardTitle>
						</CardHeader>
						<CardContent className="pt-0">
							<p className="text-muted-foreground">
								Interface intuitiva que permite focar no que importa: as estimativas da sua sprint.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default Index;
