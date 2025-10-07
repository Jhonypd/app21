export function obterCargoLabelProjetos(
  cargoId: number,
): string {
  switch (cargoId) {
    case 0:
      return 'Gerente';
    case 1:
      return 'Analista';
    case 2:
      return 'Desenvolvedor';
    case 3:
      return 'Designer';
    default:
      return 'Cargo não definido';
  }
}
