"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export const emptyValuesPassword = {
	Passwords: {
		password: "",
		confirm_password: "",
	},
};

export interface PasswordsParams {
	password: string;
	confirm_password?: string;
}

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
	isLoading?: boolean;
	password: (value: PasswordsParams) => void;
	isHasError: (value: boolean) => void;
}

const PasswordForm = ({
	className,
	isHasError,
	isLoading,
	...props
}: UserAuthFormProps) => {
	const [password, setPassword] = useState<PasswordsParams>(
		emptyValuesPassword.Passwords,
	);

	const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
		useState<boolean>(false);
	const [errors, setErrors] = useState<{
		password: string | null;
		confirm_password: string | null;
	}>({
		password: null,
		confirm_password: null,
	});

	useEffect(() => {
		const hasErrors = Object.values(errors).some((error) => error !== null);
		isHasError(hasErrors);
	}, [errors, isHasError]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		if (name === "password" || name === "confirm_password") {
			setPassword((prev) => ({
				...prev,
				[name]: value,
			}));

			if (name === "password" && value.length < 8) {
				setErrors((prev) => ({
					...prev,
					password: "A senha deve ter pelo menos 8 caracteres",
				}));
			} else {
				setErrors((prev) => ({ ...prev, password: null }));
			}

			const passwordValue = name === "password" ? value : password.password;
			const confirmPasswordValue =
				name === "confirm_password" ? value : password.confirm_password;

			if (!confirmPasswordValue) {
				setErrors((prev) => ({
					...prev,
					confirm_password: "Preenchimento obrigatório",
				}));
			} else if (passwordValue !== confirmPasswordValue) {
				setErrors((prev) => ({
					...prev,
					confirm_password: "A confirmação da senha deve corresponder à senha",
				}));
			} else {
				setErrors((prev) => ({ ...prev, confirm_password: null }));
			}

			props.password({ password: passwordValue, confirm_password: confirmPasswordValue });
		}
	};

	return (
		<div className="grid w-full gap-4">
			<div className="grid gap-1">
				<Label htmlFor="password">
					Senha <span className="text-red-600">*</span>
				</Label>
				<div className="relative box-border flex w-full items-center justify-between">
					<Input
						className="my-2 min-w-64"
						id="password"
						placeholder="Senha"
						type={isPasswordVisible ? "text" : "password"}
						autoCapitalize="none"
						autoCorrect="off"
						name="password"
						value={password.password}
						onChange={handleChange}
						disabled={isLoading}
					/>
					<fieldset className="absolute right-0 mr-1">
						<Button
							onClick={() => setIsPasswordVisible(!isPasswordVisible)}
							variant={"ghost"}
							size={"icon"}
							className="h-fit w-fit !bg-transparent p-2 hover:!bg-muted"
							type="button">
							{isPasswordVisible ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
						</Button>
					</fieldset>
				</div>
				{errors.password && (
					<p className="text-xs text-red-500 md:text-sm">{errors.password}</p>
				)}
			</div>
			<div className="grid gap-1">
				<Label htmlFor="confirm_password">
					Confirmar Senha <span className="text-red-600">*</span>
				</Label>
				<div className="relative box-border flex w-full items-center justify-between">
					<Input
						className="my-2 min-w-64"
						id="confirm_password"
						placeholder="Confirme sua senha"
						type={isConfirmPasswordVisible ? "text" : "password"}
						autoCapitalize="none"
						autoCorrect="off"
						name="confirm_password"
						value={password.confirm_password}
						onChange={handleChange}
						disabled={isLoading}
					/>
					<fieldset className="absolute right-0 mr-1">
						<Button
							onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
							variant={"ghost"}
							size={"icon"}
							className="h-fit w-fit !bg-transparent p-2 hover:!bg-muted"
							type="button">
							{isConfirmPasswordVisible ? (
								<EyeIcon size={18} />
							) : (
								<EyeOffIcon size={18} />
							)}
						</Button>
					</fieldset>
				</div>
				{errors.confirm_password && (
					<p className="text-xs text-red-500 md:text-sm">{errors.confirm_password}</p>
				)}
			</div>
		</div>
	);
};

export default PasswordForm;
