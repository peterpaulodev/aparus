interface ChartValueTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
}

/**
 * Componente de tooltip personalizado para gráficos
 * Exibe o valor formatado como moeda brasileira (BRL)
 */
export const ChartValueTooltip = ({
  active,
  payload,
}: ChartValueTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-3 shadow-md">
        <p className="text-sm font-medium text-foreground">
          {payload[0].value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </p>
      </div>
    );
  }
  return null;
};