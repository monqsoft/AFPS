import ConfigMensalidadeForm from "@/components/config-mensalidade-form";

interface MonthlyFeeTabProps {
  currentValor: number;
}

export function MonthlyFeeTab({ currentValor }: MonthlyFeeTabProps) {
  return (
    <ConfigMensalidadeForm currentValor={currentValor} />
  );
}
